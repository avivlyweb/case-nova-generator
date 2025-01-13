import { Groq } from 'npm:groq-sdk';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function extractICFCodes(text: string, groq: Groq): Promise<string[]> {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      console.log(`Attempt ${retries + 1} to extract ICF codes`);
      
      const prompt = `Extract ICF codes from the following clinical text. Return only the ICF codes in an array format.
      Focus on:
      - b codes for body functions (e.g., b280 for pain)
      - d codes for activities and participation (e.g., d450 for walking)
      - e codes for environmental factors (e.g., e310 for family support)
      - s codes for body structures (e.g., s760 for trunk structure)

      Clinical Text: ${text}

      Return format example:
      ["b280", "d450", "e310"]`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a clinical coding specialist that extracts ICF codes from medical text."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "gemma2-9b-it",
        temperature: 0.3,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      console.log('ICF extraction response:', response);
      
      try {
        const codes = JSON.parse(response || '[]');
        return Array.isArray(codes) ? codes : [];
      } catch (error) {
        console.error('Failed to parse ICF codes:', error);
        return [];
      }
    } catch (error) {
      console.error(`Error in ICF code extraction (attempt ${retries + 1}):`, error);
      
      // Check if it's a service unavailable error
      if (error.message?.includes('503') || error.message?.includes('Service Unavailable')) {
        if (retries < MAX_RETRIES - 1) {
          retries++;
          console.log(`Retrying in ${RETRY_DELAY}ms...`);
          await delay(RETRY_DELAY);
          continue;
        }
      }
      
      // If it's not a 503 error or we've exhausted retries, return empty array
      console.error('Failed to extract ICF codes after all retries');
      return [];
    }
  }
  
  return [];
}