// Supabase Edge Function: assign-phone-number
// Purchases a dedicated Twilio phone number for a new subscriber
// Called immediately after signup

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, jsonResponse, errorResponse } from '../_shared/cors.ts'

const TWILIO_API_BASE = 'https://api.twilio.com/2010-04-01'

serve(async (req) => {
  // Handle CORS preflight
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
    const twilioWebhookBaseUrl = Deno.env.get('TWILIO_WEBHOOK_BASE_URL') || supabaseUrl

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse('Missing authorization header', 'UNAUTHORIZED', 401)
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return errorResponse('Invalid token', 'UNAUTHORIZED', 401)
    }

    const userId = user.id

    // Check if user already has a number assigned
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('id, twilio_phone_number, twilio_phone_sid')
      .eq('user_id', userId)
      .single()

    if (subError && subError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subError)
      return errorResponse('Failed to check subscription', 'DB_ERROR', 500)
    }

    // If already has a number, return it
    if (subscription?.twilio_phone_number) {
      return jsonResponse({
        success: true,
        phone_number: subscription.twilio_phone_number,
        already_assigned: true,
      })
    }

    // Search for an available US local number
    const availableNumber = await searchAvailableNumber(twilioAccountSid, twilioAuthToken)

    if (!availableNumber) {
      return errorResponse('No phone numbers available', 'NO_NUMBERS', 503)
    }

    // Purchase the number
    const purchasedNumber = await purchaseNumber(
      twilioAccountSid,
      twilioAuthToken,
      availableNumber.phoneNumber,
      twilioWebhookBaseUrl
    )

    // Upsert the subscription record with the purchased number
    if (subscription) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          twilio_phone_number: purchasedNumber.phoneNumber,
          twilio_phone_sid: purchasedNumber.sid,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('Failed to update subscription with phone number:', updateError)
        return errorResponse('Number purchased but failed to save', 'DB_ERROR', 500)
      }
    } else {
      // Create new subscription record with the number
      const { error: insertError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          tier: 'pro',
          twilio_phone_number: purchasedNumber.phoneNumber,
          twilio_phone_sid: purchasedNumber.sid,
        })

      if (insertError) {
        console.error('Failed to create subscription with phone number:', insertError)
        return errorResponse('Number purchased but failed to save', 'DB_ERROR', 500)
      }
    }

    console.log(`Assigned ${purchasedNumber.phoneNumber} to user ${userId}`)

    return jsonResponse({
      success: true,
      phone_number: purchasedNumber.phoneNumber,
      already_assigned: false,
    })
  } catch (error) {
    console.error('Error assigning phone number:', error)
    return errorResponse(error.message || 'Internal server error', 'INTERNAL_ERROR', 500)
  }
})

/**
 * Search for an available US local phone number
 */
async function searchAvailableNumber(
  accountSid: string,
  authToken: string
): Promise<{ phoneNumber: string } | null> {
  const auth = btoa(`${accountSid}:${authToken}`)
  const url = `${TWILIO_API_BASE}/Accounts/${accountSid}/AvailablePhoneNumbers/US/Local.json?Limit=1`

  const response = await fetch(url, {
    headers: { 'Authorization': `Basic ${auth}` },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Twilio search failed: ${response.status} - ${errorText}`)
  }

  const data = await response.json()

  if (!data.available_phone_numbers || data.available_phone_numbers.length === 0) {
    return null
  }

  return { phoneNumber: data.available_phone_numbers[0].phone_number }
}

/**
 * Purchase a phone number and configure its webhook
 */
async function purchaseNumber(
  accountSid: string,
  authToken: string,
  phoneNumber: string,
  webhookBaseUrl: string
): Promise<{ sid: string; phoneNumber: string }> {
  const auth = btoa(`${accountSid}:${authToken}`)
  const url = `${TWILIO_API_BASE}/Accounts/${accountSid}/IncomingPhoneNumbers.json`

  // Configure the webhook URL for inbound SMS
  const smsUrl = `${webhookBaseUrl}/functions/v1/twilio-webhook`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      PhoneNumber: phoneNumber,
      SmsUrl: smsUrl,
      SmsMethod: 'POST',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Twilio purchase failed: ${response.status} - ${errorText}`)
  }

  const data = await response.json()

  return {
    sid: data.sid,
    phoneNumber: data.phone_number,
  }
}
