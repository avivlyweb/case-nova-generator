import { Groq } from 'npm:groq-sdk';
import { CaseStudy, Section, PubMedArticle } from './types.ts';
import { specializedPrompts } from './sectionConfig.ts';

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateSection(
  groq: Groq,
  sectionTitle: string,
  sectionDescription: string,
  caseStudy: CaseStudy,
  entities: any,
  pubmedReferences: PubMedArticle[]
): Promise<Section> {
  console.log(`Generating section: ${sectionTitle}`);
  
  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      const specializedContext = specializedPrompts[caseStudy.specialization as keyof typeof specializedPrompts] || '';
      
      const prompt = `As a specialized ${caseStudy.specialization} physiotherapist, ${specializedContext}

Generate the following section for a physiotherapy case study:

${sectionTitle}

Detailed requirements:
${sectionDescription}

Patient Information:
${JSON.stringify(caseStudy, null, 2)}

Extracted Medical Entities:
${JSON.stringify(entities, null, 2)}

Evidence Base:
${formatReferences(pubmedReferences)}

Requirements:
1. Be extremely detailed and specific
2. Use proper markdown formatting
3. Include clinical reasoning
4. Reference the provided literature using clickable links [Author et al](URL)
5. Use markdown tables with | syntax for data presentation
6. Include evidence levels for recommendations
7. Integrate the specialized context for ${caseStudy.specialization} physiotherapy
8. Consider the extracted medical entities in your analysis`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an expert ${caseStudy.specialization} physiotherapist creating detailed, evidence-based case study sections.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 3000,
      });

      const content = completion.choices[0]?.message?.content || 'Error generating content';
      console.log(`Section ${sectionTitle} generated successfully`);
      
      return {
        title: sectionTitle,
        content: content
      };
    } catch (error) {
      console.error(`Attempt ${retries + 1} for section ${sectionTitle} failed:`, error);
      if (error.message?.toLowerCase().includes('rate limit')) {
        await delay(RETRY_DELAY);
        retries++;
        continue;
      }
      throw error;
    }
  }
  throw new Error(`Maximum retries reached for section ${sectionTitle}`);
}

function formatReferences(references: PubMedArticle[]): string {
  return references.map(ref => 
    `- ${ref.authors.join(', ')} (${new Date(ref.publicationDate).getFullYear()}). ${ref.title}. ${ref.journal}. Evidence Level: ${ref.evidenceLevel}`
  ).join('\n');
}