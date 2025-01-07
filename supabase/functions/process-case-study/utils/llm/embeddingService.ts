import { Groq } from 'npm:groq-sdk';
import { LLM_CONFIG } from './modelConfig.ts';

export class EmbeddingService {
  private model: Groq;

  constructor(apiKey: string) {
    this.model = new Groq({
      apiKey,
      temperature: LLM_CONFIG.temperature,
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    console.log('Generating embedding for text:', text.substring(0, 100) + '...');
    
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
      model: LLM_CONFIG.model,
      temperature: 0,
      max_tokens: 3072,
    });

    const response = completion.choices[0]?.message?.content || '';
    
    // Clean and validate the vector
    const vector = response
      .split(',')
      .map(num => {
        const parsed = parseFloat(num.trim());
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
  }
}