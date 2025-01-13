import { Groq } from 'npm:groq-sdk';

export async function extractMedicalEntities(text: string, groq: Groq) {
  const prompt = `Extract and categorize medical entities from the following clinical text. Return a JSON object with these specific categories:

  - conditions: medical conditions, diseases, and diagnoses
  - symptoms: reported symptoms and clinical manifestations
  - findings: clinical observations and examination results
  - treatments: medications, therapies, and interventions
  - anatomical_sites: body parts and anatomical locations
  - measurements: quantitative values and clinical scores
  - procedures: medical procedures and diagnostic tests
  - risk_factors: identified risk factors and complications

  For each entity, include contextual information in parentheses and clinical significance in square brackets when relevant.
  Format: "term (context) [significance]"

  Clinical Text:
  ${text}

  Return ONLY a JSON object with the categories as keys and arrays of strings as values.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a medical entity extraction system trained to identify and categorize clinical terms using BioBERT-like precision. Extract entities with their context and clinical significance."
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
    console.log('Entity extraction response:', response);
    
    try {
      return JSON.parse(response || '{}');
    } catch (error) {
      console.error('Failed to parse entity extraction response:', error);
      return {
        conditions: [],
        symptoms: [],
        findings: [],
        treatments: [],
        anatomical_sites: [],
        measurements: [],
        procedures: [],
        risk_factors: []
      };
    }
  } catch (error) {
    console.error('Error in entity extraction:', error);
    throw error;
  }
}