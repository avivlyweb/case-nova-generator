import { Groq } from 'npm:groq-sdk';

export const extractMedicalEntities = async (text: string, groq: Groq) => {
  const prompt = `Extract and categorize medical entities from the following text into these specific categories:
  - Clinical Diagnoses (specific medical conditions, disorders, pathologies)
  - Clinical Signs & Symptoms (objective and subjective manifestations)
  - Physical Findings (measurements, test results, observations)
  - Functional Limitations (activity restrictions, participation limitations)
  - Risk Factors (elements affecting prognosis or treatment)
  - Therapeutic Interventions (current or past treatments)
  - Medications (drugs, supplements, dosages)
  - Psychosocial Factors (behavioral, social, psychological elements)
  - Anatomical Structures (specific body parts, systems involved)
  - Physiological Parameters (vital signs, measurements)

Text to analyze:
${text}

Return a valid JSON object with these exact categories as keys.
Each category should contain an array of unique strings.
Only include entities that are explicitly mentioned in the text.
Do not include any markdown formatting or explanation text.
Do not wrap the response in code blocks or backticks.`;

  try {
    console.log('Sending entity extraction prompt to GROQ');
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a clinical entity extraction system. Return only valid JSON without any markdown formatting, code blocks, or explanatory text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    console.log('Raw GROQ response:', response);
    
    if (!response) {
      console.error('No response from entity extraction');
      return {
        clinical_diagnoses: [],
        signs_symptoms: [],
        physical_findings: [],
        functional_limitations: [],
        risk_factors: [],
        therapeutic_interventions: [],
        medications: [],
        psychosocial_factors: [],
        anatomical_structures: [],
        physiological_parameters: []
      };
    }

    // Clean the response by removing any markdown or code block formatting
    const cleanedResponse = response
      .replace(/```json\n|\n```|```\n|```/g, '') // Remove code block markers
      .replace(/^[^{]*({.*})[^}]*$/s, '$1') // Extract only the JSON object
      .trim();

    console.log('Cleaned response:', cleanedResponse);

    try {
      return JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.error('Cleaned response that failed to parse:', cleanedResponse);
      throw new Error(`Failed to parse GROQ response: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error in medical entity extraction:', error);
    throw error;
  }
};