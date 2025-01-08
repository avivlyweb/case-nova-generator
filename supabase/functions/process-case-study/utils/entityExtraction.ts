import { Groq } from 'npm:groq-sdk';

export const extractMedicalEntities = async (text: string, groq: Groq) => {
  const prompt = `Extract and categorize medical entities from the following text into these specific categories:
  - Conditions (medical conditions, diagnoses, disorders)
  - Symptoms (clinical manifestations, complaints)
  - Physical Findings (objective observations, measurements)
  - Functional Limitations (activity restrictions, participation limitations)
  - Risk Factors (elements that may affect prognosis)
  - Interventions (current or past treatments)
  - Medications (drugs, supplements)
  - Psychosocial Factors (behavioral, social, or psychological elements)

Text to analyze:
${text}

Format the response as a JSON object with these exact categories as keys.
Each category should contain an array of unique strings.
Only include entities that are explicitly mentioned in the text.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a clinical entity extraction system specialized in physiotherapy terminology."
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
    
    if (!response) {
      console.error('No response from entity extraction');
      return {
        conditions: [],
        symptoms: [],
        physical_findings: [],
        functional_limitations: [],
        risk_factors: [],
        interventions: [],
        medications: [],
        psychosocial_factors: []
      };
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('Error in medical entity extraction:', error);
    throw error;
  }
};