import { Groq } from 'npm:groq-sdk';

export const extractMedicalEntities = async (text: string, groq: Groq) => {
  console.log('Starting medical entity extraction with text:', text);
  
  const prompt = `As a medical entity extractor using BioBERT's approach, analyze this medical text and extract all medical entities into these categories:

Conditions: List all medical conditions, disorders, and diagnoses
Symptoms: List all symptoms and clinical manifestations
Medications: List all medications and pharmaceutical substances
Procedures: List all medical procedures, interventions, and treatments
Tests: List all medical tests, assessments, and diagnostic procedures
Anatomical: List all body parts and anatomical structures

Format the output as a JSON object with these categories as keys and arrays of unique entities as values. Only include entities that are explicitly mentioned in the text.

Text to analyze: ${text}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a medical entity extraction system based on BioBERT, specialized in identifying and categorizing medical terminology from clinical text. Extract only explicitly mentioned entities, no inferences."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gemma2-9b-it",
      temperature: 0.1,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    console.log('Raw entity extraction response:', response);
    
    try {
      const parsedEntities = JSON.parse(response || '{}');
      console.log('Parsed medical entities:', parsedEntities);
      return parsedEntities;
    } catch (parseError) {
      console.error('Error parsing medical entities JSON:', parseError);
      return {};
    }
  } catch (error) {
    console.error('Error in medical entity extraction:', error);
    return {};
  }
};