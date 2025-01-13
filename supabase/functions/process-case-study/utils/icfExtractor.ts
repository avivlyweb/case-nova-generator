import { Groq } from 'npm:groq-sdk';

export async function extractICFCodes(text: string, groq: Groq): Promise<string[]> {
  const prompt = `Extract ICF codes from the following clinical text. Return only the ICF codes in an array format.
  Focus on:
  - b codes for body functions (e.g., b280 for pain)
  - d codes for activities and participation (e.g., d450 for walking)
  - e codes for environmental factors (e.g., e310 for family support)
  - s codes for body structures (e.g., s760 for trunk structure)

  Clinical Text: ${text}

  Return format example:
  ["b280", "d450", "e310"]`;

  try {
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
    
    try {
      const codes = JSON.parse(response || '[]');
      return Array.isArray(codes) ? codes : [];
    } catch (error) {
      console.error('Failed to parse ICF codes:', error);
      return [];
    }
  } catch (error) {
    console.error('Error in ICF code extraction:', error);
    throw error;
  }
}