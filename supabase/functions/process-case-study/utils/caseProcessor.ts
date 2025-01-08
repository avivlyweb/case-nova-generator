import { Groq } from 'npm:groq-sdk';
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

    if (action === 'analyze') {
      return await generateQuickAnalysis(langchainService, caseStudy);
    }

    // Extract medical entities first
    const textForEntityExtraction = buildEntityExtractionText(caseStudy);
    console.log('Extracting medical entities...');
    const medicalEntities = await extractMedicalEntities(textForEntityExtraction, groq);
    
    // Fetch evidence-based content
    console.log('Fetching evidence-based content...');
    const searchQuery = `${caseStudy.condition} physiotherapy treatment`;
    const [pubmedArticles, clinicalGuidelines] = await Promise.all([
      searchPubMed(searchQuery, pubmedApiKey || ''),
      fetchClinicalGuidelines(caseStudy.condition || '')
    ]);

    // Generate sections with enhanced context
    console.log('Generating sections with evidence...');
    const generatedSections = await Promise.all(
      sections.map(section => 
        generateSection(
          groq,
          section.title,
          section.description,
          caseStudy,
          medicalEntities,
          pubmedArticles
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
    const evidenceLevels = aggregateEvidenceLevels(pubmedArticles);

    return {
      success: true,
      sections: generatedSections,
      references: pubmedArticles,
      medical_entities: medicalEntities,
      icf_codes: icfCodes,
      assessment_findings: generatedSections.find(s => s.title === "Assessment Findings")?.content || '',
      intervention_plan: generatedSections.find(s => s.title === "Intervention Plan")?.content || '',
      clinical_guidelines: clinicalGuidelines,
      evidence_levels: evidenceLevels
    };
  } catch (error) {
    console.error('Error in processCaseStudy:', error);
    throw error;
  }
};

// Helper functions
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
