import { Groq } from 'npm:groq-sdk';

export async function generateSuggestion(
  field: string,
  currentValue: string,
  specialization: string,
  existingValues: any
) {
  const groq = new Groq({
    apiKey: Deno.env.get('GROQ_API_KEY') || '',
  });

  const fieldPrompts = {
    condition: `Suggest a common neurological condition for a physiotherapy patient. Consider the specialization: ${specialization}`,
    adlProblem: `Suggest an ADL (Activities of Daily Living) problem related to ${existingValues.condition || 'the condition'}`,
    background: 'Provide a brief patient background including relevant lifestyle factors',
    history: `Suggest a medical history that would be relevant for a patient with ${existingValues.condition || 'this condition'}`,
    symptoms: `List common symptoms for ${existingValues.condition || 'this condition'}`,
    comorbidities: `Suggest common comorbidities that might be present with ${existingValues.condition || 'this condition'}`,
    psychosocialFactors: 'Suggest relevant psychosocial factors that might affect the patient\'s condition and treatment'
  };

  const prompt = `As a ${specialization} Physiotherapist, ${fieldPrompts[field as keyof typeof fieldPrompts]}. 
                 Current value: "${currentValue}"
                 Make the suggestion professional, concise, and relevant to the field.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a specialized ${specialization} Physiotherapist providing suggestions for case study documentation.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gemma2-9b-it",
      temperature: 0.7,
      max_tokens: 150,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating suggestion:', error);
    throw error;
  }
}