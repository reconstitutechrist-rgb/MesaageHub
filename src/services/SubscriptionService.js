/**
 * SubscriptionService - Manages user subscription tiers and usage tracking
 * Phase 4: Performance & Production Scaling
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase'

// Tier configuration with limits and pricing
const TIER_CONFIG = {
  free: {
    name: 'Free',
    price: 0,
    videoLimit: 10,
    imageLimit: 100,
    messageLimit: 500,
    features: [
      'Basic AI backgrounds',
      '10 video generations/month',
      '100 image generations/month',
      'Standard support',
    ],
  },
  pro: {
    name: 'Pro',
    price: 29,
    videoLimit: 50,
    imageLimit: 500,
    messageLimit: 5000,
    features: [
      'All AI models (Veo 3.1, Sora 2, Imagen 4.0)',
      '50 video generations/month',
      '500 image generations/month',
      'Priority support',
      'Analytics dashboard',
      'Advanced export options',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: null, // Custom pricing
    videoLimit: Infinity,
    imageLimit: Infinity,
    messageLimit: Infinity,
    features: [
      'Unlimited everything',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'White-label options',
    ],
  },
}

class SubscriptionService {
  /**
   * Get current user's subscription
   */
  async getSubscription(userId) {
    if (!isSupabaseConfigured || !userId) {
      return this._getDefaultSubscription()
    }

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        // User doesn't have a subscription yet - return free tier
        if (error.code === 'PGRST116') {
          return this._getDefaultSubscription()
        }
        throw error
      }

      const tierConfig = TIER_CONFIG[data.tier] || TIER_CONFIG.free

      return {
        success: true,
        data: {
          ...data,
          ...tierConfig,
          usage: {
            video: data.video_generations_used || 0,
            image: data.image_generations_used || 0,
            message: data.messages_used || 0,
          },
          limits: {
            video: data.video_generations_limit || tierConfig.videoLimit,
            image: data.image_generations_limit || tierConfig.imageLimit,
            message: data.messages_limit || tierConfig.messageLimit,
          },
        },
      }
    } catch (error) {
      console.error('Failed to get subscription:', error)
      return this._getDefaultSubscription()
    }
  }

  /**
   * Create a new subscription for a user (called on registration)
   */
  async createSubscription(userId, tier = 'free') {
    if (!isSupabaseConfigured || !userId) {
      return { success: true, data: this._getDefaultSubscription().data }
    }

    const config = TIER_CONFIG[tier] || TIER_CONFIG.free
    const now = new Date()
    const cycleEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          tier,
          video_generations_limit: config.videoLimit === Infinity ? 999999 : config.videoLimit,
          image_generations_limit: config.imageLimit === Infinity ? 999999 : config.imageLimit,
          messages_limit: config.messageLimit === Infinity ? 999999 : config.messageLimit,
          billing_cycle_start: now.toISOString(),
          billing_cycle_end: cycleEnd.toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Failed to create subscription:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Check if user can perform a specific action based on their limits
   */
  async canPerformAction(userId, actionType) {
    const { data: sub } = await this.getSubscription(userId)

    switch (actionType) {
      case 'video':
        return sub.usage.video < sub.limits.video
      case 'image':
        return sub.usage.image < sub.limits.image
      case 'message':
        return sub.usage.message < sub.limits.message
      default:
        return true
    }
  }

  /**
   * Get usage statistics for display in UI
   */
  async getUsageStats(userId) {
    const { data: sub } = await this.getSubscription(userId)

    const calculatePercentage = (used, limit) => {
      if (limit === Infinity || limit >= 999999) return 0
      return Math.min(100, Math.round((used / limit) * 100))
    }

    return {
      video: {
        used: sub.usage.video,
        limit: sub.limits.video,
        percentage: calculatePercentage(sub.usage.video, sub.limits.video),
        isUnlimited: sub.limits.video >= 999999,
      },
      image: {
        used: sub.usage.image,
        limit: sub.limits.image,
        percentage: calculatePercentage(sub.usage.image, sub.limits.image),
        isUnlimited: sub.limits.image >= 999999,
      },
      message: {
        used: sub.usage.message,
        limit: sub.limits.message,
        percentage: calculatePercentage(sub.usage.message, sub.limits.message),
        isUnlimited: sub.limits.message >= 999999,
      },
      tier: sub.tier,
      tierName: sub.name,
      resetDate: sub.billing_cycle_end,
    }
  }

  /**
   * Get configuration for a specific tier
   */
  getTierConfig(tier) {
    return TIER_CONFIG[tier] || TIER_CONFIG.free
  }

  /**
   * Get all available tiers for pricing page
   */
  getAllTiers() {
    return Object.entries(TIER_CONFIG).map(([id, config]) => ({
      id,
      ...config,
    }))
  }

  /**
   * Check if user should see upgrade prompts
   */
  async shouldShowUpgradePrompt(userId) {
    const stats = await this.getUsageStats(userId)

    // Show upgrade if any resource is at 80% or more
    return (
      stats.tier === 'free' &&
      (stats.video.percentage >= 80 ||
        stats.image.percentage >= 80 ||
        stats.message.percentage >= 80)
    )
  }

  /**
   * Get default free tier subscription
   */
  _getDefaultSubscription() {
    const config = TIER_CONFIG.free
    return {
      success: true,
      data: {
        tier: 'free',
        ...config,
        usage: { video: 0, image: 0, message: 0 },
        limits: {
          video: config.videoLimit,
          image: config.imageLimit,
          message: config.messageLimit,
        },
        billing_cycle_end: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          1
        ).toISOString(),
      },
    }
  }
}

export const subscriptionService = new SubscriptionService()
export default subscriptionService
