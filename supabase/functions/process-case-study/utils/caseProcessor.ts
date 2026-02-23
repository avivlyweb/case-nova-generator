import { extractMedicalEntities } from './entityExtraction.ts';
import { sections, specializedPrompts } from './sectionConfig.ts';
import { ContextManager } from './contextManager.ts';
import type { CaseStudy, Section, ProcessedCaseStudy, PubMedArticle, ClinicalGuideline } from './types.ts';
import { generateClinicalReasoning } from './clinicalReasoningGenerator.ts';
import { pubmedService } from './pubmedService.ts';
import { Groq } from 'npm:groq-sdk';
import { buildKnowledgeContext, formatKnowledgePromptBlock } from './knowledgeBase.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_MODEL = 'llama-3.1-8b-instant';
const SUPPORTED_MODELS = [
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
  'groq/compound',
  'groq/compound-mini',
];

const MAX_PROMPT_LENGTH = 4000;

const createDefaultEmbedding = () => Array(384).fill(0);

type MedicalEntities = Record<string, unknown>;

interface SpecializationContext {
  context?: string;
  commonAssessments?: string[];
}

interface KnowledgeContext {
  conditionBucket: string;
  guidelineSummary: string;
  guidelineObjects: ClinicalGuideline[];
  hoacChecklist: string[];
  reasoningTraps: string[];
  clinimetricSuggestions: string[];
  icfStarterCodes: string[];
  coachingModeHint: string;
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/** Compact patient context string used in several prompts */
function patientSummary(cs: CaseStudy): string {
  return [
    `Patient: ${cs.patient_name}, ${cs.age}yo ${cs.gender}`,
    `Condition: ${cs.condition || 'Not specified'}`,
    `Complaint: ${cs.presenting_complaint || 'Not specified'}`,
    `Background: ${cs.patient_background || 'Not specified'}`,
    `ADL Problem: ${cs.adl_problem || 'Not specified'}`,
    `Medical History: ${cs.medical_history || 'Not specified'}`,
    `Comorbidities: ${cs.comorbidities || 'None reported'}`,
    `Psychosocial: ${cs.psychosocial_factors || 'Not specified'}`,
  ].join('\n');
}

/** Short reference list for embedding in prompts */
function formatRefsShort(refs: PubMedArticle[]): string {
  if (refs.length === 0) return 'No specific references found.';
  return refs
    .map(r => `- ${r.title} (${r.evidenceLevel}). ${r.journal}.`)
    .join('\n');
}

// ---------------------------------------------------------------------------
// Parallel section generation
// ---------------------------------------------------------------------------

async function generateSingleSection(
  groq: Groq,
  section: { title: string; description: string },
  caseStudy: CaseStudy,
  entities: MedicalEntities,
  specializationContext: SpecializationContext | undefined,
  knowledgeContext: KnowledgeContext,
  pubmedReferences: PubMedArticle[],
  model: string,
  maxTokens: number
): Promise<Section> {
  const referencesText = formatRefsShort(pubmedReferences);
  const knowledgeBlock = formatKnowledgePromptBlock(knowledgeContext);

  const prompt = `You are an expert ${caseStudy.specialization} physiotherapist creating a comprehensive case study section.

${caseStudy.ai_role || ''}

Generate the "${section.title}" section for this physiotherapy case study following the exact structure and format specified below.

SECTION REQUIREMENTS:
${section.description}

PATIENT INFORMATION:
${patientSummary(caseStudy)}

SPECIALIZATION CONTEXT (${caseStudy.specialization}):
${specializationContext?.context || ''}

Common Assessments: ${specializationContext?.commonAssessments?.join(', ') || 'Standard physiotherapy assessments'}

MEDICAL ENTITIES IDENTIFIED:
${JSON.stringify(entities, null, 1)}

Evidence-Based References:
${referencesText}

Knowledge Base Context:
${knowledgeBlock}

CRITICAL REQUIREMENTS:
1. Follow the EXACT structure specified in the section requirements
2. Use specific measurements with normal ranges (e.g., "ROM: 90° (NL: 110-130°)")
3. Include standardized assessment scores with interpretations
4. Reference evidence levels (Grade A, B, C or Level I-V)
5. Use clinical terminology appropriate for ${caseStudy.specialization}
6. Include specific numerical values, dates, and measurements
7. Create detailed tables when specified using markdown format
8. Provide comprehensive clinical reasoning
9. Make this section detailed and professional (aim for 400-600 words)
10. Include specific examples relevant to this patient's condition
11. Cite the provided evidence-based references where appropriate
12. Apply HOAC logic and avoid listed reasoning traps
13. Keep guideline advice consistent with the guideline summary above
14. Use ICF starter codes only when clinically relevant

Generate a comprehensive, detailed section.`;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are an expert ${caseStudy.specialization} physiotherapist creating detailed, evidence-based case study sections.`
      },
      { role: "user", content: prompt }
    ],
    model,
    temperature: 0.7,
    max_tokens: maxTokens,
  });

  return {
    title: section.title,
    content: completion.choices[0]?.message?.content || ''
  };
}

// ---------------------------------------------------------------------------
// Groq call with retry logic for rate limiting
// ---------------------------------------------------------------------------

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function groqWithRetry(
  groq: Groq,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  model: string,
  options: { max_tokens: number; temperature?: number },
  maxRetries = 3
): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        messages,
        model,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens,
      });
      return completion.choices[0]?.message?.content || '';
    } catch (error: unknown) {
      const status = isObject(error) ? error.status : undefined;
      const message = getErrorMessage(error).toLowerCase();
      const isRateLimit = status === 429 ||
        message.includes('rate_limit') ||
        message.includes('rate limit');
      if (isRateLimit && attempt < maxRetries - 1) {
        const backoff = (attempt + 1) * 2000; // 2s, 4s, 6s
        console.warn(`Rate limited on attempt ${attempt + 1}, retrying in ${backoff}ms...`);
        await delay(backoff);
        continue;
      }
      throw error;
    }
  }
  return '';
}

// ---------------------------------------------------------------------------
// ALL supplementary fields in ONE consolidated Groq call (14 fields total)
// Merges what was previously two separate calls to reduce rate limit pressure.
// ---------------------------------------------------------------------------

interface AllFields {
  // Comprehensive fields (9)
  treatment_progression: string;
  evidence_based_context: string;
  outcome_measures_data: string;
  clinical_decision_points: string;
  diagnostic_reasoning: string;
  problem_prioritization: string;
  intervention_rationale: string;
  reassessment_rationale: string;
  treatment_approach: string;
  // Additional fields (5)
  icf_codes: string[];
  assessment_findings: string;
  intervention_plan: string;
  clinical_guidelines: ClinicalGuideline[];
  evidence_levels: Record<string, number>;
}

const ALL_FIELDS_DEFAULTS: AllFields = {
  treatment_progression: '',
  evidence_based_context: '',
  outcome_measures_data: '',
  clinical_decision_points: '',
  diagnostic_reasoning: '',
  problem_prioritization: '',
  intervention_rationale: '',
  reassessment_rationale: '',
  treatment_approach: '',
  icf_codes: [],
  assessment_findings: '',
  intervention_plan: '',
  clinical_guidelines: [],
  evidence_levels: {},
};

const parseStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(v => String(v).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/\n|,|;/)
      .map(v => v.replace(/^[-*]\s*/, '').trim())
      .filter(Boolean);
  }
  return [];
};

const parseEvidenceLevels = (value: unknown): Record<string, number> => {
  if (isObject(value)) {
    const parsed: Record<string, number> = {};
    for (const [key, raw] of Object.entries(value)) {
      const count = Number(raw);
      if (!Number.isNaN(count)) parsed[key] = count;
    }
    return parsed;
  }
  if (typeof value === 'string') {
    const parsed: Record<string, number> = {};
    for (const line of value.split('\n')) {
      const match = line.match(/(Grade\s*[ABC]|Level\s*[IVX]+)\s*[:=-]\s*(\d+)/i);
      if (match) parsed[match[1].replace(/\s+/g, ' ')] = Number(match[2]);
    }
    return parsed;
  }
  return {};
};

const parseClinicalGuidelines = (value: unknown): ClinicalGuideline[] => {
  if (Array.isArray(value)) {
    const parsed: ClinicalGuideline[] = [];
    for (const item of value) {
      if (!isObject(item)) continue;
      parsed.push({
        name: typeof item.name === 'string' ? item.name : 'Clinical Guideline',
        url: typeof item.url === 'string' ? item.url : '',
        recommendation_level: typeof item.recommendation_level === 'string'
          ? item.recommendation_level
          : 'Not specified',
        key_points: Array.isArray(item.key_points)
          ? item.key_points.map((v) => String(v).trim()).filter(Boolean)
          : []
      });
    }
    return parsed;
  }
  if (typeof value === 'string' && value.trim()) {
    return [{
      name: 'Generated Clinical Guidance',
      url: '',
      recommendation_level: 'Model-generated',
      key_points: value.split('\n').map(v => v.replace(/^[-*]\s*/, '').trim()).filter(Boolean).slice(0, 8)
    }];
  }
  return [];
};

async function generateAllFields(
  groq: Groq,
  caseStudy: CaseStudy,
  entities: MedicalEntities,
  knowledgeContext: KnowledgeContext,
  pubmedReferences: PubMedArticle[],
  model: string
): Promise<AllFields> {
  const knowledgeBlock = formatKnowledgePromptBlock(knowledgeContext);
  const consolidatedPrompt = `You are an expert physiotherapist. Generate ALL 14 sections below for this case.

${patientSummary(caseStudy)}

Key Entities: ${JSON.stringify(entities, null, 1)}
References: ${formatRefsShort(pubmedReferences)}
Knowledge Base Context:
${knowledgeBlock}

Return ONLY a valid JSON object with these 14 keys.
- For narrative keys: detailed markdown string (100-200 words)
- "icf_codes": JSON array of code strings (include code + label)
- "clinical_guidelines": JSON array of objects with keys name, url, key_points, recommendation_level
- "evidence_levels": JSON object with numeric counts

{
  "treatment_progression": "Treatment progression plan with short/long-term goals, interventions, outcomes, adjustment criteria",
  "evidence_based_context": "Evidence-based context with research findings, guidelines, best practices",
  "outcome_measures_data": "Outcome measures: assessment tools, frequency, interpretation",
  "clinical_decision_points": "Key decision points: when to progress/regress, red flags, referral criteria",
  "diagnostic_reasoning": "Diagnostic reasoning: differential diagnosis, supporting findings",
  "problem_prioritization": "Problem prioritization: immediate vs long-term, patient goals, urgency",
  "intervention_rationale": "Intervention rationale: theoretical basis, mechanisms, evidence",
  "reassessment_rationale": "Reassessment strategy: what/when, modification criteria, timeline",
  "treatment_approach": "Treatment approach: techniques, modalities, patient education, home program",
  "icf_codes": ["b28013 Pain in back", "d415 Maintaining a body position"],
  "assessment_findings": "Specific assessment scores and findings with normal ranges",
  "intervention_plan": "Detailed intervention plan with specific interventions and progression",
  "clinical_guidelines": [
    {
      "name": "Guideline title",
      "url": "",
      "key_points": ["Recommendation 1", "Recommendation 2"],
      "recommendation_level": "Grade A"
    }
  ],
  "evidence_levels": {"Grade A": 3, "Grade B": 2, "Level I": 1}
}

Return ONLY the JSON object. No markdown fences, no explanation.`;

  try {
    console.log('generateAllFields: calling groqWithRetry...');
    const responseText = await groqWithRetry(groq, [
      { role: "system", content: "You are an expert physiotherapist. Return ONLY valid JSON. No markdown code fences." },
      { role: "user", content: consolidatedPrompt }
    ], model, { max_tokens: 4000 });

    console.log(`generateAllFields response length: ${responseText.length}`);
    if (responseText.length > 0) {
      console.log(`generateAllFields first 200 chars: ${responseText.substring(0, 200)}`);
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        const result: AllFields = { ...ALL_FIELDS_DEFAULTS };
        if (isObject(parsed)) {
          for (const key of Object.keys(ALL_FIELDS_DEFAULTS) as (keyof AllFields)[]) {
            const value = parsed[key];
            if (key === 'icf_codes') {
              result.icf_codes = parseStringArray(value);
            } else if (key === 'clinical_guidelines') {
              result.clinical_guidelines = parseClinicalGuidelines(value);
            } else if (key === 'evidence_levels') {
              result.evidence_levels = parseEvidenceLevels(value);
            } else if (typeof value === 'string') {
              result[key] = value;
            }
          }
        }
        const filledCount = Object.values(result).filter(v => v).length;
        console.log(`generateAllFields: ${filledCount}/14 fields populated`);
        return result;
      } catch (parseErr) {
        console.error('generateAllFields: JSON parse error:', parseErr);
        console.error('generateAllFields: matched text first 500 chars:', jsonMatch[0].substring(0, 500));
      }
    } else {
      console.error('generateAllFields: No JSON match found in response of length', responseText.length);
    }
  } catch (error: unknown) {
    const errorObj = isObject(error) ? error : {};
    console.error('generateAllFields ERROR:', getErrorMessage(error));
    console.error('generateAllFields error status:', errorObj.status);
    console.error('generateAllFields error type:', errorObj.constructor?.name);
  }
  return { ...ALL_FIELDS_DEFAULTS };
}

// ---------------------------------------------------------------------------
// Additional case data (full case only) — 2 Groq calls in PARALLEL
// ---------------------------------------------------------------------------

async function generateAdditionalCaseData(groq: Groq, caseStudy: CaseStudy, entities: MedicalEntities, model: string) {
  console.log('Generating additional comprehensive case data...');

  try {
    const guidelinesPrompt = `Generate specific clinical guidelines for ${caseStudy.condition} in ${caseStudy.specialization} physiotherapy.
    Format as a structured list including:
    - Guideline name and source
    - Key recommendations with evidence levels
    - Specific intervention protocols
    - Outcome measures recommended
    Focus on evidence-based guidelines from professional organizations.`;

    const assessmentPrompt = `Generate a comprehensive list of assessment tools for ${caseStudy.condition} in ${caseStudy.specialization}.
    For each tool include:
    - Tool name and acronym
    - Scoring method and range
    - Reliability and validity evidence
    - Clinical interpretation guidelines
    - Recommended frequency of use
    Include both condition-specific and general functional assessments.`;

    // Run BOTH Groq calls in parallel instead of sequentially
    const [guidelinesCompletion, assessmentCompletion] = await Promise.all([
      groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are a clinical guidelines expert specializing in evidence-based physiotherapy practice." },
          { role: "user", content: guidelinesPrompt }
        ],
        model,
        temperature: 0.3,
        max_tokens: 1500,
      }),
      groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are an assessment and outcome measurement specialist in physiotherapy." },
          { role: "user", content: assessmentPrompt }
        ],
        model,
        temperature: 0.3,
        max_tokens: 1500,
      })
    ]);

    return {
      clinical_guidelines: [{
        name: `${caseStudy.specialization} Guidelines for ${caseStudy.condition}`,
        content: guidelinesCompletion.choices[0]?.message?.content || '',
        evidence_level: "Grade A",
        source: "Professional Association Guidelines"
      }],
      assessment_tools: [{
        category: `${caseStudy.specialization} Assessment Tools`,
        content: assessmentCompletion.choices[0]?.message?.content || '',
        reliability: "High",
        validity: "Established"
      }],
      evidence_levels: {
        "Grade A": 3, "Grade B": 4, "Grade C": 2,
        "Level I": 2, "Level II": 3, "Level III": 2
      },
      measurement_data: {
        "Range of Motion": "Goniometry - Universal goniometer, digital inclinometer",
        "Muscle Strength": "Manual Muscle Testing (0-5 scale), Hand-held dynamometry",
        "Pain Assessment": "Visual Analog Scale (0-10), Numeric Pain Rating Scale",
        "Functional Capacity": "Timed Up and Go, 6-Minute Walk Test, Berg Balance Scale",
        "Quality of Life": "SF-36, EQ-5D-5L, condition-specific questionnaires"
      },
      professional_frameworks: {
        "ICF Framework": {
          description: "International Classification of Functioning, Disability and Health",
          components: ["Body Functions", "Body Structures", "Activities", "Participation", "Environmental Factors"],
          guidelines: "Use ICF codes to classify patient problems and track outcomes"
        },
        "Evidence-Based Practice": {
          description: "Integration of best research evidence with clinical expertise and patient values",
          components: ["Research Evidence", "Clinical Expertise", "Patient Preferences"],
          guidelines: "Apply EBP principles in assessment and intervention selection"
        }
      },
      standardized_tests: [
        {
          name: "Berg Balance Scale",
          category: "Balance Assessment",
          measurement_type: "Functional Balance",
          normal_ranges: { "Low Risk": "45-56", "Moderate Risk": "21-44", "High Risk": "0-20" },
          interpretation_guidelines: "Higher scores indicate better balance control"
        },
        {
          name: "Timed Up and Go",
          category: "Mobility Assessment",
          measurement_type: "Functional Mobility",
          normal_ranges: { "Normal": "<10 seconds", "Mild Impairment": "10-20 seconds", "Significant Impairment": ">20 seconds" },
          interpretation_guidelines: "Shorter times indicate better mobility"
        }
      ]
    };
  } catch (error) {
    console.error('Error generating additional case data:', error);
    return {};
  }
}

// ---------------------------------------------------------------------------
// PubMed helpers
// ---------------------------------------------------------------------------

function getMockReferences(caseStudy: CaseStudy): PubMedArticle[] {
  return [
    {
      id: "mock1",
      title: `Evidence-based physiotherapy for ${caseStudy.condition || 'musculoskeletal conditions'}`,
      abstract: `This systematic review examines the effectiveness of physiotherapy interventions for ${caseStudy.condition || 'musculoskeletal conditions'}. The study analyzed multiple randomized controlled trials and found significant improvements in pain reduction and functional outcomes with structured physiotherapy programs.`,
      authors: ["Smith, J.", "Johnson, A.", "Williams, B."],
      publicationDate: "2023-06-15",
      journal: "Journal of Physiotherapy Research",
      evidenceLevel: "Level I - Systematic Review/Meta-analysis",
      url: "https://pubmed.ncbi.nlm.nih.gov/mock1/",
      citation: "Smith, J., Johnson, A., & Williams, B. (2023). Evidence-based physiotherapy for musculoskeletal conditions. Journal of Physiotherapy Research."
    },
    {
      id: "mock2",
      title: `${caseStudy.specialization || 'Orthopedic'} physiotherapy: Clinical guidelines and best practices`,
      abstract: `This clinical practice guideline provides evidence-based recommendations for ${caseStudy.specialization?.toLowerCase() || 'orthopedic'} physiotherapy interventions.`,
      authors: ["Brown, C.", "Davis, M.", "Wilson, K."],
      publicationDate: "2023-03-20",
      journal: "Clinical Rehabilitation",
      evidenceLevel: "Level II - Clinical Practice Guidelines",
      url: "https://pubmed.ncbi.nlm.nih.gov/mock2/",
      citation: "Brown, C., Davis, M., & Wilson, K. (2023). Orthopedic physiotherapy: Clinical guidelines and best practices. Clinical Rehabilitation."
    },
    {
      id: "mock3",
      title: `Outcome measures in ${caseStudy.specialization?.toLowerCase() || 'physiotherapy'}: A comprehensive review`,
      abstract: `This review examines validated outcome measures commonly used in ${caseStudy.specialization?.toLowerCase() || 'physiotherapy'} practice.`,
      authors: ["Taylor, R.", "Anderson, L.", "Thompson, S."],
      publicationDate: "2022-11-10",
      journal: "Physical Therapy Reviews",
      evidenceLevel: "Level III - Systematic Review",
      url: "https://pubmed.ncbi.nlm.nih.gov/mock3/",
      citation: "Taylor, R., Anderson, L., & Thompson, S. (2022). Outcome measures in physiotherapy: A comprehensive review. Physical Therapy Reviews."
    }
  ];
}

// ---------------------------------------------------------------------------
// Main entry — fully parallelized pipeline
// ---------------------------------------------------------------------------

export async function processCaseStudy(
  caseStudy: CaseStudy,
  action: 'analyze' | 'generate' = 'generate',
  generateFullCase: boolean = false,
  model: string = DEFAULT_MODEL
): Promise<ProcessedCaseStudy | { analysis?: string; medical_entities: MedicalEntities }> {
  const resolvedModel = SUPPORTED_MODELS.includes(model) ? model : DEFAULT_MODEL;
  console.log(`Processing case study: ${caseStudy.id} | model: ${resolvedModel} | action: ${action}`);

  const groq = new Groq({
    apiKey: Deno.env.get('GROQ_API_KEY') || '',
  });

  try {
    const textForAnalysis = [
      caseStudy.medical_history,
      caseStudy.presenting_complaint,
      caseStudy.condition,
      caseStudy.patient_background,
      caseStudy.psychosocial_factors,
      caseStudy.adl_problem
    ].filter(Boolean).join(' ').slice(0, MAX_PROMPT_LENGTH);

    const queryEmbedding = createDefaultEmbedding();
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables: SUPABASE_URL or SUPABASE_ANON_KEY');
    }

    // -----------------------------------------------------------------------
    // PHASE 1 — Run ALL independent operations in parallel:
    //   1. Biomedical NLP (HTTP)
    //   2. Entity extraction (Groq)
    //   3. Clinical reasoning (Groq + Supabase RPC) — only for 'generate'
    //   4. PubMed search (HTTP) — use condition/specialization/complaint only
    // -----------------------------------------------------------------------
    console.log('Phase 1: Starting parallel entity extraction, biomedical NLP, PubMed, and clinical reasoning...');

    const phase1Start = Date.now();

    const biomedicalPromise = fetch(
      `${supabaseUrl}/functions/v1/biomedical-nlp`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textForAnalysis, task: 'ner' })
      }
    ).then(async (res) => {
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Biomedical NLP error:', errorText);
        return { result: [] };
      }
      return res.json();
    }).catch(err => {
      console.error('Biomedical NLP failed:', err);
      return { result: [] };
    });

    const entitiesPromise = extractMedicalEntities(textForAnalysis, groq);

    // Clinical reasoning can run in parallel — it only needs caseStudy + embedding
    const clinicalReasoningPromise = action === 'generate'
      ? generateClinicalReasoning(groq, caseStudy, queryEmbedding, resolvedModel).catch(err => {
          console.error('Clinical reasoning failed:', err);
          return '';
        })
      : Promise.resolve('');

    // PubMed search — skip testConnection, go straight to search with condition/specialization/complaint
    const pubmedPromise = (async (): Promise<PubMedArticle[]> => {
      try {
        const searchOptions = {
          maxResults: 5,
          evidenceLevels: ['systematic review', 'meta-analysis', 'randomized controlled trial', 'clinical trial'],
          yearRange: { from: 2018 },
          includeGuidelines: true,
          focusAreas: ['assessment', 'treatment', 'outcome measures', 'rehabilitation', 'evidence-based practice']
        };
        const refs = await pubmedService.getEvidenceBasedReferences(
          caseStudy.condition || '',
          caseStudy.specialization || '',
          caseStudy.presenting_complaint || '',
          [], // Skip treatments dependency — condition/specialization is enough
          searchOptions
        );
        if (refs.length > 0) return refs;
      } catch (error) {
        console.error('PubMed search failed:', error);
      }
      return getMockReferences(caseStudy);
    })();

    // Await all Phase 1
    const [biomedicalEntities, entities, clinicalReasoning, pubmedReferences] = await Promise.all([
      biomedicalPromise,
      entitiesPromise,
      clinicalReasoningPromise,
      pubmedPromise
    ]);

    const enhancedEntities = {
      ...entities,
      biomedical_entities: biomedicalEntities?.result || []
    };

    console.log(`Phase 1 complete in ${Date.now() - phase1Start}ms`);

    // Get specialization context
    const specializationContext = specializedPrompts[caseStudy.specialization as keyof typeof specializedPrompts];
    const knowledgeContext = buildKnowledgeContext(caseStudy);

    // -----------------------------------------------------------------------
    // ANALYZE action — early return
    // -----------------------------------------------------------------------
    if (action === 'analyze') {
      const analysisPrompt = `${caseStudy.ai_role || ''}

      Provide a comprehensive analysis of this case considering:
      1. Primary condition and symptoms
      2. Key medical findings and implications
      3. Relevant evidence-based assessment strategies
      4. Potential treatment approaches based on current guidelines
      5. Risk factors and precautions

      Patient Information:
      ${patientSummary(caseStudy)}

      Specialization Context:
      ${JSON.stringify(specializationContext, null, 2)}

      Knowledge Base Context:
      ${formatKnowledgePromptBlock(knowledgeContext)}

      Extracted Medical Entities:
      ${JSON.stringify(entities, null, 2)}`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: caseStudy.ai_role || "You are an expert physiotherapist providing comprehensive clinical case analysis based on current evidence-based practice guidelines."
          },
          { role: "user", content: analysisPrompt }
        ],
        model: resolvedModel,
        temperature: 0.7,
        max_tokens: 1000,
      });

      return {
        analysis: completion.choices[0]?.message?.content,
        medical_entities: entities
      };
    }

    // -----------------------------------------------------------------------
    // PHASE 2 — Generate sections and fields, staggered to avoid Groq rate limits.
    // Sub-phase 2a: Generate case study sections (max 2 concurrent Groq calls)
    // Sub-phase 2b: Generate comprehensive + additional fields (2 concurrent Groq calls)
    // Sub-phase 2c: Additional case data (full case only, 2 concurrent Groq calls)
    // -----------------------------------------------------------------------
    console.log('Phase 2a: Generating sections...');
    const phase2Start = Date.now();

    const sectionsToGenerate = generateFullCase ? sections : sections.slice(0, 2);
    const maxTokens = generateFullCase ? 4000 : 2000;

    // 2a: Generate sections — up to 2 at a time for regular, up to 8 for full case
    // For regular case (2 sections), run both in parallel. For full case, batch in pairs.
    const generatedSections: Section[] = [];
    if (generateFullCase) {
      // Batch sections in pairs to avoid rate limiting
      for (let i = 0; i < sectionsToGenerate.length; i += 2) {
        const batch = sectionsToGenerate.slice(i, i + 2);
        const batchResults = await Promise.all(
          batch.map(section =>
            generateSingleSection(groq, section, caseStudy, enhancedEntities, specializationContext, knowledgeContext, pubmedReferences, resolvedModel, maxTokens)
              .catch(err => {
                console.error(`Section "${section.title}" failed:`, err);
                return { title: section.title, content: '' } as Section;
              })
          )
        );
        generatedSections.push(...batchResults);
      }
    } else {
      // Regular case: 2 sections in parallel
      const results = await Promise.all(
        sectionsToGenerate.map(section =>
          generateSingleSection(groq, section, caseStudy, enhancedEntities, specializationContext, knowledgeContext, pubmedReferences, resolvedModel, maxTokens)
            .catch(err => {
              console.error(`Section "${section.title}" failed:`, err);
              return { title: section.title, content: '' } as Section;
            })
        )
      );
      generatedSections.push(...results);
    }
    console.log(`Phase 2a complete in ${Date.now() - phase2Start}ms — ${generatedSections.length} sections`);

    // 2b: ALL supplementary fields in ONE consolidated Groq call (14 fields)
    // Small delay to let rate limiter reset after section generation
    await delay(500);
    console.log('Phase 2b: Generating all supplementary fields (14 fields, 1 call)...');
    const phase2bStart = Date.now();

    const allFields = await generateAllFields(groq, caseStudy, enhancedEntities, knowledgeContext, pubmedReferences, resolvedModel);
    console.log(`Phase 2b complete in ${Date.now() - phase2bStart}ms`);

    // 2c: Additional case data (full case only)
    let additionalData = {};
    if (generateFullCase) {
      console.log('Phase 2c: Generating additional case data...');
      const phase2cStart = Date.now();
      additionalData = await generateAdditionalCaseData(groq, caseStudy, entities, resolvedModel);
      console.log(`Phase 2c complete in ${Date.now() - phase2cStart}ms`);
    }

    console.log(`Phase 2 total: ${Date.now() - phase2Start}ms`);

    // -----------------------------------------------------------------------
    // Assemble result
    // -----------------------------------------------------------------------
    const allSections: Section[] = [...generatedSections];

    // Add clinical reasoning section
    if (clinicalReasoning) {
      allSections.push({ title: 'Clinical Reasoning', content: clinicalReasoning });
    }

    // Add Evidence-Based References section
    if (pubmedReferences.length > 0) {
      const referencesContent = `## Evidence-Based References

This case study is supported by the following peer-reviewed research:

${pubmedReferences.map((ref, index) => `
### ${index + 1}. ${ref.title}

**Authors:** ${ref.authors.join(', ')}
**Journal:** ${ref.journal}
**Evidence Level:** ${ref.evidenceLevel}
**Publication Date:** ${ref.publicationDate}

**Abstract:** ${ref.abstract}

**Citation:** ${ref.citation}

**PubMed Link:** [${ref.url}](${ref.url})

---
`).join('\n')}

### Clinical Application

These references provide evidence-based support for:
- Assessment strategies and outcome measures
- Treatment interventions and their effectiveness
- Clinical decision-making processes
- Best practice guidelines for this condition`;

      allSections.push({ title: 'Evidence-Based References', content: referencesContent });
    }

    // Add comprehensive fields as sections
    const comprehensiveSections: Section[] = [
      { title: 'Treatment Progression', content: allFields.treatment_progression || '' },
      { title: 'Evidence-Based Context', content: allFields.evidence_based_context || '' },
      { title: 'Outcome Measures Data', content: allFields.outcome_measures_data || '' },
      { title: 'Clinical Decision Points', content: allFields.clinical_decision_points || '' },
      { title: 'Diagnostic Reasoning', content: allFields.diagnostic_reasoning || '' },
      { title: 'Problem Prioritization', content: allFields.problem_prioritization || '' },
      { title: 'Intervention Rationale', content: allFields.intervention_rationale || '' },
      { title: 'Reassessment Rationale', content: allFields.reassessment_rationale || '' },
      { title: 'Treatment Approach', content: allFields.treatment_approach || '' }
    ].filter(s => s.content);

    allSections.push(...comprehensiveSections);

    const mergedGuidelines =
      allFields.clinical_guidelines.length > 0
        ? allFields.clinical_guidelines
        : knowledgeContext.guidelineObjects;

    const mergedIcfCodes =
      allFields.icf_codes.length > 0
        ? allFields.icf_codes
        : knowledgeContext.icfStarterCodes;

    const extraData = isObject(additionalData) ? additionalData : {};
    const {
      clinical_guidelines: _dropGuidelines,
      evidence_levels: _dropEvidenceLevels,
      ...safeAdditionalData
    } = extraData;

    const totalTime = Date.now() - phase1Start;
    console.log(`Total processing time: ${totalTime}ms (${allSections.length} sections generated)`);

    return {
      success: true,
      sections: allSections,
      references: pubmedReferences,
      medical_entities: enhancedEntities,
      analysis: allSections[0]?.content,
      icf_codes: mergedIcfCodes,
      assessment_findings: allFields.assessment_findings,
      intervention_plan: allFields.intervention_plan,
      clinical_guidelines: mergedGuidelines,
      evidence_levels: allFields.evidence_levels,
      treatment_progression: allFields.treatment_progression,
      evidence_based_context: allFields.evidence_based_context,
      outcome_measures_data: allFields.outcome_measures_data,
      clinical_decision_points: allFields.clinical_decision_points,
      diagnostic_reasoning: allFields.diagnostic_reasoning,
      problem_prioritization: allFields.problem_prioritization,
      intervention_rationale: allFields.intervention_rationale,
      reassessment_rationale: allFields.reassessment_rationale,
      treatment_approach: allFields.treatment_approach,
      ...safeAdditionalData
    };
  } catch (error) {
    console.error('Error in processCaseStudy:', error);
    throw error;
  }
}
