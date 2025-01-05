import { Groq } from 'npm:groq-sdk'
import { extractMedicalEntities } from './entityExtraction.ts'
import { searchPubMed, formatReference } from './pubmedSearch.ts'
import { generateSection } from './sectionGenerator.ts'
import { sections } from './sectionConfig.ts'
import { type ProcessedCaseStudy, type CaseStudy } from './types.ts'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

const extractICFCodes = (content: string): string[] => {
  const icfPattern = /\b[bdes]\d{3}\b/gi;
  const matches = content.match(icfPattern) || [];
  return [...new Set(matches)];
};

export const processCaseStudy = async (
  caseStudy: CaseStudy, 
  action: 'analyze' | 'generate'
): Promise<ProcessedCaseStudy> => {
  console.log(`Starting processCaseStudy with action: ${action} for case study ${caseStudy.id}`);
  
  try {
    const groq = new Groq({
      apiKey: Deno.env.get('GROQ_API_KEY')
    });

    if (action === 'analyze') {
      return await generateQuickAnalysis(groq, caseStudy);
    }

    return await generateFullCaseStudy(groq, caseStudy);
  } catch (error) {
    console.error('Error in processCaseStudy:', error);
    
    if (error.message?.toLowerCase().includes('rate limit')) {
      throw new Error('The AI service is currently at capacity. Please try again in a few minutes.');
    }
    
    throw error;
  }
};

async function generateQuickAnalysis(groq: Groq, caseStudy: CaseStudy): Promise<ProcessedCaseStudy> {
  console.log('Performing quick analysis...');
  
  let retries = 0;
  let lastError;

  while (retries < MAX_RETRIES) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a medical assistant analyzing case studies. Provide insights about the case in a concise, professional manner. Focus on key medical observations, potential implications, and suggested areas for further investigation. Format your response using proper markdown, including tables with the | syntax when appropriate. Include relevant ICF codes in your analysis using the format b### for body functions, d### for activities and participation, e### for environmental factors, and s### for body structures."
          },
          {
            role: "user",
            content: `Please analyze this medical case study and include relevant ICF codes:
            Patient: ${caseStudy.patient_name}
            Age: ${caseStudy.age}
            Gender: ${caseStudy.gender}
            Medical History: ${caseStudy.medical_history || 'None provided'}
            Presenting Complaint: ${caseStudy.presenting_complaint || 'None provided'}
            Condition: ${caseStudy.condition || 'Not specified'}`
          }
        ],
        model: "gemma2-9b-it",
        temperature: 0.5,
        max_tokens: 500,
      });

      const analysisContent = completion.choices[0]?.message?.content || 'No analysis generated';
      const icfCodes = extractICFCodes(analysisContent);
      
      console.log('Analysis completed with ICF codes:', icfCodes);

      return { 
        success: true,
        analysis: analysisContent,
        icf_codes: icfCodes
      };
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error);
      lastError = error;
      
      if (error.message?.toLowerCase().includes('rate limit')) {
        await delay(RETRY_DELAY);
        retries++;
        continue;
      }
      
      throw error;
    }
  }

  throw new Error('Maximum retries reached. The AI service is currently unavailable. Please try again later.');
}

async function generateFullCaseStudy(groq: Groq, caseStudy: CaseStudy): Promise<ProcessedCaseStudy> {
  console.log('Generating full case study...');
  let retries = 0;
  let lastError;

  while (retries < MAX_RETRIES) {
    try {
      const textForEntityExtraction = buildEntityExtractionText(caseStudy);
      console.log('Extracting medical entities...');
      const medicalEntities = await extractMedicalEntities(textForEntityExtraction, groq);
      console.log('Extracted medical entities:', medicalEntities);

      console.log('Searching PubMed...');
      const pubmedApiKey = Deno.env.get('PUBMED_API_KEY');
      const searchQuery = `${caseStudy.condition} physiotherapy treatment`;
      const pubmedArticles = await searchPubMed(searchQuery, pubmedApiKey || '');
      const references = pubmedArticles.map(formatReference);
      console.log('Generated PubMed references:', references);

      console.log('Generating sections...');
      const generatedSections = await Promise.all(
        sections.map(section => generateSection(groq, section.title, section.description, caseStudy, medicalEntities, references))
      );

      const allContent = [
        ...generatedSections.map(s => s.content),
        caseStudy.medical_history,
        caseStudy.presenting_complaint,
        caseStudy.assessment_findings,
        caseStudy.intervention_plan
      ].join(' ');
      
      const icfCodes = extractICFCodes(allContent);
      console.log('Extracted ICF codes:', icfCodes);

      return {
        success: true,
        sections: generatedSections,
        references: references || [],
        medical_entities: medicalEntities || {},
        icf_codes: icfCodes,
        assessment_findings: generatedSections.find(s => s.title === "Assessment Findings")?.content || '',
        intervention_plan: generatedSections.find(s => s.title === "Intervention Plan")?.content || '',
        smart_goals: [],
        medications: []
      };
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error);
      lastError = error;
      
      if (error.message?.toLowerCase().includes('rate limit')) {
        await delay(RETRY_DELAY);
        retries++;
        continue;
      }
      
      throw error;
    }
  }

  throw new Error('Maximum retries reached. The AI service is currently unavailable. Please try again later.');
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