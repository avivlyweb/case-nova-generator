import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Groq } from 'npm:groq-sdk'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const extractMedicalEntities = async (text: string) => {
  const groq = new Groq({
    apiKey: Deno.env.get('GROQ_API_KEY')
  });

  const prompt = `You are a medical entity extractor using BioBERT's approach. Given the following medical text, extract and categorize all medical entities into these categories:
  - Conditions
  - Symptoms
  - Medications
  - Procedures
  - Lab Tests
  - Anatomical Sites
  
  Format the output as a JSON object with these categories as keys and arrays of entities as values.
  
  Text: ${text}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a medical entity extraction system based on BioBERT, specialized in identifying and categorizing medical terminology from clinical text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.2,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    return JSON.parse(response || '{}');
  } catch (error) {
    console.error('Error extracting medical entities:', error);
    return {};
  }
}

const generateSection = async (groq: Groq, caseStudy: any, section: any, entities: any) => {
  console.log(`Generating section: ${section.title}`);
  
  const prompt = `As an expert physiotherapist educator creating high-quality case studies for PhD and university-level education, please generate the following section:

${section.title}

Context:
Patient Name: ${caseStudy.patient_name}
Age: ${caseStudy.age}
Gender: ${caseStudy.gender}
Condition: ${caseStudy.condition}
Medical History: ${caseStudy.medical_history}
Background: ${caseStudy.patient_background}
Symptoms: ${caseStudy.presenting_complaint}
Comorbidities: ${caseStudy.comorbidities}
Psychosocial Factors: ${caseStudy.psychosocial_factors}

Extracted Medical Entities:
${JSON.stringify(entities, null, 2)}

Section Requirements:
${section.description}

Please ensure your response is:
1. Evidence-based and suitable for PhD/university level education
2. Structured with clear headings and subheadings
3. Includes relevant clinical reasoning
4. References current research (2019 onwards)`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert physiotherapist educator creating high-quality case studies for PhD and university-level education. Your responses should be detailed, evidence-based, and follow current clinical guidelines."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.5,
      max_tokens: 2000,
    });

    return {
      title: section.title,
      content: completion.choices[0]?.message?.content || 'Error generating content'
    };
  } catch (error) {
    console.error(`Error generating section ${section.title}:`, error);
    return {
      title: section.title,
      content: `Error generating ${section.title}: ${error.message}`
    };
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

    // Extract medical entities using BioBERT approach
    const textForEntityExtraction = `
      ${caseStudy.condition || ''}
      ${caseStudy.medical_history || ''}
      ${caseStudy.presenting_complaint || ''}
      ${caseStudy.comorbidities || ''}
    `;
    
    const medicalEntities = await extractMedicalEntities(textForEntityExtraction);
    console.log('Extracted medical entities:', medicalEntities);

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

    console.log('Generating case study sections');
    const generatedSections = await Promise.all(
      sections.map(section => generateSection(groq, caseStudy, section, medicalEntities))
    );

    // Generate references
    const referencesCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Generate a list of relevant academic references (2019 onwards) in APA format that support the case study content, focusing on physiotherapy research and clinical guidelines."
        },
        {
          role: "user",
          content: `Generate references for a case study about: ${caseStudy.condition}`
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.5,
      max_tokens: 1000,
    });

    // Extract ICF codes
    const icfCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Extract relevant ICF codes based on the case study information. Format as a JSON array of codes with descriptions."
        },
        {
          role: "user",
          content: `Extract ICF codes for this case:
          Condition: ${caseStudy.condition}
          Symptoms: ${caseStudy.presenting_complaint}
          ADL Problems: ${caseStudy.adl_problem}`
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.3,
      max_tokens: 1000,
    });

    return new Response(
      JSON.stringify({
        success: true,
        sections: generatedSections,
        references: referencesCompletion.choices[0]?.message?.content,
        icf_codes: icfCompletion.choices[0]?.message?.content,
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