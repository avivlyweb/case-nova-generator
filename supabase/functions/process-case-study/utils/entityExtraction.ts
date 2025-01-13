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

    return JSON.parse(response);
  } catch (error) {
    console.error('Error in medical entity extraction:', error);
    throw error;
  }
};