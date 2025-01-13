import { Groq } from 'npm:groq-sdk';
import { sections, specializedPrompts } from './sectionConfig.ts';
import { extractMedicalEntities } from './entityExtraction.ts';
import { ContextManager } from './contextManager.ts';

const groq = new Groq({
  apiKey: Deno.env.get('GROQ_API_KEY') || '',
});

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function processCaseStudy(caseStudy: any, action: 'analyze' | 'generate' = 'generate') {
  console.log('Processing case study:', caseStudy.id);

  try {
    // Extract medical entities from all text fields
    const textForAnalysis = [
      caseStudy.medical_history,
      caseStudy.presenting_complaint,
      caseStudy.condition,
      caseStudy.patient_background,
      caseStudy.psychosocial_factors,
      caseStudy.adl_problem
    ].filter(Boolean).join(' ');

    const entities = await extractMedicalEntities(textForAnalysis, groq);
    console.log('Extracted entities:', entities);

    // Initialize context manager with specialization
    const contextManager = new ContextManager(
      caseStudy.specialization,
      specializedPrompts[caseStudy.specialization as keyof typeof specializedPrompts]
    );
    contextManager.setEntities(entities);

    if (action === 'analyze') {
      const analysisPrompt = `${caseStudy.ai_role}
      
      Provide a concise analysis focusing on key medical observations and implications.
      
      Patient Information:
      ${JSON.stringify(caseStudy, null, 2)}
      
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
      
      try {
        const prompt = `${contextManager.getPromptContext(section.title)}
        ${section.description}
        Return content in clear, professional format.`;

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
        
        // Add a small delay between sections to avoid rate limits
        await sleep(1000);
      } catch (error) {
        console.error(`Error generating section ${section.title}:`, error);
        if (error.message?.includes('rate_limit_exceeded')) {
          await sleep(2000); // Wait longer on rate limit
          continue;
        }
        throw error;
      }
    }

    return {
      sections: generatedSections,
      medical_entities: entities,
      analysis: generatedSections[0]?.content
    };
  } catch (error) {
    console.error('Error in case study processing:', error);
    throw error;
  }
}