/**
 * AnalyticsService - Campaign analytics and AI model performance tracking
 * Phase 4: Performance & Production Scaling
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase'

class AnalyticsService {
  /**
   * Record campaign launch with AI metadata
   * Called when a campaign is sent to track engagement by AI model/style
   */
  async recordCampaignLaunch(
    campaignId,
    {
      userId,
      aiModel,
      aiStyle,
      assetType,
      assetUrl,
      generationPrompt,
      totalRecipients,
      generationCost = 0,
    }
  ) {
    if (!isSupabaseConfigured) {
      return { success: true, data: { id: 'mock-analytics-id' } }
    }

    try {
      const { data, error } = await supabase
        .from('campaign_analytics')
        .insert({
          campaign_id: campaignId,
          user_id: userId,
          ai_model: aiModel,
          ai_style: aiStyle,
          asset_type: assetType,
          asset_url: assetUrl,
          generation_prompt: generationPrompt,
          total_recipients: totalRecipients,
          generation_cost_usd: generationCost,
          campaign_sent_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Failed to record campaign launch:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Update delivery metrics for a campaign
   * Called from Twilio webhook when message delivery status changes
   */
  async updateDeliveryMetrics(campaignId, { delivered = 0, failed = 0 }) {
    if (!isSupabaseConfigured) {
      return { success: true }
    }

    try {
      const { error } = await supabase.rpc('update_campaign_delivery', {
        p_campaign_id: campaignId,
        p_delivered: delivered,
        p_failed: failed,
      })

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Failed to update delivery metrics:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Update engagement metrics for a campaign
   * Called from Twilio webhook for clicks, replies, unsubscribes
   */
  async updateEngagementMetrics(campaignId, { clicked = 0, replied = 0, unsubscribed = 0 }) {
    if (!isSupabaseConfigured) {
      return { success: true }
    }

    try {
      const { error } = await supabase.rpc('update_campaign_engagement', {
        p_campaign_id: campaignId,
        p_clicked: clicked,
        p_replied: replied,
        p_unsubscribed: unsubscribed,
      })

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Failed to update engagement metrics:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get AI model performance comparison
   * Returns aggregated engagement metrics by AI model and style
   */
  async getAIModelPerformance(_userId = null) {
    if (!isSupabaseConfigured) {
      return { success: true, data: this._getMockPerformanceData() }
    }

    try {
      const query = supabase.from('ai_model_performance').select('*')

      // Note: The view already aggregates across all users
      // If user-specific data is needed, we'd need a different query

      const { data, error } = await query

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Failed to get AI model performance:', error)
      return { success: true, data: this._getMockPerformanceData() }
    }
  }

  /**
   * Get campaign analytics for a user
   */
  async getCampaignAnalytics(userId, { limit = 20, offset = 0, startDate, endDate } = {}) {
    if (!isSupabaseConfigured) {
      return { success: true, data: [] }
    }

    try {
      let query = supabase
        .from('campaign_analytics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (startDate) {
        query = query.gte('created_at', startDate)
      }
      if (endDate) {
        query = query.lte('created_at', endDate)
      }

      const { data, error } = await query

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Failed to get campaign analytics:', error)
      return { success: false, error: error.message, data: [] }
    }
  }

  /**
   * Get top performing campaigns
   */
  async getTopPerformingCampaigns(userId, { limit = 10 } = {}) {
    if (!isSupabaseConfigured) {
      return { success: true, data: [] }
    }

    try {
      const { data, error } = await supabase
        .from('campaign_analytics')
        .select('*')
        .eq('user_id', userId)
        .gte('total_recipients', 10) // Minimum sample size
        .order('engagement_rate', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Failed to get top campaigns:', error)
      return { success: false, error: error.message, data: [] }
    }
  }

  /**
   * Get user's cost summary
   */
  async getUserCostSummary(userId, { months = 3 } = {}) {
    if (!isSupabaseConfigured) {
      return { success: true, data: [] }
    }

    try {
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - months)

      const { data, error } = await supabase
        .from('api_usage_logs')
        .select('api_provider, api_endpoint, estimated_cost_usd, created_at')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .eq('response_status', 'success')

      if (error) throw error

      // Aggregate by month and provider
      const summary = {}
      for (const log of data || []) {
        const month = new Date(log.created_at).toISOString().slice(0, 7)
        const key = `${month}-${log.api_provider}`

        if (!summary[key]) {
          summary[key] = {
            month,
            provider: log.api_provider,
            totalCost: 0,
            callCount: 0,
          }
        }

        summary[key].totalCost += parseFloat(log.estimated_cost_usd) || 0
        summary[key].callCount += 1
      }

      return { success: true, data: Object.values(summary) }
    } catch (error) {
      console.error('Failed to get cost summary:', error)
      return { success: false, error: error.message, data: [] }
    }
  }

  /**
   * Get analytics summary for dashboard
   */
  async getDashboardSummary(userId) {
    if (!isSupabaseConfigured) {
      return {
        success: true,
        data: {
          totalCampaigns: 0,
          avgDeliveryRate: 0,
          avgEngagementRate: 0,
          totalReach: 0,
          topModel: null,
        },
      }
    }

    try {
      // Get campaign stats
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaign_analytics')
        .select('delivery_rate, engagement_rate, total_recipients, ai_model')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      if (campaignsError) throw campaignsError

      if (!campaigns || campaigns.length === 0) {
        return {
          success: true,
          data: {
            totalCampaigns: 0,
            avgDeliveryRate: 0,
            avgEngagementRate: 0,
            totalReach: 0,
            topModel: null,
          },
        }
      }

      const totalCampaigns = campaigns.length
      const avgDeliveryRate =
        campaigns.reduce((sum, c) => sum + (c.delivery_rate || 0), 0) / totalCampaigns
      const avgEngagementRate =
        campaigns.reduce((sum, c) => sum + (c.engagement_rate || 0), 0) / totalCampaigns
      const totalReach = campaigns.reduce((sum, c) => sum + (c.total_recipients || 0), 0)

      // Find most used model
      const modelCounts = {}
      for (const c of campaigns) {
        if (c.ai_model) {
          modelCounts[c.ai_model] = (modelCounts[c.ai_model] || 0) + 1
        }
      }
      const topModel = Object.entries(modelCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null

      return {
        success: true,
        data: {
          totalCampaigns,
          avgDeliveryRate: Math.round(avgDeliveryRate * 10000) / 100, // Convert to percentage
          avgEngagementRate: Math.round(avgEngagementRate * 10000) / 100,
          totalReach,
          topModel,
        },
      }
    } catch (error) {
      console.error('Failed to get dashboard summary:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Mock performance data for demo mode
   */
  _getMockPerformanceData() {
    return [
      {
        ai_model: 'imagen-4.0',
        ai_style: 'photorealistic',
        asset_type: 'image',
        total_campaigns: 45,
        total_reach: 12500,
        avg_delivery_rate: 0.95,
        avg_engagement_rate: 0.042,
      },
      {
        ai_model: 'veo-3.1',
        ai_style: 'cinematic',
        asset_type: 'video',
        total_campaigns: 12,
        total_reach: 3200,
        avg_delivery_rate: 0.93,
        avg_engagement_rate: 0.068,
      },
      {
        ai_model: 'sora-2',
        ai_style: 'dynamic',
        asset_type: 'video',
        total_campaigns: 8,
        total_reach: 2100,
        avg_delivery_rate: 0.94,
        avg_engagement_rate: 0.072,
      },
    ]
  }
}

export const analyticsService = new AnalyticsService()
export default analyticsService
