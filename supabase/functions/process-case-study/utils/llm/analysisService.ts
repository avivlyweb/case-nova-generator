import { Groq } from 'npm:groq-sdk';
import { LLM_CONFIG } from './modelConfig.ts';
import type { CaseStudy } from '../types.ts';

export class AnalysisService {
  private model: Groq;

  constructor(apiKey: string) {
    this.model = new Groq({
      apiKey,
      temperature: LLM_CONFIG.temperature,
    });
  }

  async generateQuickAnalysis(caseStudy: CaseStudy, guidelines: any = null): Promise<string> {
    console.log('Generating quick analysis for case study:', caseStudy.id);
    
    const guidelinesContext = guidelines ? 
      `Consider these Dutch guidelines: ${JSON.stringify(guidelines.content)}` :
      '';
    
    const prompt = `You are a phd level KNGF physiotherapist analyzing case studies. 
    Provide insights about the case in a concise, professional manner. 
    Focus on key medical observations, potential implications, and suggested areas for further investigation.
    Format your response using proper markdown, including tables with the | syntax when appropriate.
    Include relevant ICF codes in your analysis using the format b### for body functions, 
    d### for activities and participation, e### for environmental factors, and s### for body structures.

    ${guidelinesContext}

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
      model: LLM_CONFIG.model,
      temperature: 0.7,
      max_tokens: LLM_CONFIG.maxTokens,
    });

    console.log('Quick analysis generated successfully');
    return completion.choices[0]?.message?.content || '';
  }
}