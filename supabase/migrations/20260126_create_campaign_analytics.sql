-- Campaign Analytics Table
-- Phase 4: Track engagement metrics by AI model/style for performance comparison

CREATE TABLE IF NOT EXISTS campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- AI Generation Metadata
  ai_model TEXT,        -- 'imagen-4.0', 'veo-3.1', 'sora-2', 'gemini-flash'
  ai_style TEXT,        -- 'photorealistic', 'cinematic', 'artistic', etc.
  asset_type TEXT,      -- 'image', 'video', 'text'
  asset_url TEXT,
  generation_prompt TEXT,

  -- Delivery Metrics
  total_recipients INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,

  -- Engagement Metrics (updated via Twilio webhook)
  opened_count INTEGER DEFAULT 0,      -- For email campaigns
  clicked_count INTEGER DEFAULT 0,     -- Link clicks
  replied_count INTEGER DEFAULT 0,     -- SMS replies
  unsubscribed_count INTEGER DEFAULT 0,

  -- Computed Rates (stored for efficient querying)
  delivery_rate DECIMAL(5,4) GENERATED ALWAYS AS (
    CASE WHEN total_recipients > 0
      THEN delivered_count::DECIMAL / total_recipients
      ELSE 0
    END
  ) STORED,
  engagement_rate DECIMAL(5,4) GENERATED ALWAYS AS (
    CASE WHEN delivered_count > 0
      THEN (clicked_count + replied_count)::DECIMAL / delivered_count
      ELSE 0
    END
  ) STORED,

  -- Cost Tracking
  generation_cost_usd DECIMAL(10,4) DEFAULT 0,
  delivery_cost_usd DECIMAL(10,4) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  campaign_sent_at TIMESTAMPTZ
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_user ON campaign_analytics(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_model ON campaign_analytics(ai_model, ai_style);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_performance ON campaign_analytics(engagement_rate DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign ON campaign_analytics(campaign_id);

-- Enable RLS
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;

-- Users can view their own analytics
CREATE POLICY "Users can view own analytics" ON campaign_analytics
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert/update (for Edge Functions)
CREATE POLICY "Service role can manage" ON campaign_analytics
  FOR ALL USING (true) WITH CHECK (true);

-- AI Model Performance View
-- Aggregates performance metrics by AI model/style for comparison
CREATE OR REPLACE VIEW ai_model_performance AS
SELECT
  ai_model,
  ai_style,
  asset_type,
  COUNT(*) as total_campaigns,
  SUM(total_recipients) as total_reach,
  AVG(delivery_rate) as avg_delivery_rate,
  AVG(engagement_rate) as avg_engagement_rate,
  SUM(clicked_count) as total_clicks,
  SUM(replied_count) as total_replies,
  SUM(generation_cost_usd) as total_generation_cost,
  SUM(delivery_cost_usd) as total_delivery_cost
FROM campaign_analytics
WHERE created_at > NOW() - INTERVAL '90 days'
  AND ai_model IS NOT NULL
GROUP BY ai_model, ai_style, asset_type
ORDER BY avg_engagement_rate DESC;

-- Top Performing Campaigns View
CREATE OR REPLACE VIEW top_performing_campaigns AS
SELECT
  id,
  campaign_id,
  user_id,
  ai_model,
  ai_style,
  asset_type,
  total_recipients,
  delivered_count,
  clicked_count,
  replied_count,
  delivery_rate,
  engagement_rate,
  campaign_sent_at
FROM campaign_analytics
WHERE campaign_sent_at > NOW() - INTERVAL '30 days'
  AND total_recipients >= 10  -- Minimum sample size
ORDER BY engagement_rate DESC
LIMIT 100;

-- Function to record campaign launch with AI metadata
CREATE OR REPLACE FUNCTION record_campaign_launch(
  p_campaign_id TEXT,
  p_user_id UUID,
  p_ai_model TEXT DEFAULT NULL,
  p_ai_style TEXT DEFAULT NULL,
  p_asset_type TEXT DEFAULT NULL,
  p_asset_url TEXT DEFAULT NULL,
  p_generation_prompt TEXT DEFAULT NULL,
  p_total_recipients INTEGER DEFAULT 0,
  p_generation_cost DECIMAL DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  v_analytics_id UUID;
BEGIN
  INSERT INTO campaign_analytics (
    campaign_id, user_id, ai_model, ai_style, asset_type,
    asset_url, generation_prompt, total_recipients,
    generation_cost_usd, campaign_sent_at
  ) VALUES (
    p_campaign_id, p_user_id, p_ai_model, p_ai_style, p_asset_type,
    p_asset_url, p_generation_prompt, p_total_recipients,
    p_generation_cost, NOW()
  )
  RETURNING id INTO v_analytics_id;

  RETURN v_analytics_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update delivery metrics (called from Twilio webhook)
CREATE OR REPLACE FUNCTION update_campaign_delivery(
  p_campaign_id TEXT,
  p_delivered INTEGER DEFAULT 0,
  p_failed INTEGER DEFAULT 0
)
RETURNS void AS $$
BEGIN
  UPDATE campaign_analytics
  SET
    delivered_count = delivered_count + p_delivered,
    failed_count = failed_count + p_failed,
    updated_at = NOW()
  WHERE campaign_id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update engagement metrics (called from Twilio webhook)
CREATE OR REPLACE FUNCTION update_campaign_engagement(
  p_campaign_id TEXT,
  p_clicked INTEGER DEFAULT 0,
  p_replied INTEGER DEFAULT 0,
  p_unsubscribed INTEGER DEFAULT 0
)
RETURNS void AS $$
BEGIN
  UPDATE campaign_analytics
  SET
    clicked_count = clicked_count + p_clicked,
    replied_count = replied_count + p_replied,
    unsubscribed_count = unsubscribed_count + p_unsubscribed,
    updated_at = NOW()
  WHERE campaign_id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;
