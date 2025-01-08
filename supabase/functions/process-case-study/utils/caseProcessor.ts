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
    // Extract medical entities from all text fields
    const textForAnalysis = [
      caseStudy.medical_history,
      caseStudy.presenting_complaint,
      caseStudy.condition,
      caseStudy.patient_background,
      caseStudy.psychosocial_factors,
      caseStudy.adl_problem
    ].filter(Boolean).join(' ').slice(0, MAX_PROMPT_LENGTH);

    const entities = await extractMedicalEntities(textForAnalysis, groq);
    console.log('Extracted entities:', entities);

    // Initialize context manager with specialization
    const contextManager = new ContextManager(
      caseStudy.specialization,
      specializedPrompts[caseStudy.specialization as keyof typeof specializedPrompts]
    );
    contextManager.setEntities(entities);

    if (action === 'analyze') {
      const analysisPrompt = truncatePrompt(`${caseStudy.ai_role}
      
      Provide insights about this case in a concise, professional manner. 
      Focus on key medical observations, potential implications, and suggested areas for further investigation.
      
      Patient Information:
      ${JSON.stringify(caseStudy, null, 2)}
      
      Extracted Medical Entities:
      ${JSON.stringify(entities, null, 2)}`);

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
      
      const prompt = truncatePrompt(`${contextManager.getPromptContext(section.title)}

${section.description}`);

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
        max_tokens: 1000,
      });

      const sectionContent = completion.choices[0]?.message?.content || '';
      generatedSections.push({
        title: section.title,
        content: sectionContent
      });

      // Add section to context for next iterations
      contextManager.addSection(section.title, sectionContent);
    }

    return {
      sections: generatedSections,
      medical_entities: entities,
      analysis: generatedSections[0]?.content // First section serves as quick analysis
    };
  } catch (error) {
    console.error('Error in processCaseStudy:', error);
    
    // Check for specific error types
    if (error.message?.includes('context_length_exceeded')) {
      throw new Error('The case study content is too long. Please try with a shorter description.');
    }
    
    if (error.message?.includes('rate_limit')) {
      throw new Error('Rate limit exceeded. Please try again in a few minutes.');
    }
    
    throw error;
  }
}

function truncatePrompt(prompt: string): string {
  if (prompt.length <= MAX_PROMPT_LENGTH) return prompt;
  console.warn('Prompt exceeded maximum length, truncating...');
  return prompt.slice(0, MAX_PROMPT_LENGTH) + '...';
}