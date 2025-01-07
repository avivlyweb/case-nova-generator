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

  async generateEmbedding(text: string): Promise<number[]> {
    console.log('Generating embedding for text:', text.substring(0, 100) + '...');
    
    try {
      const completion = await this.model.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Generate a 1536-dimensional embedding vector for the following text. Return only numbers between -1 and 1, separated by commas, with exactly 1536 dimensions."
          },
          {
            role: "user",
            content: text
          }
        ],
        model: "mixtral-8x7b-32768",
        temperature: 0,
        max_tokens: 3072,
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // Clean and validate the vector
      const vector = response
        .split(',')
        .map(num => {
          const parsed = parseFloat(num.trim());
          // Replace any invalid values with 0
          return isNaN(parsed) ? 0 : Math.max(-1, Math.min(1, parsed));
        })
        .filter(num => typeof num === 'number' && !isNaN(num));

      // Ensure exactly 1536 dimensions
      while (vector.length < 1536) {
        vector.push(0);
      }
      if (vector.length > 1536) {
        vector.length = 1536;
      }

      console.log('Successfully generated embedding vector of length:', vector.length);
      return vector;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
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

    try {
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
    references: PubMedArticle[],
    guidelines: any = null
  ): Promise<Section> {
    console.log(`Generating section: ${sectionTitle}`);
    
    const guidelinesContext = guidelines ? 
      `Consider these Dutch guidelines: ${JSON.stringify(guidelines.content)}` :
      '';
    
    const prompt = `Generate the following section for a physiotherapy case study:

    ${sectionTitle}

    Description of what to include:
    ${sectionDescription}

    ${guidelinesContext}

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
            content: "You are a medical content generation system specialized in physiotherapy case studies."
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

  async generateStructuredGuidelines(condition: string, systemPrompt: string): Promise<any> {
    try {
      const completion = await this.model.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Analyze and structure treatment guidelines for: ${condition}`
          }
        ],
        model: "gemma2-9b-it",
        temperature: 0.3,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content || '';
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating structured guidelines:', error);
      throw error;
    }
  }
}