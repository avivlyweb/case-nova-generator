import { Groq } from 'npm:groq-sdk';
import { CaseStudy, Section, PubMedArticle } from './types.ts';

export class LangChainService {
  private model: Groq;

  constructor(apiKey: string) {
    this.model = new Groq({
      apiKey: apiKey,
      temperature: 0.5,
    });
  }

  async generateQuickAnalysis(caseStudy: CaseStudy): Promise<string> {
    console.log('Generating quick analysis for case study:', caseStudy.id);
    
    const prompt = `${caseStudy.ai_role}

    Provide insights about the case in a concise, professional manner. 
    Focus on key medical observations, potential implications, and suggested areas for further investigation.
    Format your response using proper markdown, including tables with the | syntax when appropriate.
    Include relevant ICF codes in your analysis using the format b### for body functions, 
    d### for activities and participation, e### for environmental factors, and s### for body structures.

    Patient: ${caseStudy.patient_name}
    Age: ${caseStudy.age}
    Gender: ${caseStudy.gender}
    Medical History: ${caseStudy.medical_history || 'None provided'}
    Presenting Complaint: ${caseStudy.presenting_complaint || 'None provided'}
    Condition: ${caseStudy.condition || 'Not specified'}`;

    try {
      const completion = await this.model.chat.completions.create({
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

      console.log('Quick analysis generated successfully');
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating quick analysis:', error);
      throw error;
    }
  }

  async generateSection(
    sectionTitle: string,
    sectionDescription: string,
    caseStudy: CaseStudy,
    entities: any,
    references: PubMedArticle[]
  ): Promise<Section> {
    console.log(`Generating section: ${sectionTitle}`);
    
    const prompt = `${caseStudy.ai_role}

    Generate the following section for a physiotherapy case study:

    ${sectionTitle}

    Description of what to include:
    ${sectionDescription}

    Case Information:
    Patient Name: ${caseStudy.patient_name}
    Age: ${caseStudy.age}
    Gender: ${caseStudy.gender}
    Condition: ${caseStudy.condition || ''}
    Medical History: ${caseStudy.medical_history || ''}
    Background: ${caseStudy.patient_background || ''}
    Symptoms: ${caseStudy.presenting_complaint || ''}
    Comorbidities: ${caseStudy.comorbidities || ''}
    Psychosocial Factors: ${caseStudy.psychosocial_factors || ''}

    Medical Entities Found:
    ${JSON.stringify(entities, null, 2)}

    Relevant References:
    ${references.map(ref => `[${ref.citation}](${ref.url})`).join('\n')}

    Please ensure your response:
    1. Is evidence-based and suitable for PhD/university level
    2. Uses proper markdown formatting
    3. Includes clinical reasoning
    4. References the provided literature using clickable links [Author et al](URL)
    5. Uses proper markdown table syntax with | for columns when presenting data
    6. Includes evidence levels for each recommendation`;

    try {
      const completion = await this.model.chat.completions.create({
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

      console.log(`Section ${sectionTitle} generated successfully`);
      return {
        title: sectionTitle,
        content: completion.choices[0]?.message?.content || ''
      };
    } catch (error) {
      console.error(`Error generating section ${sectionTitle}:`, error);
      throw error;
    }
  }
}