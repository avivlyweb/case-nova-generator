import { Groq } from 'npm:groq-sdk';

export const generateSection = async (
  groq: Groq,
  sectionTitle: string,
  sectionDescription: string,
  caseStudy: any,
  entities: any,
  pubmedReferences: string[]
) => {
  console.log(`Generating section: ${sectionTitle} using gemma2-9b-it`);
  
  const prompt = `As an expert physiotherapist educator creating high-quality case studies for PhD and university-level education, please generate the following section:

${sectionTitle}

Context:
Patient Name: ${caseStudy.patient_name}
Age: ${caseStudy.age}
Gender: ${caseStudy.gender}
Condition: ${caseStudy.condition}
Medical History: ${caseStudy.medical_history}
Background: ${caseStudy.patient_background}
Symptoms: ${caseStudy.presenting_complaint}
Comorbidities: ${caseStudy.comorbidities}
Psychosocial Factors: ${caseStudy.psychosocial_factors}

Extracted Medical Entities:
${JSON.stringify(entities, null, 2)}

Relevant PubMed References:
${pubmedReferences.join('\n')}

Section Requirements:
${sectionDescription}

Please ensure your response is:
1. Evidence-based and suitable for PhD/university level education
2. Structured with clear headings and subheadings using proper markdown syntax
3. Includes relevant clinical reasoning
4. References the provided PubMed articles where appropriate
5. Uses tables with proper markdown syntax when presenting structured data (using | for columns)`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert physiotherapist educator creating high-quality case studies for PhD and university-level education. Your responses should be detailed, evidence-based, and follow current clinical guidelines. Always format tables using proper markdown syntax with | for columns."
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

    console.log(`Section ${sectionTitle} generated successfully with gemma2-9b-it`);
    return {
      title: sectionTitle,
      content: completion.choices[0]?.message?.content || 'Error generating content'
    };
  } catch (error) {
    console.error(`Error generating section ${sectionTitle}:`, error);
    return {
      title: sectionTitle,
      content: `Error generating ${sectionTitle}: ${error.message}`
    };
  }
};