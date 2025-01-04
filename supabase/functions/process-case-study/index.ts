import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Groq } from 'npm:@groq/groq'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { caseStudy } = await req.json()
    
    const groq = new Groq({
      apiKey: Deno.env.get('GROQ_API_KEY')
    })

    console.log('Processing case study:', caseStudy.id)

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a medical assistant analyzing case studies. Provide insights about the case in a concise, professional manner. Focus on key medical observations, potential implications, and suggested areas for further investigation."
        },
        {
          role: "user",
          content: `Please analyze this medical case study:
          Patient: ${caseStudy.patient_name}
          Age: ${caseStudy.age}
          Gender: ${caseStudy.gender}
          Medical History: ${caseStudy.medical_history || 'None provided'}
          Presenting Complaint: ${caseStudy.presenting_complaint || 'None provided'}
          Condition: ${caseStudy.condition || 'Not specified'}`
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.5,
      max_tokens: 500,
    })

    console.log('Analysis completed for case study:', caseStudy.id)

    return new Response(
      JSON.stringify({ 
        analysis: completion.choices[0]?.message?.content || 'No analysis generated',
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      },
    )
  } catch (error) {
    console.error('Error processing case study:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      },
    )
  }
})