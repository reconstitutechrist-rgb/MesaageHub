// Shared CORS headers for Edge Functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Helper to create a JSON response with CORS headers
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Helper to create an error response with CORS headers
export function errorResponse(message: string, code: string, status = 500): Response {
  return jsonResponse(
    {
      error: true,
      code,
      message,
    },
    status
  )
}
