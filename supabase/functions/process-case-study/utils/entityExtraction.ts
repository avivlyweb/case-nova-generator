import { Groq } from 'npm:groq-sdk';

export const extractMedicalEntities = async (text: string, groq: Groq) => {
  const prompt = `Extract medical entities from this text into these categories:
- Clinical Diagnoses
- Signs & Symptoms
- Physical Findings
- Functional Limitations
- Risk Factors
- Therapeutic Interventions
- Medications
- Psychosocial Factors
- Anatomical Structures
- Physiological Parameters

Text: ${text}

Return a clean JSON object with these categories as array keys. No markdown or formatting.`;

  const maxRetries = 3;
  const baseDelay = 2000; // 2 seconds

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1} of ${maxRetries} for entity extraction`);
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a clinical entity extraction system. Return only valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "gemma2-9b-it", // Using a smaller, more efficient model
        temperature: 0.1,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      console.log('Raw GROQ response:', response);
      
      if (!response) {
        throw new Error('No response from entity extraction');
      }

      // Clean the response
      const cleanedResponse = response
        .replace(/```json\n|\n```|```\n|```/g, '')
        .replace(/^[^{]*({.*})[^}]*$/s, '$1')
        .trim();

      try {
        return JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        console.error('Cleaned response that failed to parse:', cleanedResponse);
        throw new Error(`Failed to parse GROQ response: ${parseError.message}`);
      }
    } catch (error) {
      console.error(`Error in attempt ${attempt + 1}:`, error);
      
      if (error.message?.includes('rate_limit_exceeded')) {
        if (attempt === maxRetries - 1) {
          throw new Error('Rate limit exceeded after all retries');
        }
        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Rate limit hit. Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
};