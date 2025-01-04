import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Groq } from 'https://esm.sh/@groq/groq'

const groq = new Groq({
  apiKey: Deno.env.get('GROQ_API_KEY')
})

serve(async (req) => {
  try {
    const { caseStudy } = await req.json()
    
    // Process with Groq
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a medical assistant analyzing case studies. Provide insights about the case."
        },
        {
          role: "user",
          content: `Analyze this case study: ${JSON.stringify(caseStudy)}`
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.5,
      max_tokens: 500,
    })

    const analysis = completion.choices[0]?.message?.content || ''

    return new Response(
      JSON.stringify({ 
        analysis,
        success: true 
      }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 200 
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 500 
      },
    )
  }
})