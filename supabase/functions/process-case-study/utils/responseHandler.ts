import { corsHeaders } from './cors.ts'

export const sendResponse = (data: any, status = 200) => {
  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status 
    }
  )
}

export const sendError = (error: any) => {
  console.error('Error processing request:', error)
  return new Response(
    JSON.stringify({ 
      error: error.message || 'Internal server error',
      details: error.stack,
      type: error.name,
      success: false 
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    }
  )
}