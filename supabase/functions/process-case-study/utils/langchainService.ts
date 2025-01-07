import { ChatGroq } from 'npm:groq-sdk';
import { CaseStudy } from './types.ts';

export class LangChainService {
  private model: ChatGroq;

  constructor(apiKey: string) {
    this.model = new ChatGroq({
      apiKey,
      temperature: 0.5,
      modelName: "gemma2-9b-it",
    });
  }

  async generateQuickAnalysis(caseStudy: CaseStudy): Promise<string> {
    const prompt = `You are a phd level KNGF physiotherapist analyzing case studies. 
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

    const completion = await this.model.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a medical analysis system specialized in physiotherapy case studies."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return completion.choices[0]?.message?.content || '';
  }

  async generateSection(
    sectionTitle: string,
    sectionDescription: string,
    caseStudy: CaseStudy,
    entities: any,
    references: any[]
  ): Promise<{ title: string; content: string }> {
    const prompt = `Generate the following section for a physiotherapy case study:

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

    const completion = await this.model.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a medical content generation system specialized in physiotherapy case studies."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return {
      title: sectionTitle,
      content: completion.choices[0]?.message?.content || ''
    };
  }
}