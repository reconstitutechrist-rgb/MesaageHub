import { supabase } from '@/lib/supabase'
import { analyticsService } from './AnalyticsService'

/**
 * Service to handle Twilio messaging via Supabase Edge Functions.
 * NOTE: We do NOT store Twilio credentials here in the client.
 * All actual calls to the Twilio API happen securely on the server.
 *
 * Phase 4: Added analytics integration to track AI model engagement rates
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

  // ============================================
  // Analytics-Enhanced Methods (Phase 4)
  // ============================================

  /**
   * Launch a campaign with AI model analytics tracking
   * Records which AI model/style was used for engagement comparison
   * @param {string} campaignId - The ID of the campaign record
   * @param {Array} recipientIds - List of contact IDs to target
   * @param {object} variables - Key/value pairs for template replacement
   * @param {object} aiMetadata - AI generation metadata for analytics
   * @param {string} aiMetadata.userId - The user ID
   * @param {string} aiMetadata.aiModel - AI model used (e.g., 'imagen-4.0', 'veo-3.1', 'sora-2')
   * @param {string} aiMetadata.aiStyle - AI style used (e.g., 'photorealistic', 'cinematic')
   * @param {string} aiMetadata.assetType - Type of asset ('image', 'video', 'text')
   * @param {string} aiMetadata.assetUrl - CDN URL of the generated asset
   * @param {string} aiMetadata.generationPrompt - The prompt used to generate the asset
   * @param {number} aiMetadata.generationCost - Estimated cost of generation in USD
   */
  async launchCampaignWithAnalytics(campaignId, recipientIds, variables = {}, aiMetadata = {}) {
    try {
      // Launch the campaign first
      const result = await this.launchCampaign(campaignId, recipientIds, variables)

      // Record analytics if AI metadata is provided and campaign launched successfully
      if (result.success && aiMetadata.aiModel) {
        await analyticsService.recordCampaignLaunch(campaignId, {
          userId: aiMetadata.userId,
          aiModel: aiMetadata.aiModel,
          aiStyle: aiMetadata.aiStyle || 'default',
          assetType: aiMetadata.assetType || 'image',
          assetUrl: aiMetadata.assetUrl,
          generationPrompt: aiMetadata.generationPrompt,
          totalRecipients: recipientIds.length,
          generationCost: aiMetadata.generationCost || 0,
        })
      }

      return result
    } catch (error) {
      console.error('Campaign with analytics launch error:', error)
      throw error
    }
  }

  /**
   * Get engagement analytics by AI model
   * Shows which AI models/styles have the best engagement rates
   */
  async getAIModelEngagement() {
    return analyticsService.getAIModelPerformance()
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
