// Supabase Edge Function: get-campaign-stats
// Returns delivery statistics for a given campaign

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

    const { campaignId } = await req.json()

    if (!campaignId) {
      return errorResponse('Missing campaignId', 'VALIDATION_ERROR', 400)
    }

    // Get message counts by status for this campaign
    const { data: messages, error: msgError } = await supabase
      .from('scheduled_messages')
      .select('status, delivery_status')
      .eq('campaign_id', campaignId)
      .eq('user_id', user.id)

    if (msgError) {
      console.error('Failed to fetch campaign messages:', msgError)
      return errorResponse('Failed to fetch stats', 'DB_ERROR', 500)
    }

    const allMessages = messages || []

    const stats = {
      total: allMessages.length,
      pending: allMessages.filter((m) => m.status === 'pending').length,
      processing: allMessages.filter((m) => m.status === 'processing').length,
      sent: allMessages.filter((m) => m.status === 'sent').length,
      failed: allMessages.filter((m) => m.status === 'failed').length,
      delivered: allMessages.filter((m) => m.delivery_status === 'delivered').length,
      undelivered: allMessages.filter((m) => m.delivery_status === 'undelivered').length,
    }

    // Also fetch analytics data if available
    const { data: analytics } = await supabase
      .from('campaign_analytics')
      .select('engagement_rate, delivery_rate, clicked_count, replied_count')
      .eq('campaign_id', campaignId)
      .single()

    return jsonResponse({
      ...stats,
      engagement_rate: analytics?.engagement_rate || 0,
      delivery_rate: analytics?.delivery_rate || 0,
      clicked: analytics?.clicked_count || 0,
      replied: analytics?.replied_count || 0,
    })
  } catch (error) {
    console.error('Get campaign stats error:', error)
    return errorResponse(
      (error as Error).message || 'Internal server error',
      'INTERNAL_ERROR',
      500
    )
  }
})
