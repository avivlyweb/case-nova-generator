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

  // Simplified prompts to reduce token usage
  const fieldPrompts: { [key: string]: string } = {
    condition: `Suggest a condition for ${specialization} physiotherapy.`,
    adlProblem: `Suggest an ADL problem for ${existingValues.condition || 'the patient'}.`,
    background: 'Suggest a brief patient background.',
    history: `Suggest relevant medical history for ${existingValues.condition || 'the patient'}.`,
    symptoms: `List main symptoms for ${existingValues.condition || 'the condition'}.`,
    comorbidities: `Suggest likely comorbidities with ${existingValues.condition || 'this condition'}.`,
    psychosocialFactors: 'Suggest key psychosocial factors to consider.'
  };

  try {
    console.log(`Generating suggestion for ${field} in ${specialization} specialization`);
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a specialized ${specialization} Physiotherapist providing brief, focused suggestions.`
        },
        {
          role: "user",
          content: fieldPrompts[field as keyof typeof fieldPrompts]
        }
      ],
      model: "gemma2-9b-it",
      temperature: 0.7,
      max_tokens: 100, // Reduced from 150
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating suggestion:', error);
    throw error;
  }
}