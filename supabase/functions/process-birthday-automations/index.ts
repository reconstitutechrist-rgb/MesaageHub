// Supabase Edge Function: process-birthday-automations
// This function runs daily (via cron) to find contacts with birthdays this month
// and queue messages for active automation rules

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

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const currentMonth = new Date().getMonth() + 1 // 1-12
    const currentYear = new Date().getFullYear()

    console.log(`Processing birthday automations for month ${currentMonth}`)

    // Get all active automation rules with trigger_type = 'birthday_month'
    const { data: rules, error: rulesError } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('trigger_type', 'birthday_month')
      .eq('is_active', true)

    if (rulesError) {
      throw new Error(`Failed to fetch automation rules: ${rulesError.message}`)
    }

    if (!rules || rules.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No active automation rules found', queued: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${rules.length} active automation rules`)

    let totalQueued = 0

    for (const rule of rules) {
      // Get contacts with birthday in current month for this user
      // Birthday is stored as YYYY-MM-DD, so we extract the month
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', rule.user_id)
        .not('birthday', 'is', null)

      if (contactsError) {
        console.error(`Failed to fetch contacts for rule ${rule.id}: ${contactsError.message}`)
        continue
      }

      // Filter contacts by birthday month
      const birthdayContacts = (contacts || []).filter((contact) => {
        if (!contact.birthday) return false
        const birthMonth = new Date(contact.birthday).getMonth() + 1
        return birthMonth === currentMonth
      })

      console.log(`Found ${birthdayContacts.length} contacts with birthday in month ${currentMonth} for rule ${rule.id}`)

      for (const contact of birthdayContacts) {
        // Check if message already queued for this contact/rule/year
        const { data: existingMessages, error: existingError } = await supabase
          .from('scheduled_messages')
          .select('id')
          .eq('automation_rule_id', rule.id)
          .eq('contact_id', contact.id)
          .gte('created_at', `${currentYear}-01-01`)
          .lt('created_at', `${currentYear + 1}-01-01`)

        if (existingError) {
          console.error(`Failed to check existing messages: ${existingError.message}`)
          continue
        }

        if (existingMessages && existingMessages.length > 0) {
          console.log(`Message already queued for contact ${contact.id} and rule ${rule.id} this year`)
          continue
        }

        // Substitute variables in message
        const messageBody = substituteVariables(rule.message_body, contact)

        // Calculate scheduled time
        const [hours, minutes] = (rule.send_time || '09:00').split(':').map(Number)
        const now = new Date()
        let scheduledFor = new Date(now.getFullYear(), now.getMonth(), 1 + (rule.days_offset || 0), hours, minutes)

        // If scheduled time is in the past, schedule for tomorrow
        if (scheduledFor < now) {
          scheduledFor = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hours, minutes)
        }

        // Create scheduled message
        const { error: insertError } = await supabase
          .from('scheduled_messages')
          .insert({
            user_id: rule.user_id,
            automation_rule_id: rule.id,
            contact_id: contact.id,
            phone: contact.phone,
            message_body: messageBody,
            scheduled_for: scheduledFor.toISOString(),
            status: 'pending',
          })

        if (insertError) {
          console.error(`Failed to insert scheduled message: ${insertError.message}`)
          continue
        }

        totalQueued++
        console.log(`Queued message for contact ${contact.name} (${contact.phone})`)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${rules.length} automation rules`,
        queued: totalQueued,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing birthday automations:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function substituteVariables(template: string, contact: any): string {
  if (!template) return ''

  return template
    .replace(/{name}/g, contact.name || '')
    .replace(/{firstName}/g, (contact.name || '').split(' ')[0] || '')
    .replace(/{phone}/g, contact.phone || '')
    .replace(/{email}/g, contact.email || '')
    .replace(/{year}/g, new Date().getFullYear().toString())
}
