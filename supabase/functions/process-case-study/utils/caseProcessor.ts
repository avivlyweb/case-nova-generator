import { Groq } from 'npm:groq-sdk';
import { extractMedicalEntities } from './entityExtraction.ts';
import { sections, specializedPrompts } from './sectionConfig.ts';
import { ContextManager } from './contextManager.ts';
import type { CaseStudy, Section } from './types.ts';

const MAX_PROMPT_LENGTH = 4000; // Groq's limit is around 4096 tokens

export async function processCaseStudy(caseStudy: any, action: 'analyze' | 'generate' = 'generate') {
  console.log('Processing case study:', caseStudy.id);
  const groq = new Groq({
    apiKey: Deno.env.get('GROQ_API_KEY') || '',
  });

  try {
    // Extract medical entities using BiomedNLP
    const textForAnalysis = [
      caseStudy.medical_history,
      caseStudy.presenting_complaint,
      caseStudy.condition,
      caseStudy.patient_background,
      caseStudy.psychosocial_factors,
      caseStudy.adl_problem
    ].filter(Boolean).join(' ').slice(0, MAX_PROMPT_LENGTH);

    // First get biomedical entities
    const biomedicalEntities = await fetch(
      'http://localhost:54321/functions/v1/biomedical-nlp',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: textForAnalysis,
          task: 'ner'
        })
      }
    ).then(res => res.json());

    // Then get regular entities
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

    // Generate full case study
    const generatedSections = [];
    for (const section of sections) {
      console.log(`Generating section: ${section.title}`);
      
      const prompt = `${caseStudy.ai_role}

      Generate the following section for a physiotherapy case study:
      ${section.title}

      Requirements:
      ${section.description}

      Specialization Context:
      ${JSON.stringify(specializationContext, null, 2)}

      Patient Information:
      ${JSON.stringify({
        name: caseStudy.patient_name,
        age: caseStudy.age,
        gender: caseStudy.gender,
        condition: caseStudy.condition,
        complaint: caseStudy.presenting_complaint,
        background: caseStudy.patient_background,
        adl_problem: caseStudy.adl_problem,
        psychosocial_factors: caseStudy.psychosocial_factors
      }, null, 2)}

      Medical Entities:
      ${JSON.stringify(entities, null, 2)}

      Please ensure:
      1. Use specific measurements and standardized assessment scores
      2. Include evidence levels for recommendations
      3. Reference clinical guidelines when applicable
      4. Provide detailed rationale for clinical decisions
      5. Use proper formatting for clarity`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: caseStudy.ai_role
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "gemma2-9b-it",
        temperature: 0.7,
        max_tokens: 2000,
      });

      const sectionContent = completion.choices[0]?.message?.content || '';
      generatedSections.push({
        title: section.title,
        content: sectionContent
      });
    }

    return {
      sections: generatedSections,
      medical_entities: entities,
      analysis: generatedSections[0]?.content
    };
  } catch (error) {
    console.error('Error in processCaseStudy:', error);
    throw error;
  }
}