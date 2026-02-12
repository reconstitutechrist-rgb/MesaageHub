// Supabase Edge Function: launch-twilio-campaign
// Launches a bulk SMS campaign by queuing messages for all recipients
// Records campaign analytics with AI metadata

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

    const { campaignId, recipientIds, variables = {} } = await req.json()

    if (!campaignId || !recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      return errorResponse(
        'Missing campaignId or recipientIds array',
        'VALIDATION_ERROR',
        400
      )
    }

    // Fetch all target contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id, name, phone, email')
      .eq('user_id', user.id)
      .in('id', recipientIds)

    if (contactsError) {
      console.error('Failed to fetch contacts:', contactsError)
      return errorResponse('Failed to fetch contacts', 'DB_ERROR', 500)
    }

    if (!contacts || contacts.length === 0) {
      return errorResponse('No valid contacts found', 'NO_CONTACTS', 400)
    }

    // Fetch campaign details (template message)
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .single()

    if (campaignError || !campaign) {
      console.error('Failed to fetch campaign:', campaignError)
      return errorResponse('Campaign not found', 'NOT_FOUND', 404)
    }

    const jobId = crypto.randomUUID()
    let queuedCount = 0

    // Queue a scheduled_message for each contact
    const messagesToInsert = contacts
      .filter((contact) => contact.phone) // Skip contacts without phone
      .map((contact) => {
        // Substitute variables in the message template
        const messageBody = substituteVariables(
          campaign.message_body || campaign.template || '',
          contact,
          variables
        )

        return {
          user_id: user.id,
          campaign_id: campaignId,
          contact_id: contact.id,
          phone: contact.phone,
          message_body: messageBody,
          scheduled_for: new Date().toISOString(), // Send immediately
          status: 'pending',
          job_id: jobId,
        }
      })

    if (messagesToInsert.length === 0) {
      return errorResponse('No contacts have phone numbers', 'NO_PHONES', 400)
    }

    // Batch insert — Supabase handles bulk inserts efficiently
    const { error: insertError } = await supabase
      .from('scheduled_messages')
      .insert(messagesToInsert)

    if (insertError) {
      console.error('Failed to queue campaign messages:', insertError)
      return errorResponse('Failed to queue messages', 'DB_ERROR', 500)
    }

    queuedCount = messagesToInsert.length

    // Record campaign analytics
    await supabase.rpc('record_campaign_launch', {
      p_campaign_id: campaignId,
      p_user_id: user.id,
      p_total_recipients: queuedCount,
    })

    // Update campaign status
    await supabase
      .from('campaigns')
      .update({
        status: 'sending',
        sent_at: new Date().toISOString(),
        total_recipients: queuedCount,
      })
      .eq('id', campaignId)

    console.log(`Campaign ${campaignId}: queued ${queuedCount} messages (job ${jobId})`)

    return jsonResponse({
      success: true,
      jobId,
      queued: queuedCount,
      campaignId,
    })
  } catch (error) {
    console.error('Campaign launch error:', error)
    return errorResponse(
      (error as Error).message || 'Internal server error',
      'INTERNAL_ERROR',
      500
    )
  }
})

/**
 * Replace template variables like {name}, {firstName}, etc.
 */
function substituteVariables(
  template: string,
  contact: { name?: string; phone?: string; email?: string },
  extraVars: Record<string, string> = {}
): string {
  if (!template) return ''

  let result = template
    .replace(/{name}/g, contact.name || '')
    .replace(/{firstName}/g, (contact.name || '').split(' ')[0] || '')
    .replace(/{phone}/g, contact.phone || '')
    .replace(/{email}/g, contact.email || '')

  // Apply any custom variables from the caller
  for (const [key, value] of Object.entries(extraVars)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value)
  }

  return result
}
