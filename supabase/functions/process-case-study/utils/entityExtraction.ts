import { Groq } from 'npm:groq-sdk';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function extractMedicalEntities(text: string, groq: Groq): Promise<any> {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      console.log(`Attempt ${retries + 1} to extract medical entities`);
      
      const prompt = `Extract and categorize medical entities from the following text into these categories:
      - conditions
      - symptoms
      - findings
      - treatments
      - anatomical_sites
      - measurements
      - procedures
      - risk_factors

      Text: ${text}

      Return a JSON object with categories as keys and arrays of entities as values.
      Example format:
      {
        "conditions": ["osteoarthritis", "hypertension"],
        "symptoms": ["pain", "stiffness"],
        "findings": ["reduced range of motion"],
        "treatments": ["physical therapy", "NSAIDs"],
        "anatomical_sites": ["knee", "hip"],
        "measurements": ["blood pressure 120/80", "ROM 90 degrees"],
        "procedures": ["x-ray", "MRI"],
        "risk_factors": ["obesity", "sedentary lifestyle"]
      }`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a medical entity extraction specialist."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "gemma2-9b-it",
        temperature: 0.3,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      console.log('Entity extraction response:', response);
      
      try {
        return JSON.parse(response || '{}');
      } catch (error) {
        console.error('Failed to parse medical entities:', error);
        return {};
      }
    } catch (error) {
      console.error(`Error in medical entity extraction (attempt ${retries + 1}):`, error);
      
      // Check if it's a service unavailable error
      if (error.message?.includes('503') || error.message?.includes('Service Unavailable')) {
        if (retries < MAX_RETRIES - 1) {
          retries++;
          console.log(`Retrying in ${RETRY_DELAY}ms...`);
          await delay(RETRY_DELAY);
          continue;
        }
      }
      
      // If it's not a 503 error or we've exhausted retries, return empty object
      console.error('Failed to extract medical entities after all retries');
      return {};
    }
  }
  
  return {};
}