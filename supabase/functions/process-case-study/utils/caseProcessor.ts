import { Groq } from "npm:groq-sdk";
import { extractMedicalEntities } from './entityExtraction.ts';
import { searchPubMed } from './evidenceRetrieval.ts';
import { sections } from './sectionConfig.ts';
import { ProcessedCaseStudy, CaseStudy } from './types.ts';
import { AnalysisService } from './analysisService.ts';
import { SearchService } from './searchService.ts';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const pubmedApiKey = Deno.env.get('PUBMED_API_KEY');
    
    if (!groqApiKey || !supabaseUrl || !supabaseKey) {
      throw new Error('Required environment variables are not set');
    }

    const analysisService = new AnalysisService(supabaseUrl, supabaseKey, groqApiKey);
    const searchService = new SearchService(supabaseUrl, supabaseKey, groqApiKey);

    if (action === 'analyze') {
      let retries = 0;
      while (retries < MAX_RETRIES) {
        try {
          return await analysisService.generateQuickAnalysis(caseStudy, null);
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

    return await generateFullCaseStudy(
      groqApiKey,
      caseStudy,
      pubmedApiKey || '',
      searchService
    );
  } catch (error) {
    console.error('Error in processCaseStudy:', error);
    if (error.message?.toLowerCase().includes('rate limit')) {
      throw new Error('The AI service is currently at capacity. Please try again in a few minutes.');
    }
    throw error;
  }
};

async function generateFullCaseStudy(
  groqApiKey: string,
  caseStudy: CaseStudy,
  pubmedApiKey: string,
  searchService: SearchService
): Promise<ProcessedCaseStudy> {
  console.log('Generating full case study...');
  
  const groq = new Groq({ apiKey: groqApiKey });
  
  // Extract medical entities
  const textForEntityExtraction = buildEntityExtractionText(caseStudy);
  console.log('Extracting medical entities...');
  const medicalEntities = await extractMedicalEntities(textForEntityExtraction, groq);
  
  // Fetch evidence-based content
  console.log('Fetching evidence-based content...');
  const [pubmedArticles, relevantGuidelines] = await Promise.all([
    searchPubMed(caseStudy.condition || '', pubmedApiKey),
    searchService.searchGuidelines(caseStudy.condition || '')
  ]);

  // Generate sections with evidence integration
  console.log('Generating sections with evidence...');
  const generatedSections = await Promise.all(
    sections.map(section => 
      generateSection(
        section.title,
        section.description,
        caseStudy,
        medicalEntities,
        pubmedArticles,
        relevantGuidelines
      )
    )
  );

  return {
    success: true,
    sections: generatedSections,
    references: pubmedArticles,
    medical_entities: medicalEntities,
    icf_codes: extractICFCodes(generatedSections.map(s => s.content).join(' ')),
    assessment_findings: generatedSections.find(s => s.title === "Assessment Findings")?.content || '',
    intervention_plan: generatedSections.find(s => s.title === "Intervention Plan")?.content || '',
    clinical_guidelines: relevantGuidelines.map(g => ({
      name: g.title,
      url: g.url || `https://richtlijnendatabase.nl/search?q=${encodeURIComponent(g.condition)}`,
      key_points: g.content?.key_points || [],
      recommendation_level: "Evidence-based"
    }))
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

async function generateSection(
  title: string,
  description: string,
  caseStudy: any,
  medicalEntities: any,
  pubmedArticles: any,
  guidelines: any
) {
  const groq = new Groq({
    apiKey: Deno.env.get('GROQ_API_KEY')!
  });

  const prompt = `Generate a detailed ${title} section for a physiotherapy case study.
    Consider:
    - Patient condition: ${caseStudy.condition}
    - Medical history: ${caseStudy.medical_history}
    - Current symptoms: ${caseStudy.presenting_complaint}
    
    Include relevant information from:
    - Medical entities: ${JSON.stringify(medicalEntities)}
    - Evidence: ${JSON.stringify(pubmedArticles.slice(0, 3))}
    - Guidelines: ${JSON.stringify(guidelines)}
    
    ${description}
    
    Format the response in markdown.`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "mixtral-8x7b-32768",
    temperature: 0.7,
    max_tokens: 2048,
  });

  return {
    title,
    content: completion.choices[0]?.message?.content || ''
  };
}