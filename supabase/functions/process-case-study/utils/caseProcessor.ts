import { Groq } from 'npm:groq-sdk';
import { extractMedicalEntities } from './entityExtraction.ts';
import { extractICFCodes } from './icfExtractor.ts';
import { searchPubMedArticles } from './pubmedIntegration.ts';
import { sections, specializedPrompts } from './sectionConfig.ts';
import { ContextManager } from './contextManager.ts';

const MAX_PROMPT_LENGTH = 3000; // Reduced from 4000
const CHUNK_SIZE = 3; // Process sections in chunks of 3

export async function processCaseStudy(caseStudy: any, action: 'analyze' | 'generate' = 'generate') {
  console.log('Processing case study:', caseStudy.id);
  const groq = new Groq({
    apiKey: Deno.env.get('GROQ_API_KEY') || '',
  });

  try {
    // Extract text for analysis (shortened)
    const textForAnalysis = [
      caseStudy.condition,
      caseStudy.presenting_complaint,
      caseStudy.adl_problem
    ].filter(Boolean).join(' ').slice(0, MAX_PROMPT_LENGTH);

    // Parallel processing of initial data
    const [entities, icfCodes, pubmedArticles] = await Promise.all([
      extractMedicalEntities(textForAnalysis, groq),
      extractICFCodes(textForAnalysis, groq),
      searchPubMedArticles(`${caseStudy.condition} ${caseStudy.presenting_complaint} physiotherapy`)
    ]);

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
      
      Evidence Base:
      ${pubmedArticles.map(article => 
        `- ${article.citation}: ${article.title} (${article.evidenceLevel})`
      ).join('\n')}
      
      Specialization Context:
      ${JSON.stringify(specializationContext, null, 2)}
      
      Extracted Medical Entities:
      ${JSON.stringify(entities, null, 2)}
      
      ICF Codes:
      ${JSON.stringify(icfCodes, null, 2)}`;

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
        medical_entities: entities,
        icf_codes: icfCodes,
        references: pubmedArticles
      };
    }

    // Process sections in chunks
    const generatedSections = [];
    for (let i = 0; i < sections.length; i += CHUNK_SIZE) {
      const sectionChunk = sections.slice(i, i + CHUNK_SIZE);
      const chunkPromises = sectionChunk.map(section => 
        generateSection(groq, section, caseStudy, entities, pubmedArticles)
      );
      
      const chunkResults = await Promise.all(chunkPromises);
      generatedSections.push(...chunkResults);
      
      // Small delay between chunks to prevent rate limiting
      if (i + CHUNK_SIZE < sections.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return {
      sections: generatedSections,
      medical_entities: entities,
      icf_codes: icfCodes,
      analysis: generatedSections[0]?.content,
      references: pubmedArticles
    };
  } catch (error) {
    console.error('Error in processCaseStudy:', error);
    throw error;
  }
}

async function generateSection(groq: Groq, section: any, caseStudy: any, entities: any, pubmedArticles: any) {
  const prompt = `${caseStudy.ai_role}

  Generate the following section for a physiotherapy case study:
  ${section.title}

  Requirements:
  ${section.description}

  Patient Information:
  ${JSON.stringify({
    name: caseStudy.patient_name,
    age: caseStudy.age,
    gender: caseStudy.gender,
    condition: caseStudy.condition,
    complaint: caseStudy.presenting_complaint
  })}

  Medical Entities:
  ${JSON.stringify(entities)}`;

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

  return {
    title: section.title,
    content: completion.choices[0]?.message?.content || ''
  };
}
