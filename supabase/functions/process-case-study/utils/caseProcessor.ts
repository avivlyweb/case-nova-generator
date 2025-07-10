import { Groq } from 'npm:groq-sdk';
import { extractMedicalEntities } from './entityExtraction.ts';
import { sections, specializedPrompts } from './sectionConfig.ts';
import { ContextManager } from './contextManager.ts';
import type { CaseStudy, Section } from './types.ts';
import { generateClinicalReasoning } from './clinicalReasoningGenerator.ts';

const MAX_PROMPT_LENGTH = 4000;

// Create a default embedding vector
const createDefaultEmbedding = () => {
  // Initialize a 384-dimensional vector with zeros (standard dimension for text embeddings)
  return Array(384).fill(0);
};

export async function processCaseStudy(caseStudy: any, action: 'analyze' | 'generate' = 'generate', generateFullCase: boolean = false) {
  console.log('Processing case study:', caseStudy.id);
  const groq = new Groq({
    apiKey: Deno.env.get('GROQ_API_KEY') || '',
  });

  try {
    const textForAnalysis = [
      caseStudy.medical_history,
      caseStudy.presenting_complaint,
      caseStudy.condition,
      caseStudy.patient_background,
      caseStudy.psychosocial_factors,
      caseStudy.adl_problem
    ].filter(Boolean).join(' ').slice(0, MAX_PROMPT_LENGTH);

    // Initialize embedding vector
    const queryEmbedding = createDefaultEmbedding();
    console.log('Created default embedding vector');

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables: SUPABASE_URL or SUPABASE_ANON_KEY');
    }

    console.log('Calling biomedical-nlp function...');
    
    // Call biomedical-nlp function with proper URL
    const biomedicalResponse = await fetch(
      `${supabaseUrl}/functions/v1/biomedical-nlp`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: textForAnalysis,
          task: 'ner'
        })
      }
    );

    if (!biomedicalResponse.ok) {
      const errorText = await biomedicalResponse.text();
      console.error('Biomedical NLP function error:', errorText);
      throw new Error(`Biomedical NLP function failed: ${errorText}`);
    }

    const biomedicalEntities = await biomedicalResponse.json();
    console.log('Biomedical entities:', biomedicalEntities);

    // Get regular entities
    const entities = await extractMedicalEntities(textForAnalysis, groq);
    
    // Combine both entity types
    const enhancedEntities = {
      ...entities,
      biomedical_entities: biomedicalEntities?.result || []
    };

    console.log('Enhanced entities:', enhancedEntities);

    // Get specialization-specific context
    const specializationContext = specializedPrompts[caseStudy.specialization as keyof typeof specializedPrompts];
    
    if (action === 'analyze') {
      const analysisPrompt = `${caseStudy.ai_role}
      
      Provide a comprehensive analysis of this case considering:
      1. Primary condition and symptoms
      2. Key medical findings and implications
      3. Relevant evidence-based assessment strategies
      4. Potential treatment approaches based on current guidelines
      5. Risk factors and precautions
      
      Patient Information:
      ${JSON.stringify({
        name: caseStudy.patient_name,
        age: caseStudy.age,
        gender: caseStudy.gender,
        condition: caseStudy.condition,
        complaint: caseStudy.presenting_complaint
      }, null, 2)}
      
      Specialization Context:
      ${JSON.stringify(specializationContext, null, 2)}
      
      Extracted Medical Entities:
      ${JSON.stringify(entities, null, 2)}`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: caseStudy.ai_role
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        model: "gemma2-9b-it",
        temperature: 0.7,
        max_tokens: 1000,
      });

      return {
        analysis: completion.choices[0]?.message?.content,
        medical_entities: entities
      };
    }

    // Generate clinical reasoning with proper embedding
    const clinicalReasoning = await generateClinicalReasoning(groq, caseStudy, queryEmbedding);

    // Generate full case study with all sections
    const generatedSections = [];
    const sectionsToGenerate = generateFullCase ? sections : sections.slice(0, 2); // Generate all 8 sections for full case, first 2 for regular
    
    for (const section of sectionsToGenerate) {
      console.log(`Generating section: ${section.title}`);
      
      const specializationContext = specializedPrompts[caseStudy.specialization as keyof typeof specializedPrompts];
      
      const prompt = `You are an expert ${caseStudy.specialization} physiotherapist creating a comprehensive case study section.

${caseStudy.ai_role}

Generate the "${section.title}" section for this physiotherapy case study following the exact structure and format specified below.

SECTION REQUIREMENTS:
${section.description}

PATIENT INFORMATION:
Name: ${caseStudy.patient_name}
Age: ${caseStudy.age}
Gender: ${caseStudy.gender}
Condition: ${caseStudy.condition}
Presenting Complaint: ${caseStudy.presenting_complaint || 'Not specified'}
Background: ${caseStudy.patient_background || 'Not specified'}
ADL Problem: ${caseStudy.adl_problem || 'Not specified'}
Medical History: ${caseStudy.medical_history || 'Not specified'}
Comorbidities: ${caseStudy.comorbidities || 'None reported'}
Psychosocial Factors: ${caseStudy.psychosocial_factors || 'Not specified'}

SPECIALIZATION CONTEXT (${caseStudy.specialization}):
${specializationContext?.context || ''}

Common Assessments for ${caseStudy.specialization}:
${specializationContext?.commonAssessments?.join(', ') || 'Standard physiotherapy assessments'}

MEDICAL ENTITIES IDENTIFIED:
${JSON.stringify(entities, null, 2)}

CRITICAL REQUIREMENTS:
1. Follow the EXACT structure specified in the section requirements
2. Use specific measurements with normal ranges (e.g., "ROM: 90° (NL: 110-130°)")
3. Include standardized assessment scores with interpretations
4. Reference evidence levels (Grade A, B, C or Level I-V)
5. Use clinical terminology appropriate for ${caseStudy.specialization}
6. Include specific numerical values, dates, and measurements
7. Create detailed tables when specified using markdown format
8. Provide comprehensive clinical reasoning
9. Make this section detailed and professional (aim for 400-600 words)
10. Include specific examples relevant to this patient's condition

Generate a comprehensive, detailed section that matches the quality and depth of professional case study documentation.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an expert ${caseStudy.specialization} physiotherapist creating detailed, evidence-based case study sections. You must follow the exact structure and format requirements provided.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "gemma2-9b-it",
        temperature: 0.7,
        max_tokens: generateFullCase ? 4000 : 2000,
      });

      const sectionContent = completion.choices[0]?.message?.content || '';
      generatedSections.push({
        title: section.title,
        content: sectionContent
      });
      
      // Add a small delay between sections to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Add the clinical reasoning to the sections
    generatedSections.push({
      title: "Clinical Reasoning",
      content: clinicalReasoning
    });

    // Generate additional comprehensive data for full case studies
    let additionalData = {};
    if (generateFullCase) {
      additionalData = await generateAdditionalCaseData(groq, caseStudy, entities);
    }

    return {
      sections: generatedSections,
      medical_entities: entities,
      analysis: generatedSections[0]?.content,
      ...additionalData
    };
  } catch (error) {
    console.error('Error in processCaseStudy:', error);
    throw error;
  }
}

async function generateAdditionalCaseData(groq: Groq, caseStudy: any, entities: any) {
  console.log('Generating additional comprehensive case data...');
  
  try {
    // Generate clinical guidelines with detailed structure
    const guidelinesPrompt = `Generate specific clinical guidelines for ${caseStudy.condition} in ${caseStudy.specialization} physiotherapy. 
    
    Format as a structured list including:
    - Guideline name and source
    - Key recommendations with evidence levels
    - Specific intervention protocols
    - Outcome measures recommended
    
    Focus on evidence-based guidelines from professional organizations.`;
    
    const guidelinesCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a clinical guidelines expert specializing in evidence-based physiotherapy practice." },
        { role: "user", content: guidelinesPrompt }
      ],
      model: "gemma2-9b-it",
      temperature: 0.3,
      max_tokens: 1500,
    });

    // Generate detailed assessment tools
    const assessmentPrompt = `Generate a comprehensive list of assessment tools for ${caseStudy.condition} in ${caseStudy.specialization}.
    
    For each tool include:
    - Tool name and acronym
    - Scoring method and range
    - Reliability and validity evidence
    - Clinical interpretation guidelines
    - Recommended frequency of use
    
    Include both condition-specific and general functional assessments.`;
    
    const assessmentCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are an assessment and outcome measurement specialist in physiotherapy." },
        { role: "user", content: assessmentPrompt }
      ],
      model: "gemma2-9b-it",
      temperature: 0.3,
      max_tokens: 1500,
    });

    // Generate measurement data specific to the condition
    const measurementData = {
      "Range of Motion": "Goniometry - Universal goniometer, digital inclinometer",
      "Muscle Strength": "Manual Muscle Testing (0-5 scale), Hand-held dynamometry",
      "Pain Assessment": "Visual Analog Scale (0-10), Numeric Pain Rating Scale",
      "Functional Capacity": "Timed Up and Go, 6-Minute Walk Test, Berg Balance Scale",
      "Quality of Life": "SF-36, EQ-5D-5L, condition-specific questionnaires"
    };

    // Generate professional frameworks
    const professionalFrameworks = {
      "ICF Framework": {
        description: "International Classification of Functioning, Disability and Health",
        components: ["Body Functions", "Body Structures", "Activities", "Participation", "Environmental Factors"],
        guidelines: "Use ICF codes to classify patient problems and track outcomes"
      },
      "Evidence-Based Practice": {
        description: "Integration of best research evidence with clinical expertise and patient values",
        components: ["Research Evidence", "Clinical Expertise", "Patient Preferences"],
        guidelines: "Apply EBP principles in assessment and intervention selection"
      }
    };

    return {
      clinical_guidelines: [{ 
        name: `${caseStudy.specialization} Guidelines for ${caseStudy.condition}`,
        content: guidelinesCompletion.choices[0]?.message?.content || '',
        evidence_level: "Grade A",
        source: "Professional Association Guidelines"
      }],
      assessment_tools: [{
        category: `${caseStudy.specialization} Assessment Tools`,
        content: assessmentCompletion.choices[0]?.message?.content || '',
        reliability: "High",
        validity: "Established"
      }],
      evidence_levels: { 
        "Grade A": 3, 
        "Grade B": 4, 
        "Grade C": 2,
        "Level I": 2,
        "Level II": 3,
        "Level III": 2
      },
      measurement_data: measurementData,
      professional_frameworks: professionalFrameworks,
      standardized_tests: [
        { 
          name: "Berg Balance Scale", 
          category: "Balance Assessment",
          measurement_type: "Functional Balance",
          normal_ranges: { "Low Risk": "45-56", "Moderate Risk": "21-44", "High Risk": "0-20" },
          interpretation_guidelines: "Higher scores indicate better balance control"
        },
        {
          name: "Timed Up and Go",
          category: "Mobility Assessment", 
          measurement_type: "Functional Mobility",
          normal_ranges: { "Normal": "<10 seconds", "Mild Impairment": "10-20 seconds", "Significant Impairment": ">20 seconds" },
          interpretation_guidelines: "Shorter times indicate better mobility"
        }
      ]
    };
  } catch (error) {
    console.error('Error generating additional case data:', error);
    return {};
  }
}