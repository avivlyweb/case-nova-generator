import { Groq } from 'npm:groq-sdk';
import { supabase } from '../../../utils/supabaseClient.ts';
import { CaseStudy } from '../types.ts';

export async function generateClinicalReasoning(
  groq: Groq,
  caseStudy: CaseStudy,
  queryEmbedding: any
) {
  // First, search for relevant KNGF guidelines
  const { data: guidelines, error } = await supabase.rpc('search_guidelines_for_case', {
    query_text: `${caseStudy.condition} ${caseStudy.presenting_complaint}`,
    query_embedding: queryEmbedding,
    match_count: 3,
    min_similarity: 0.5
  });

  if (error) {
    console.error('Error fetching guidelines:', error);
  }

  // Format guidelines for prompt
  const guidelinesContext = guidelines?.map(g => `
    Guideline: ${g.title}
    Condition: ${g.condition}
    Evidence Level: ${JSON.stringify(g.evidence_levels)}
    Key Interventions: ${JSON.stringify(g.interventions)}
  `).join('\n') || '';

  const prompt = `As a physiotherapist specializing in ${caseStudy.specialization}, provide clinical reasoning for the following case:

Patient Information:
Name: ${caseStudy.patient_name}
Age: ${caseStudy.age}
Gender: ${caseStudy.gender}
Condition: ${caseStudy.condition}
Presenting Complaint: ${caseStudy.presenting_complaint}

Relevant KNGF Guidelines:
${guidelinesContext}

Please provide comprehensive clinical reasoning following this structure:

1. Problem Identification
- Primary problems
- Contributing factors
- Impact analysis

2. Hypothesis Generation
- Clinical patterns
- Evidence support (including KNGF guidelines)
- Alternative explanations

3. Intervention Selection
- Evidence levels (specifically referencing KNGF guidelines)
- Risk-benefit analysis
- Expected outcomes

4. Outcome Evaluation
- Measurement tools
- Success criteria
- Modification triggers

Ensure to:
1. Integrate KNGF guideline recommendations where applicable
2. Reference evidence levels from the guidelines
3. Align reasoning with Dutch physiotherapy standards
4. Include specific intervention recommendations from KNGF guidelines`;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are an expert physiotherapist specializing in clinical reasoning and evidence-based practice according to Dutch guidelines."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    model: "gemma2-9b-it",
    temperature: 0.7,
    max_tokens: 2000,
  });

  return completion.choices[0]?.message?.content || '';
}