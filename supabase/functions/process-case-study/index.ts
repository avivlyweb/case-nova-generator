import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { handleCors } from './utils/cors.ts'
import { sendResponse, sendError } from './utils/responseHandler.ts'
import { processCaseStudy } from './utils/caseProcessor.ts'

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const { caseStudy, action = 'generate' } = await req.json()
    
    if (!caseStudy) {
      return sendError(new Error('No case study provided'))
    }

    console.log(`Processing ${action} request for case study:`, caseStudy.id)
    
    const result = await processCaseStudy(caseStudy, action)
    return sendResponse(result)

  } catch (error) {
    console.error('Error in edge function:', error)
    return sendError(error)
  }
})