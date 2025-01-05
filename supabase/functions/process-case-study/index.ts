import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Groq } from 'npm:groq-sdk'
import { extractMedicalEntities } from './utils/entityExtraction.ts'
import { searchPubMed, formatReference } from './utils/pubmedSearch.ts'
import { generateSection } from './utils/sectionGenerator.ts'
import { sections } from './utils/sectionConfig.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
            content: "You are a medical assistant analyzing case studies. Provide insights about the case in a concise, professional manner. Focus on key medical observations, potential implications, and suggested areas for further investigation. Format your response using proper markdown, including tables with the | syntax when appropriate. Ensure all tables are properly formatted with column headers separated by | and a header separator row with dashes (---)."
          },
          {
            role: "user",
            content: `Please analyze this medical case study and format the response with proper markdown tables and sections:
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

      console.log('Analysis completed with gemma2-9b-it');

      return new Response(
        JSON.stringify({ 
          analysis: completion.choices[0]?.message?.content || 'No analysis generated',
          success: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract medical entities and continue with generation
    const textForEntityExtraction = `
      ${caseStudy.condition || ''}
      ${caseStudy.medical_history || ''}
      ${caseStudy.presenting_complaint || ''}
      ${caseStudy.comorbidities || ''}
    `;
    
    console.log('Using gemma2-9b-it for entity extraction and section generation');
    
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

    // Generate medications list
    const medicationsPrompt = `Based on the following case study information, generate a list of likely prescribed medications including their purposes and relevant information. Format as a JSON array of objects with 'name', 'purpose', and 'details' properties:
    
    Condition: ${caseStudy.condition}
    Medical History: ${caseStudy.medical_history}
    Comorbidities: ${caseStudy.comorbidities}`;

    const medicationsCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a medical expert generating medication information in JSON format."
        },
        {
          role: "user",
          content: medicationsPrompt
        }
      ],
      model: "gemma2-9b-it",
      temperature: 0.3,
      max_tokens: 1000,
    });

    const medications = JSON.parse(medicationsCompletion.choices[0]?.message?.content || '[]');

    // Generate ICF codes based on the case
    const icfPrompt = `Based on the following case study information, generate relevant ICF codes and their descriptions. Format as a JSON array of strings:
    
    Condition: ${caseStudy.condition}
    ADL Problem: ${caseStudy.adl_problem}
    Medical History: ${caseStudy.medical_history}
    Symptoms: ${caseStudy.presenting_complaint}`;

    const icfCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert in ICF classification generating ICF codes."
        },
        {
          role: "user",
          content: icfPrompt
        }
      ],
      model: "gemma2-9b-it",
      temperature: 0.3,
      max_tokens: 1000,
    });

    const icfCodes = JSON.parse(icfCompletion.choices[0]?.message?.content || '[]');

    // Generate SMART goals
    const goalsPrompt = `Based on the following case study information, generate at least 2 short-term and 2 long-term SMART goals. Format as a JSON array of objects with 'type' (short/long), 'goal', and 'timeline' properties:
    
    Condition: ${caseStudy.condition}
    ADL Problem: ${caseStudy.adl_problem}
    Patient Background: ${caseStudy.patient_background}`;

    const goalsCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a physiotherapy expert generating SMART goals in JSON format."
        },
        {
          role: "user",
          content: goalsPrompt
        }
      ],
      model: "gemma2-9b-it",
      temperature: 0.3,
      max_tokens: 1000,
    });

    const smartGoals = JSON.parse(goalsCompletion.choices[0]?.message?.content || '[]');

    return new Response(
      JSON.stringify({
        success: true,
        sections: generatedSections,
        references,
        medical_entities: medicalEntities,
        medications,
        icf_codes: icfCodes,
        smart_goals: smartGoals,
        assessment_findings: generatedSections.find(s => s.title === "Assessment Findings")?.content || '',
        intervention_plan: generatedSections.find(s => s.title === "Intervention Plan")?.content || '',
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
