-- User Subscriptions Table
-- Phase 4: Tier-based rate limiting and usage tracking

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Tier: free (default), pro ($29/mo), enterprise (custom)
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),

  -- Billing (Stripe integration ready)
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  billing_cycle_start TIMESTAMPTZ DEFAULT NOW(),
  billing_cycle_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 month'),

  -- Tier Limits (overridable per-user)
  video_generations_limit INTEGER,
  image_generations_limit INTEGER,
  messages_limit INTEGER,

  -- Usage Counters (reset at billing_cycle_start)
  video_generations_used INTEGER DEFAULT 0,
  image_generations_used INTEGER DEFAULT 0,
  messages_used INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick user lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all subscriptions (for Edge Functions)
CREATE POLICY "Service role full access" ON user_subscriptions
  FOR ALL USING (true) WITH CHECK (true);

-- Function to get tier limits
CREATE OR REPLACE FUNCTION get_tier_limits(p_tier TEXT)
RETURNS TABLE(video_limit INT, image_limit INT, message_limit INT) AS $$
BEGIN
  RETURN QUERY SELECT
    CASE p_tier
      WHEN 'free' THEN 10
      WHEN 'pro' THEN 50
      ELSE 999999
    END,
    CASE p_tier
      WHEN 'free' THEN 100
      WHEN 'pro' THEN 500
      ELSE 999999
    END,
    CASE p_tier
      WHEN 'free' THEN 500
      WHEN 'pro' THEN 5000
      ELSE 999999
    END;
END;
$$ LANGUAGE plpgsql;

-- Atomic increment function for video usage
CREATE OR REPLACE FUNCTION increment_video_usage(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE user_subscriptions
  SET video_generations_used = video_generations_used + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Create subscription if it doesn't exist (free tier)
  IF NOT FOUND THEN
    INSERT INTO user_subscriptions (user_id, tier, video_generations_used)
    VALUES (p_user_id, 'free', 1)
    ON CONFLICT (user_id) DO UPDATE
    SET video_generations_used = user_subscriptions.video_generations_used + 1,
        updated_at = NOW();
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Atomic increment function for image usage
CREATE OR REPLACE FUNCTION increment_image_usage(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE user_subscriptions
  SET image_generations_used = image_generations_used + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Create subscription if it doesn't exist (free tier)
  IF NOT FOUND THEN
    INSERT INTO user_subscriptions (user_id, tier, image_generations_used)
    VALUES (p_user_id, 'free', 1)
    ON CONFLICT (user_id) DO UPDATE
    SET image_generations_used = user_subscriptions.image_generations_used + 1,
        updated_at = NOW();
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Atomic increment function for message usage
CREATE OR REPLACE FUNCTION increment_message_usage(p_user_id UUID, p_count INTEGER DEFAULT 1)
RETURNS void AS $$
BEGIN
  UPDATE user_subscriptions
  SET messages_used = messages_used + p_count,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO user_subscriptions (user_id, tier, messages_used)
    VALUES (p_user_id, 'free', p_count)
    ON CONFLICT (user_id) DO UPDATE
    SET messages_used = user_subscriptions.messages_used + p_count,
        updated_at = NOW();
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to reset usage counters when billing cycle resets
CREATE OR REPLACE FUNCTION reset_usage_on_cycle()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.billing_cycle_start > OLD.billing_cycle_start THEN
    NEW.video_generations_used := 0;
    NEW.image_generations_used := 0;
    NEW.messages_used := 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reset_usage_trigger
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION reset_usage_on_cycle();

-- Function to check if user can perform action
CREATE OR REPLACE FUNCTION can_perform_action(p_user_id UUID, p_action_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_sub RECORD;
  v_limits RECORD;
BEGIN
  SELECT * INTO v_sub FROM user_subscriptions WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    -- Default to free tier limits
    RETURN CASE p_action_type
      WHEN 'video' THEN TRUE  -- First use always allowed
      WHEN 'image' THEN TRUE
      WHEN 'message' THEN TRUE
      ELSE TRUE
    END;
  END IF;

  SELECT * INTO v_limits FROM get_tier_limits(v_sub.tier);

  RETURN CASE p_action_type
    WHEN 'video' THEN v_sub.video_generations_used < COALESCE(v_sub.video_generations_limit, v_limits.video_limit)
    WHEN 'image' THEN v_sub.image_generations_used < COALESCE(v_sub.image_generations_limit, v_limits.image_limit)
    WHEN 'message' THEN v_sub.messages_used < COALESCE(v_sub.messages_limit, v_limits.message_limit)
    ELSE TRUE
  END;
END;
$$ LANGUAGE plpgsql;
