import { Groq } from 'npm:groq-sdk';
import { CaseStudy, Section } from './types';
import { searchPubMed, fetchClinicalGuidelines } from './evidenceRetrieval';

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateSection(
  groq: Groq,
  sectionTitle: string,
  sectionDescription: string,
  caseStudy: CaseStudy,
  entities: any,
  pubmedReferences: any[]
) {
  console.log(`Generating section: ${sectionTitle}`);
  
  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      const prompt = buildSectionPrompt(sectionTitle, sectionDescription, caseStudy, entities, pubmedReferences);
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert physiotherapist creating detailed case study sections with evidence-based content."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "gemma2-9b-it",
        temperature: 0.5,
        max_tokens: 2000,
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

function buildSectionPrompt(
  sectionTitle: string,
  sectionDescription: string,
  caseStudy: CaseStudy,
  entities: any,
  pubmedReferences: any[]
): string {
  return `Generate the following section for a physiotherapy case study:

${sectionTitle}

Description of what to include:
${sectionDescription}

Case Information:
Patient Name: ${caseStudy.patient_name}
Age: ${caseStudy.age}
Gender: ${caseStudy.gender}
Condition: ${caseStudy.condition}
Medical History: ${caseStudy.medical_history}
Background: ${caseStudy.patient_background}
Symptoms: ${caseStudy.presenting_complaint}
Comorbidities: ${caseStudy.comorbidities}
Psychosocial Factors: ${caseStudy.psychosocial_factors}

Medical Entities Found:
${JSON.stringify(entities, null, 2)}

Evidence Base:
${formatReferences(pubmedReferences)}

Please ensure your response:
1. Is evidence-based and suitable for PhD/university level
2. Uses proper markdown formatting
3. Includes clinical reasoning
4. References the provided literature using clickable links [Author et al](URL)
5. Uses proper markdown table syntax with | for columns when presenting data
6. Includes evidence levels for each recommendation`;
}

function formatReferences(references: any[]): string {
  return references.map(ref => 
    `- ${ref.authors.join(', ')} (${new Date(ref.publicationDate).getFullYear()}). ${ref.title}. ${ref.journal}. Evidence Level: ${ref.evidenceLevel}`
  ).join('\n');
}