import { Groq } from 'npm:groq-sdk';
import { createClient } from '@supabase/supabase-js';
import { extractMedicalEntities } from './entityExtraction.ts';
import { searchPubMed, fetchClinicalGuidelines } from './evidenceRetrieval.ts';
import { sections } from './sectionConfig.ts';
import { ProcessedCaseStudy, CaseStudy } from './types.ts';
import { LangChainService } from './langchainService.ts';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

export const processCaseStudy = async (
  caseStudy: CaseStudy, 
  action: 'analyze' | 'generate'
): Promise<ProcessedCaseStudy> => {
  console.log(`Starting processCaseStudy with action: ${action} for case study ${caseStudy.id}`);
  
  try {
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    const pubmedApiKey = Deno.env.get('PUBMED_API_KEY');
    
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY is not set');
    }

    const groq = new Groq({ apiKey: groqApiKey });
    const langchainService = new LangChainService(groqApiKey);

    // Fetch relevant Dutch guidelines if they exist
    const guidelines = await fetchRelevantGuidelines(caseStudy.condition || '');

    if (action === 'analyze') {
      return await generateQuickAnalysis(langchainService, caseStudy, guidelines);
    }

    return await generateFullCaseStudy(groq, langchainService, caseStudy, pubmedApiKey || '', guidelines);
  } catch (error) {
    console.error('Error in processCaseStudy:', error);
    if (error.message?.toLowerCase().includes('rate limit')) {
      throw new Error('The AI service is currently at capacity. Please try again in a few minutes.');
    }
    throw error;
  }
};

async function fetchRelevantGuidelines(condition: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('dutch_guidelines')
    .select('*')
    .eq('condition', condition)
    .single();

  if (error) {
    console.error('Error fetching guidelines:', error);
    return null;
  }

  return data;
}

async function generateQuickAnalysis(
  langchainService: LangChainService,
  caseStudy: CaseStudy,
  guidelines: any
): Promise<ProcessedCaseStudy> {
  console.log('Performing quick analysis...');
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const analysisContent = await langchainService.generateQuickAnalysis(caseStudy, guidelines);
      const icfCodes = extractICFCodes(analysisContent);
      
      return { 
        success: true,
        analysis: analysisContent,
        icf_codes: icfCodes,
        clinical_guidelines: guidelines ? [
          {
            name: "Dutch Guidelines",
            url: guidelines.url,
            key_points: guidelines.content.key_points || [],
            recommendation_level: "Evidence-based"
          }
        ] : []
      };
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error);
      if (error.message?.toLowerCase().includes('rate limit')) {
        await delay(RETRY_DELAY);
        retries++;
        continue;
      }
      throw error;
    }
  }
  throw new Error('Maximum retries reached');
}

async function generateFullCaseStudy(
  groq: Groq,
  langchainService: LangChainService,
  caseStudy: CaseStudy,
  pubmedApiKey: string,
  guidelines: any
): Promise<ProcessedCaseStudy> {
  console.log('Generating full case study...');
  
  // Extract medical entities
  const textForEntityExtraction = buildEntityExtractionText(caseStudy);
  console.log('Extracting medical entities...');
  const medicalEntities = await extractMedicalEntities(textForEntityExtraction, groq);
  
  // Fetch evidence-based content
  console.log('Fetching evidence-based content...');
  const searchQuery = `${caseStudy.condition} physiotherapy treatment`;
  const [pubmedArticles, clinicalGuidelines] = await Promise.all([
    searchPubMed(searchQuery, pubmedApiKey),
    fetchClinicalGuidelines(caseStudy.condition || '')
  ]);

  // Generate sections with evidence integration
  console.log('Generating sections with evidence...');
  const generatedSections = await Promise.all(
    sections.map(section => 
      langchainService.generateSection(
        section.title,
        section.description,
        caseStudy,
        medicalEntities,
        pubmedArticles,
        guidelines
      )
    )
  );

  // Extract ICF codes from all content
  const allContent = [
    ...generatedSections.map(s => s.content),
    caseStudy.medical_history,
    caseStudy.presenting_complaint
  ].join(' ');
  
  const icfCodes = extractICFCodes(allContent);
  
  // Aggregate evidence levels
  const evidenceLevels = {
    ...aggregateEvidenceLevels(pubmedArticles),
    ...(guidelines?.evidence_levels || {})
  };

  return {
    success: true,
    sections: generatedSections,
    references: pubmedArticles,
    medical_entities: medicalEntities,
    icf_codes: icfCodes,
    assessment_findings: generatedSections.find(s => s.title === "Assessment Findings")?.content || '',
    intervention_plan: generatedSections.find(s => s.title === "Intervention Plan")?.content || '',
    clinical_guidelines: [
      ...(guidelines ? [{
        name: "Dutch Guidelines",
        url: guidelines.url,
        key_points: guidelines.content.key_points || [],
        recommendation_level: "Evidence-based"
      }] : []),
      ...clinicalGuidelines
    ],
    evidence_levels: evidenceLevels
  };
}

function buildEntityExtractionText(caseStudy: CaseStudy): string {
  return `
    Patient Condition: ${caseStudy.condition || ''}
    Medical History: ${caseStudy.medical_history || ''}
    Presenting Complaint: ${caseStudy.presenting_complaint || ''}
    Comorbidities: ${caseStudy.comorbidities || ''}
    ADL Problem: ${caseStudy.adl_problem || ''}
    Background: ${caseStudy.patient_background || ''}
    Psychosocial Factors: ${caseStudy.psychosocial_factors || ''}
  `.trim();
}

function extractICFCodes(content: string): string[] {
  const icfPattern = /\b[bdes]\d{3}\b/gi;
  const matches = content.match(icfPattern) || [];
  return [...new Set(matches)];
}

function aggregateEvidenceLevels(articles: any[]): Record<string, number> {
  const levels: Record<string, number> = {};
  articles.forEach(article => {
    levels[article.evidenceLevel] = (levels[article.evidenceLevel] || 0) + 1;
  });
  return levels;
}