// Supabase Edge Function: send-scheduled-messages
// This function runs periodically (every 5-15 minutes via cron) to process
// the scheduled messages queue and send them via Twilio

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MAX_RETRIES = 3

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')!
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')!
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const now = new Date().toISOString()

    console.log(`Processing scheduled messages at ${now}`)

    // Get pending messages that are ready to send
    const { data: messages, error: fetchError } = await supabase
      .from('scheduled_messages')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .lt('attempts', MAX_RETRIES)
      .order('scheduled_for', { ascending: true })
      .limit(50) // Process in batches

    if (fetchError) {
      throw new Error(`Failed to fetch scheduled messages: ${fetchError.message}`)
    }

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No messages to send', sent: 0, failed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${messages.length} messages to send`)

    let sentCount = 0
    let failedCount = 0

    for (const message of messages) {
      // Mark as processing to prevent double-sends
      await supabase
        .from('scheduled_messages')
        .update({ status: 'processing', attempts: message.attempts + 1 })
        .eq('id', message.id)

      try {
        // Send via Twilio
        const twilioResponse = await sendTwilioMessage(
          twilioAccountSid,
          twilioAuthToken,
          twilioPhoneNumber,
          message.phone,
          message.message_body
        )

        // Update message as sent
        await supabase
          .from('scheduled_messages')
          .update({
            status: 'sent',
            twilio_sid: twilioResponse.sid,
            sent_at: new Date().toISOString(),
          })
          .eq('id', message.id)

        sentCount++
        console.log(`Sent message to ${message.phone}`)
      } catch (sendError: any) {
        console.error(`Failed to send message ${message.id}: ${sendError.message}`)

        const newAttempts = message.attempts + 1
        const newStatus = newAttempts >= MAX_RETRIES ? 'failed' : 'pending'

        await supabase
          .from('scheduled_messages')
          .update({
            status: newStatus,
            error_message: sendError.message,
          })
          .eq('id', message.id)

        if (newStatus === 'failed') {
          failedCount++
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${messages.length} messages`,
        sent: sentCount,
        failed: failedCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing scheduled messages:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function sendTwilioMessage(
  accountSid: string,
  authToken: string,
  from: string,
  to: string,
  body: string
): Promise<{ sid: string }> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`

  const auth = btoa(`${accountSid}:${authToken}`)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      To: to,
      From: from,
      Body: body,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Twilio API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  return { sid: data.sid }
}
