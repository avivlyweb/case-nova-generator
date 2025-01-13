import { Groq } from 'npm:groq-sdk';

export async function extractMedicalEntities(text: string, groq: Groq) {
  const prompt = `Extract and categorize medical entities from the following text. Return a JSON object with these categories:
  - conditions: medical conditions and diagnoses
  - symptoms: reported symptoms and complaints
  - findings: clinical findings and observations
  - treatments: medications and interventions
  - anatomical_sites: body parts and locations
  - measurements: numerical measurements and scores
  - time_expressions: temporal information
  - procedures: medical procedures and tests
  - risk_factors: identified risk factors
  - functional_status: descriptions of functional abilities or limitations

Text: ${text}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a medical entity extraction system. Extract and categorize medical entities from the provided text."
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
      // Try to parse the response as JSON
      return JSON.parse(response || '{}');
    } catch (error) {
      console.error('Failed to parse entity extraction response:', error);
      // Return empty categories if parsing fails
      return {
        conditions: [],
        symptoms: [],
        findings: [],
        treatments: [],
        anatomical_sites: [],
        measurements: [],
        time_expressions: [],
        procedures: [],
        risk_factors: [],
        functional_status: []
      };
    }
  } catch (error) {
    console.error('Error in entity extraction:', error);
    throw error;
  }
}