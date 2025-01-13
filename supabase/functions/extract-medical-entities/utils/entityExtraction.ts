import { Groq } from 'npm:groq-sdk';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function extractEntities(text: string, groq: Groq, retryCount = 0): Promise<any> {
  console.log('Starting entity extraction for text:', text.substring(0, 100) + '...');
  
  const maxRetries = 3;
  const baseDelay = 2000;

  try {
    const prompt = `Extract and categorize medical entities from the following clinical text into these specific categories:
    - Clinical Diagnoses (specific medical conditions, disorders, pathologies)
    - Clinical Signs & Symptoms (objective and subjective manifestations)
    - Therapeutic Interventions (medications, treatments, procedures)
    - Diagnostic Procedures (tests, imaging, assessments)
    - Anatomical Structures (specific body parts, systems)
    - Physiological Parameters (measurements, vital signs)

    Return a JSON object with these exact keys:
    {
      "diagnoses": [],
      "symptoms": [],
      "interventions": [],
      "diagnostics": [],
      "anatomical": [],
      "physiological": []
    }`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a clinical terminology expert. Extract and categorize medical terms using standardized clinical terminology."
        },
        {
          role: "user",
          content: `${prompt}\n\nText to analyze:\n${text}`
        }
      ],
      model: "gemma2-9b-it",
      temperature: 0.1,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from Groq');
    }

    console.log('Raw response:', response);
    return JSON.parse(response);
  } catch (error) {
    console.error(`Error in entity extraction (attempt ${retryCount + 1}):`, error);
    
    if (error.message?.includes('rate_limit_exceeded') && retryCount < maxRetries) {
      const delay = baseDelay * Math.pow(2, retryCount);
      console.log(`Rate limit hit. Retrying in ${delay}ms...`);
      await sleep(delay);
      return extractEntities(text, groq, retryCount + 1);
    }
    throw error;
  }
}