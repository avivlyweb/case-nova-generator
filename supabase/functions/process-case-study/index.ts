import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Groq } from 'npm:groq-sdk'
import { extractMedicalEntities } from './utils/entityExtraction.ts'
import { searchPubMed, formatReference } from './utils/pubmedSearch.ts'
import { generateSection } from './utils/sectionGenerator.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const sections = [
  {
    title: "Patient Introduction",
    description: "Collect comprehensive personal and medical history, including demographics, medical history, presenting complaint, contextual information, psychosocial factors, standardized screening tools, and PROMs."
  },
  {
    title: "Interview and Problem List",
    description: "Conduct a detailed clinical interview to identify all pertinent patient issues and concerns. Include specific details from the anamnesis and multidisciplinary insights. Write a full RPS form with all relevant information. Include the Health seeking questions (HSQ) State Patient Identified Problems (PIP's) and Non-Patient Identified Problems (NPIP's)in this case (PIP's)? Formulate 3 hypothesis with a problem and target mediator based on this case."
  },
  {
    title: "Assessment Strategy",
    description: "Elaborate on the assessment strategy ensuring it aligns with the latest clinical standards and guidelines. List special tests and provide a table with outcomes and explanations."
  },
  {
    title: "Assessment Findings",
    description: "Present the findings clearly, prioritizing clarity and clinical utility in the data presentation. Mention pathophysiology and comorbidities."
  },
  {
    title: "Goals/Actions",
    description: "Establish at least 2 short and 2 long SMART goals that are patient-centered and aligned with therapeutic best practices, including integration of PROMs."
  },
  {
    title: "Intervention Plan",
    description: "Describe the Physiotherapy intervention plan in detail, encompassing therapeutic and multidisciplinary dimensions, including patient education, exercise therapy, behavioral approaches, and technological integrations."
  },
  {
    title: "Reassessment",
    description: "Plan for systematic reassessment to gauge therapy effectiveness, incorporating continuous monitoring and data-driven decision making."
  },
  {
    title: "Explanation and Justification",
    description: "Provide thorough justifications for each choice, supported by current research and guidelines such as the Dutch KNGF. Explain and justify your choices in the steps of the HOAC(Hypothesis-Oriented Algorithm for Clinicians II). Integrate evidence in your justification."
  }
];

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

    // Generate sections with PubMed references
    const generatedSections = await Promise.all(
      sections.map(section => 
        generateSection(
          groq,
          section.title,
          section.description,
          caseStudy,
          medicalEntities,
          references
        )
      )
    );

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
