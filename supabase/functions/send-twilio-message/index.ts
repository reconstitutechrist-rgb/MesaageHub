// Supabase Edge Function: send-twilio-message
// Sends a direct 1:1 SMS/MMS message to a contact in real-time
// Uses the authenticated user's dedicated Twilio number

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, jsonResponse, errorResponse } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 'METHOD_NOT_ALLOWED', 405)
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')!
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')!
    const twilioFallbackNumber = Deno.env.get('TWILIO_PHONE_NUMBER')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse('Missing authorization', 'UNAUTHORIZED', 401)
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return errorResponse('Invalid token', 'UNAUTHORIZED', 401)
    }

    const { to, body, mediaUrl } = await req.json()

    if (!to || !body) {
      return errorResponse('Missing "to" or "body"', 'VALIDATION_ERROR', 400)
    }

    // Get the user's dedicated Twilio number
    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('twilio_phone_number')
      .eq('user_id', user.id)
      .single()

    const fromNumber = sub?.twilio_phone_number || twilioFallbackNumber

    // Send via Twilio REST API
    const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`)
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`

    const params: Record<string, string> = {
      To: to,
      From: fromNumber,
      Body: body,
    }

    if (mediaUrl) {
      params.MediaUrl = mediaUrl
    }

    // Configure status callback for delivery tracking
    const webhookUrl = `${supabaseUrl}/functions/v1/twilio-webhook`
    params.StatusCallback = webhookUrl

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params),
    })

    if (!twilioResponse.ok) {
      const errText = await twilioResponse.text()
      console.error('Twilio API error:', errText)
      return errorResponse(`Twilio error: ${twilioResponse.status}`, 'TWILIO_ERROR', 502)
    }

    const twilioData = await twilioResponse.json()

    console.log(`Sent message ${twilioData.sid} from ${fromNumber} to ${to}`)

    return jsonResponse({
      success: true,
      sid: twilioData.sid,
      from: fromNumber,
      to,
      status: twilioData.status,
    })
  } catch (error) {
    console.error('Send message error:', error)
    return errorResponse(
      (error as Error).message || 'Internal server error',
      'INTERNAL_ERROR',
      500
    )
  }
})
