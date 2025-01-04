import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Groq } from 'npm:groq-sdk'
import { extractMedicalEntities } from './utils/entityExtraction.ts'
import { searchPubMed, formatReference } from './utils/pubmedSearch.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const sections = [
  "Patient Introduction",
  "Interview and Problem List",
  "Assessment Strategy",
  "Assessment Findings", 
  "Goals/Actions to Take",
  "Intervention Plan",
  "Reassessment",
  "Explanation and Justification of Choices",
  "Reference List",
  "Medication Information",
  "ICF Classification"
];

const sectionDescriptions = {
  "Patient Introduction": "Collect comprehensive personal and medical history, including demographics, medical history, presenting complaint, contextual information, psychosocial factors, standardized screening tools, and PROMs.",
  "Interview and Problem List": "Conduct a detailed clinical interview to identify all pertinent patient issues and concerns. Include specific details from the anamnesis and multidisciplinary insights. Write a full RPS form with all relevant information. Include the Health seeking questions (HSQ) State Patient Identified Problems (PIP's) and Non-Patient Identified Problems (NPIP's)in this case (PIP's)? Formulate 3 hypothesis with a problem and target mediator based on this case. Fill out the RPS form with detailed information for a physiotherapy evaluation.",
  "Assessment Strategy": "Elaborate on the assessment strategy ensuring it aligns with the latest clinical standards and guidelines. List special tests and provide a table with outcomes and explanations.",
  "Assessment Findings": "Present the findings clearly, prioritizing clarity and clinical utility in the data presentation. Mention pathophysiology and comorbidities.",
  "Goals/Actions to Take": "Establish at least 2 short and 2 long SMART goals that are patient-centered and aligned with therapeutic best practices, including integration of PROMs.",
  "Intervention Plan": "Describe the Physiotherapy intervention plan in detail, encompassing therapeutic and multidisciplinary dimensions, including patient education, exercise therapy, behavioral approaches, and technological integrations.",
  "Reassessment": "Plan for systematic reassessment to gauge therapy effectiveness, incorporating continuous monitoring and data-driven decision making.",
  "Explanation and Justification of Choices": "Provide thorough justifications for each choice, supported by current research and guidelines such as the Dutch KNGF. Explain and justify your choices in the steps of the HOAC(Hypothesis-Oriented Algorithm for Clinicians II). Integrate evidence in your justification.",
  "Reference List": "List all references from 2019 onwards in APA format, including primary literature and guideline sources used to support the case study's content.",
  "Medication Information": "Provide a list of medications prescribed, including their purposes and relevant information.",
  "ICF Classification": "Assign relevant ICF codes to the case study based on the International Classification of Functioning, Disability and Health."
};

async function generateSection(groq: Groq, sectionTitle: string, caseStudy: any, entities: any, references: string[]) {
  console.log(`Generating section: ${sectionTitle}`);
  
  const prompt = `As an expert physiotherapist educator creating a detailed case study:

Generate the "${sectionTitle}" section.
Description: ${sectionDescriptions[sectionTitle]}

Patient Context:
- Name: ${caseStudy.patient_name}
- Age: ${caseStudy.age}
- Gender: ${caseStudy.gender}
- Condition: ${caseStudy.condition}
- Medical History: ${caseStudy.medical_history}
- Background: ${caseStudy.patient_background}
- Symptoms: ${caseStudy.presenting_complaint}
- Comorbidities: ${caseStudy.comorbidities}
- Psychosocial Factors: ${caseStudy.psychosocial_factors}

Additional Context:
- Medical Entities: ${JSON.stringify(entities)}
- Available References: ${references.join('\n')}

Please ensure your response is:
1. Evidence-based and suitable for PhD/university level
2. Structured with clear headings and subheadings
3. Includes relevant clinical reasoning
4. References the provided literature where appropriate
5. Uses markdown formatting
6. Follows current clinical guidelines`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert physiotherapist educator creating detailed, evidence-based case studies for PhD and university-level education. Your responses should be comprehensive, well-structured, and follow current clinical guidelines."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 2000,
    });

    return completion.choices[0]?.message?.content || `Error generating ${sectionTitle}`;
  } catch (error) {
    console.error(`Error generating section ${sectionTitle}:`, error);
    return `Error generating ${sectionTitle}: ${error.message}`;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseStudy, action = 'generate' } = await req.json();
    
    const groq = new Groq({
      apiKey: Deno.env.get('GROQ_API_KEY')
    });

    console.log('Processing case study:', caseStudy.id);

    if (action === 'analyze') {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a medical assistant analyzing case studies. Provide insights about the case in a concise, professional manner. Focus on key medical observations, potential implications, and suggested areas for further investigation."
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
        model: "mixtral-8x7b-32768",
        temperature: 0.5,
        max_tokens: 500,
      });

      return new Response(
        JSON.stringify({ 
          analysis: completion.choices[0]?.message?.content || 'No analysis generated',
          success: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract medical entities
    const textForEntityExtraction = `
      ${caseStudy.condition || ''}
      ${caseStudy.medical_history || ''}
      ${caseStudy.presenting_complaint || ''}
      ${caseStudy.comorbidities || ''}
    `;
    
    const medicalEntities = await extractMedicalEntities(textForEntityExtraction, groq);
    console.log('Extracted medical entities:', medicalEntities);

    // Search PubMed for relevant articles
    const pubmedApiKey = Deno.env.get('PUBMED_API_KEY');
    const searchQuery = `${caseStudy.condition} physiotherapy treatment`;
    const pubmedArticles = await searchPubMed(searchQuery, pubmedApiKey || '');
    const references = pubmedArticles.map(formatReference);

    console.log('Generated PubMed references:', references);

    // Generate all sections
    const generatedSections = {};
    for (const section of sections) {
      const content = await generateSection(groq, section, caseStudy, medicalEntities, references);
      generatedSections[section.toLowerCase().replace(/\s+/g, '_')] = content;
    }

    return new Response(
      JSON.stringify({
        success: true,
        sections: generatedSections,
        references,
        medical_entities: medicalEntities,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing case study:', error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});