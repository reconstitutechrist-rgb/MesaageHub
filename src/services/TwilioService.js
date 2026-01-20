import { supabase } from '@/lib/supabase'

/**
 * Service to handle Twilio messaging via Supabase Edge Functions.
 * NOTE: We do NOT store Twilio credentials here in the client.
 * All actual calls to the Twilio API happen securely on the server.
 */
class TwilioService {
  /**
   * Sends a direct 1:1 message to a contact.
   * @param {string} to - The recipient's phone number (E.164 format)
   * @param {string} body - The message content
   * @param {string} [mediaUrl] - Optional URL for media (MMS/WhatsApp)
   */
  async sendMessage(to, body, mediaUrl = null) {
    try {
      const { data, error } = await supabase.functions.invoke('send-twilio-message', {
        body: { to, body, mediaUrl },
      })

      if (error) throw error

      return data
    } catch (error) {
      console.error('Twilio Send Error:', error)
      throw error
    }
  }

  /**
   * Launches a bulk campaign.
   * This sends a single payload to the backend, which processes the list.
   * @param {string} campaignId - The ID of the campaign record
   * @param {Array} recipientIds - List of contact IDs to target
   * @param {object} variables - Key/value pairs for template replacement (e.g. { name: 'John' })
   */
  async launchCampaign(campaignId, recipientIds, variables = {}) {
    try {
      const { data, error } = await supabase.functions.invoke('launch-twilio-campaign', {
        body: {
          campaignId,
          recipientIds,
          variables,
        },
      })

      if (error) throw error

      return { success: true, queued: recipientIds.length, jobId: data.jobId }
    } catch (error) {
      console.error('Campaign Launch Error:', error)
      throw error
    }
  }

  /**
   * Fetches the status of a message.
   * Use this for polling delivery receipts.
   */
  async getMessageStatus(_messageSid) {
    // Implementation would call a backend function that queries Twilio
    // or (better) listen to a Supabase table updated by Twilio webhooks
    // For now, returning a mock status if not implemented on backend
    return { status: 'sent' }
  }

  /**
   * Fetches campaign delivery statistics.
   * @param {string} campaignId - The campaign ID
   */
  async getCampaignStats(campaignId) {
    try {
      const { data, error } = await supabase.functions.invoke('get-campaign-stats', {
        body: { campaignId },
      })

      if (error) throw error

      return data
    } catch (error) {
      console.error('Campaign Stats Error:', error)
      // Return empty stats on error
      return {
        total: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
      }
    }
  }
}

export const twilioService = new TwilioService()
