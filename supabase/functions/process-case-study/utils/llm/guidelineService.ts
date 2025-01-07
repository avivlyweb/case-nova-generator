import { Groq } from 'npm:groq-sdk';
import { LLM_CONFIG } from './modelConfig.ts';

export class GuidelineService {
  private model: Groq;

  constructor(apiKey: string) {
    this.model = new Groq({
      apiKey,
      temperature: LLM_CONFIG.temperature,
    });
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
        model: LLM_CONFIG.model,
        temperature: 0.3,
        max_tokens: LLM_CONFIG.maxTokens,
      });

      const response = completion.choices[0]?.message?.content || '';
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating structured guidelines:', error);
      throw error;
    }
  }
}