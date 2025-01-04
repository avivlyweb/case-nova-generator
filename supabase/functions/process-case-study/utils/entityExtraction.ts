import { Groq } from 'npm:groq-sdk';

export const extractMedicalEntities = async (text: string, groq: Groq) => {
  const prompt = `You are a medical entity extractor using BioBERT's approach. Given the following medical text, extract and categorize all medical entities into these categories:
  - Conditions
  - Symptoms
  - Medications
  - Procedures
  - Lab Tests
  - Anatomical Sites
  
  Format the output as a JSON object with these categories as keys and arrays of entities as values.
  
  Text: ${text}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a medical entity extraction system based on BioBERT, specialized in identifying and categorizing medical terminology from clinical text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.2,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    return JSON.parse(response || '{}');
  } catch (error) {
    console.error('Error extracting medical entities:', error);
    return {};
  }
};