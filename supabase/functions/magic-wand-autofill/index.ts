import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Groq } from 'npm:groq-sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { primaryCondition, specialization } = await req.json()
    
    if (!primaryCondition) {
      return new Response(
        JSON.stringify({ error: 'Primary condition is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const groq = new Groq({
      apiKey: Deno.env.get('GROQ_API_KEY'),
    });

    console.log('Magic Wand generating case for:', primaryCondition, specialization)

    // Professional physiotherapy prompt
    const prompt = `You are an expert physiotherapist with 15+ years of clinical experience. Generate a realistic, evidence-based case study for a patient with "${primaryCondition}" in ${specialization || 'physiotherapy'}.

Create a comprehensive patient profile that includes:

1. PATIENT DEMOGRAPHICS:
   - Realistic name (gender-appropriate)
   - Age (condition-appropriate)
   - Gender (based on epidemiology)

2. CLINICAL PRESENTATION (use proper medical terminology):
   - Primary symptoms with clinical descriptors
   - Functional limitations using ICF framework
   - Objective findings and assessment scores

3. BACKGROUND & HISTORY:
   - Realistic occupation/lifestyle relevant to condition
   - Medical history with timeline
   - Previous treatments and responses

4. FUNCTIONAL IMPACT:
   - Specific ADL problems
   - Work/recreational limitations
   - Mobility and self-care issues

5. COMORBIDITIES:
   - Age-appropriate conditions
   - Condition-related complications
   - Medication considerations

6. PSYCHOSOCIAL FACTORS:
   - Realistic psychological responses
   - Social impact and support
   - Coping strategies and concerns

Use evidence-based practice principles, proper clinical terminology, and realistic case complexity. Make it suitable for physiotherapy education and clinical reasoning.

Respond in this exact JSON format:
{
  "patientName": "realistic name",
  "age": number,
  "gender": "Male/Female",
  "symptoms": "detailed clinical presentation with proper terminology",
  "background": "realistic patient background and occupation",
  "history": "medical history with timeline and previous treatments",
  "adlProblem": "specific functional limitations and ADL impacts",
  "comorbidities": "age and condition appropriate comorbidities",
  "psychosocialFactors": "realistic psychological and social factors"
}

Generate for: ${primaryCondition} (${specialization || 'general physiotherapy'})`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert physiotherapist and clinical educator. Generate realistic, evidence-based case studies for physiotherapy education. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gemma2-9b-it",
      temperature: 0.7,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    console.log('AI Response:', responseText);

    // Try to parse JSON response
    let patientProfile;
    try {
      // Clean the response to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        patientProfile = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.error('Raw response:', responseText);
      
      // Fallback: extract information manually
      patientProfile = {
        patientName: extractField(responseText, 'patientName') || 'John Smith',
        age: parseInt(extractField(responseText, 'age')) || 65,
        gender: extractField(responseText, 'gender') || 'Male',
        symptoms: extractField(responseText, 'symptoms') || `Clinical presentation consistent with ${primaryCondition}`,
        background: extractField(responseText, 'background') || `Patient with ${primaryCondition}`,
        history: extractField(responseText, 'history') || `History of ${primaryCondition}`,
        adlProblem: extractField(responseText, 'adlProblem') || `Functional limitations related to ${primaryCondition}`,
        comorbidities: extractField(responseText, 'comorbidities') || 'No significant comorbidities',
        psychosocialFactors: extractField(responseText, 'psychosocialFactors') || 'Adjusting to condition impact'
      };
    }

    console.log('Generated patient profile:', patientProfile);

    return new Response(
      JSON.stringify({ 
        success: true,
        patientProfile: patientProfile
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in magic-wand-autofill:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Helper function to extract fields from text response
function extractField(text: string, fieldName: string): string {
  const patterns = [
    new RegExp(`"${fieldName}":\\s*"([^"]*)"`, 'i'),
    new RegExp(`${fieldName}:\\s*"([^"]*)"`, 'i'),
    new RegExp(`${fieldName}:\\s*([^,\\n}]+)`, 'i')
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return '';
}