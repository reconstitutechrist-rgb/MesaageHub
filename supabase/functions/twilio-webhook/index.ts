// Supabase Edge Function: twilio-webhook
// Handles Twilio status callbacks for delivery tracking and engagement analytics
// Phase 4: Performance & Production Scaling

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Twilio sends webhook data as form-urlencoded
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse form data from Twilio
    const formData = await req.formData()
    const webhookData: Record<string, string> = {}
    formData.forEach((value, key) => {
      webhookData[key] = value.toString()
    })

    const {
      MessageSid,
      MessageStatus,
      To,
      From,
      ErrorCode,
      ErrorMessage,
    } = webhookData

    console.log(`Webhook received: ${MessageSid} -> ${MessageStatus}`)

    // Find the message by Twilio SID
    const { data: message, error: messageError } = await supabase
      .from('scheduled_messages')
      .select('id, automation_rule_id, campaign_id')
      .eq('twilio_sid', MessageSid)
      .single()

    if (messageError && messageError.code !== 'PGRST116') {
      console.error('Error finding message:', messageError)
    }

    // Update message status in scheduled_messages table
    if (message) {
      const statusUpdate: Record<string, unknown> = {
        delivery_status: MessageStatus,
        updated_at: new Date().toISOString(),
      }

      if (ErrorCode) {
        statusUpdate.error_code = ErrorCode
        statusUpdate.error_message = ErrorMessage
      }

      if (MessageStatus === 'delivered') {
        statusUpdate.delivered_at = new Date().toISOString()
      }

      await supabase
        .from('scheduled_messages')
        .update(statusUpdate)
        .eq('id', message.id)

      // Update campaign analytics if this message belongs to a campaign
      const campaignId = message.campaign_id || message.automation_rule_id

      if (campaignId) {
        await updateCampaignAnalytics(supabase, campaignId, MessageStatus)
      }
    }

    // Return 200 to acknowledge receipt (Twilio expects this)
    return new Response(
      JSON.stringify({ success: true, status: MessageStatus }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Webhook processing error:', error)
    // Still return 200 to prevent Twilio retries for processing errors
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

/**
 * Update campaign analytics based on message delivery status
 */
async function updateCampaignAnalytics(
  supabase: ReturnType<typeof createClient>,
  campaignId: string,
  status: string
): Promise<void> {
  try {
    // Map Twilio status to our metrics
    const isDelivered = status === 'delivered'
    const isFailed = ['failed', 'undelivered'].includes(status)

    if (isDelivered || isFailed) {
      // Use the RPC function to atomically update metrics
      const { error } = await supabase.rpc('update_campaign_delivery', {
        p_campaign_id: campaignId,
        p_delivered: isDelivered ? 1 : 0,
        p_failed: isFailed ? 1 : 0
      })

      if (error) {
        console.error('Failed to update campaign delivery metrics:', error)
      }
    }
  } catch (error) {
    console.error('Error updating campaign analytics:', error)
  }
}
