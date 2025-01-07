import { Groq } from "npm:groq-sdk";

export async function processGuideline(guideline: any, groq: Groq) {
  const systemPrompt = `You are a medical guidelines expert. Analyze and structure the following guideline:
  - Extract key interventions
  - Identify evidence levels
  - List assessment criteria
  - Compile exercise recommendations
  - Structure into clear sections
  Format the response as structured data suitable for a JSON object.`;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: `Process this physiotherapy guideline: ${JSON.stringify(guideline)}`
      }
    ],
    model: "mixtral-8x7b-32768",
    temperature: 0.3,
    max_tokens: 2000,
  });

  return JSON.parse(completion.choices[0]?.message?.content || '{}');
}