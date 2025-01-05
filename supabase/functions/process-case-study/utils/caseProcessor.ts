import { Groq } from 'npm:groq-sdk'
import { extractMedicalEntities } from './entityExtraction.ts'
import { searchPubMed, formatReference } from './pubmedSearch.ts'
import { generateSection } from './sectionGenerator.ts'
import { sections } from './sectionConfig.ts'

export const processCaseStudy = async (caseStudy: any, action: string) => {
  console.log('Starting processCaseStudy with action:', action)
  
  const groq = new Groq({
    apiKey: Deno.env.get('GROQ_API_KEY')
  })

  console.log('Processing case study:', caseStudy.id)

  if (action === 'analyze') {
    console.log('Performing analysis...')
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

  // Extract medical entities from all relevant text fields
  const textForEntityExtraction = `
    Patient Condition: ${caseStudy.condition || ''}
    Medical History: ${caseStudy.medical_history || ''}
    Presenting Complaint: ${caseStudy.presenting_complaint || ''}
    Comorbidities: ${caseStudy.comorbidities || ''}
    ADL Problem: ${caseStudy.adl_problem || ''}
    Background: ${caseStudy.patient_background || ''}
    Psychosocial Factors: ${caseStudy.psychosocial_factors || ''}
  `.trim();
  
  console.log('Extracting medical entities...');
  const medicalEntities = await extractMedicalEntities(textForEntityExtraction, groq);
  console.log('Extracted medical entities:', medicalEntities);

  // Search PubMed
  console.log('Searching PubMed...');
  const pubmedApiKey = Deno.env.get('PUBMED_API_KEY')
  const searchQuery = `${caseStudy.condition} physiotherapy treatment`
  const pubmedArticles = await searchPubMed(searchQuery, pubmedApiKey || '')
  const references = pubmedArticles.map(formatReference)

  console.log('Generated PubMed references:', references)

  // Generate sections
  console.log('Generating sections...');
  const generatedSections = await Promise.all(
    sections.map(section => generateSection(groq, section.title, section.description, caseStudy, medicalEntities, references))
  )

  console.log('All processing completed successfully');
  return {
    success: true,
    sections: generatedSections,
    references,
    medical_entities: medicalEntities,
    assessment_findings: generatedSections.find(s => s.title === "Assessment Findings")?.content || '',
    intervention_plan: generatedSections.find(s => s.title === "Intervention Plan")?.content || '',
  }
}