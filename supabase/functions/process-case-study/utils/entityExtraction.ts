import { Groq } from 'npm:groq-sdk';

export const extractMedicalEntities = async (text: string, groq: Groq) => {
  console.log('Starting medical entity extraction...');
  
  const prompt = `Extract medical entities from the following text and categorize them into these groups:
  - Conditions (medical conditions, disorders, diagnoses)
  - Symptoms (clinical manifestations)
  - Medications (drugs, pharmaceutical substances)
  - Procedures (medical procedures, interventions)
  - Tests (medical tests, diagnostic procedures)
  - Anatomical (body parts, anatomical structures)

Text to analyze:
${text}

Format the response as a JSON object with these exact keys: conditions, symptoms, medications, procedures, tests, anatomical. 
Each key should have an array of unique strings as values.
Only include entities that are explicitly mentioned in the text.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a medical entity extraction system. Extract and categorize medical terms from clinical text into predefined categories. Only include explicitly mentioned entities."
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
    
    if (!response) {
      console.error('No response from entity extraction');
      return {
        conditions: [],
        symptoms: [],
        medications: [],
        procedures: [],
        tests: [],
        anatomical: []
      };
    }

    try {
      const parsedEntities = JSON.parse(response);
      console.log('Parsed medical entities:', parsedEntities);
      
      // Ensure all required categories exist
      const defaultCategories = ['conditions', 'symptoms', 'medications', 'procedures', 'tests', 'anatomical'];
      defaultCategories.forEach(category => {
        if (!parsedEntities[category]) {
          parsedEntities[category] = [];
        }
      });

      return parsedEntities;
    } catch (parseError) {
      console.error('Error parsing medical entities JSON:', parseError);
      return {
        conditions: [],
        symptoms: [],
        medications: [],
        procedures: [],
        tests: [],
        anatomical: []
      };
    }
  } catch (error) {
    console.error('Error in medical entity extraction:', error);
    return {
      conditions: [],
      symptoms: [],
      medications: [],
      procedures: [],
      tests: [],
      anatomical: []
    };
  }
};