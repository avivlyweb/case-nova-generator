import { Groq } from 'npm:groq-sdk';

export const generateSection = async (
  groq: Groq,
  sectionTitle: string,
  sectionDescription: string,
  caseStudy: any,
  entities: any,
  pubmedReferences: string[]
) => {
  console.log(`Generating section: ${sectionTitle}`);
  
  const prompt = `Generate the following section for a physiotherapy case study:

${sectionTitle}

Description of what to include:
${sectionDescription}

Case Information:
Patient Name: ${caseStudy.patient_name}
Age: ${caseStudy.age}
Gender: ${caseStudy.gender}
Condition: ${caseStudy.condition}
Medical History: ${caseStudy.medical_history}
Background: ${caseStudy.patient_background}
Symptoms: ${caseStudy.presenting_complaint}
Comorbidities: ${caseStudy.comorbidities}
Psychosocial Factors: ${caseStudy.psychosocial_factors}

Medical Entities Found:
${JSON.stringify(entities, null, 2)}

Relevant References:
${pubmedReferences.join('\n')}

Please ensure your response:
1. Is evidence-based and suitable for PhD/university level
2. Uses proper markdown formatting
3. Includes clinical reasoning
4. References the provided literature where appropriate
5. Uses proper markdown table syntax with | for columns when presenting data`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert physiotherapist creating detailed case study sections. Format your responses using proper markdown with clear headings and proper table syntax."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gemma2-9b-it",
      temperature: 0.5,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || 'Error generating content';
    console.log(`Section ${sectionTitle} generated:`, content);
    
    return {
      title: sectionTitle,
      content: content
    };
  } catch (error) {
    console.error(`Error generating section ${sectionTitle}:`, error);
    throw error;
  }
};