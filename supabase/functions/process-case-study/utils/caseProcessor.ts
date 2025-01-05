import { Groq } from 'npm:groq-sdk'
import { extractMedicalEntities } from './entityExtraction.ts'
import { searchPubMed, formatReference } from './pubmedSearch.ts'
import { generateSection } from './sectionGenerator.ts'
import { sections } from './sectionConfig.ts'
import { type ProcessedCaseStudy, type CaseStudy } from './types.ts'

/**
 * Processes a case study by either analyzing it or generating a full report
 * @param caseStudy The case study to process
 * @param action Either 'analyze' for quick analysis or 'generate' for full case study
 * @returns ProcessedCaseStudy containing analysis or full case study data
 */
export const processCaseStudy = async (
  caseStudy: CaseStudy, 
  action: 'analyze' | 'generate'
): Promise<ProcessedCaseStudy> => {
  console.log(`Starting processCaseStudy with action: ${action} for case study ${caseStudy.id}`)
  
  const groq = new Groq({
    apiKey: Deno.env.get('GROQ_API_KEY')
  })

  if (action === 'analyze') {
    return await generateQuickAnalysis(groq, caseStudy)
  }

  return await generateFullCaseStudy(groq, caseStudy)
}

/**
 * Generates a quick analysis of the case study
 */
async function generateQuickAnalysis(groq: Groq, caseStudy: CaseStudy): Promise<ProcessedCaseStudy> {
  console.log('Performing quick analysis...')
  
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a medical assistant analyzing case studies. Provide insights about the case in a concise, professional manner. Focus on key medical observations, potential implications, and suggested areas for further investigation. Format your response using proper markdown, including tables with the | syntax when appropriate."
      },
      {
        role: "user",
        content: `Please analyze this medical case study:
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
  })

  const analysisContent = completion.choices[0]?.message?.content || 'No analysis generated'
  console.log('Analysis completed:', analysisContent)

  return { 
    analysis: analysisContent,
    success: true 
  }
}

/**
 * Generates a full case study report including medical entities, references, and detailed sections
 */
async function generateFullCaseStudy(groq: Groq, caseStudy: CaseStudy): Promise<ProcessedCaseStudy> {
  console.log('Generating full case study...')

  // Extract medical entities from all relevant text fields
  const textForEntityExtraction = buildEntityExtractionText(caseStudy)
  console.log('Extracting medical entities...')
  const medicalEntities = await extractMedicalEntities(textForEntityExtraction, groq)
  console.log('Extracted medical entities:', medicalEntities)

  // Search PubMed for relevant references
  console.log('Searching PubMed...')
  const pubmedApiKey = Deno.env.get('PUBMED_API_KEY')
  const searchQuery = `${caseStudy.condition} physiotherapy treatment`
  const pubmedArticles = await searchPubMed(searchQuery, pubmedApiKey || '')
  const references = pubmedArticles.map(formatReference)
  console.log('Generated PubMed references:', references)

  // Generate all sections
  console.log('Generating sections...')
  const generatedSections = await Promise.all(
    sections.map(section => generateSection(groq, section.title, section.description, caseStudy, medicalEntities, references))
  )

  console.log('All processing completed successfully')
  return {
    success: true,
    sections: generatedSections,
    references,
    medical_entities: medicalEntities,
    assessment_findings: generatedSections.find(s => s.title === "Assessment Findings")?.content || '',
    intervention_plan: generatedSections.find(s => s.title === "Intervention Plan")?.content || '',
  }
}

/**
 * Builds the text to be used for medical entity extraction
 */
function buildEntityExtractionText(caseStudy: CaseStudy): string {
  return `
    Patient Condition: ${caseStudy.condition || ''}
    Medical History: ${caseStudy.medical_history || ''}
    Presenting Complaint: ${caseStudy.presenting_complaint || ''}
    Comorbidities: ${caseStudy.comorbidities || ''}
    ADL Problem: ${caseStudy.adl_problem || ''}
    Background: ${caseStudy.patient_background || ''}
    Psychosocial Factors: ${caseStudy.psychosocial_factors || ''}
  `.trim()
}