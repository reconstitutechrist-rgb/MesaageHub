-- API Usage Logs Table
-- Phase 4: Cost tracking and usage analytics per API call

CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- API Call Details
  api_provider TEXT NOT NULL,  -- 'google', 'openai', 'creatomate', 'twilio', 'remove-bg'
  api_endpoint TEXT NOT NULL,  -- 'imagen-4.0', 'veo-3.1', 'sora-2', 'gemini-flash', 'gemini-pro'
  action TEXT NOT NULL,        -- 'generate-background', 'generate-video', 'generate-copy', etc.

  -- Request Metadata (sanitized, no PII)
  request_params JSONB,

  -- Response Metadata
  response_status TEXT NOT NULL DEFAULT 'pending',  -- 'success', 'error', 'rate_limited', 'pending'
  response_time_ms INTEGER,
  error_code TEXT,
  error_message TEXT,

  -- Cost Tracking
  input_tokens INTEGER,
  output_tokens INTEGER,
  estimated_cost_usd DECIMAL(10,6) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user ON api_usage_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_provider ON api_usage_logs(api_provider, api_endpoint);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_date ON api_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_action ON api_usage_logs(action, response_status);

-- Enable RLS
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own logs
CREATE POLICY "Users can view own logs" ON api_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert/update (for Edge Functions)
CREATE POLICY "Service role can insert" ON api_usage_logs
  FOR INSERT WITH CHECK (true);

-- Aggregation view for user cost summary
CREATE OR REPLACE VIEW user_cost_summary AS
SELECT
  user_id,
  DATE_TRUNC('month', created_at) as month,
  api_provider,
  api_endpoint,
  COUNT(*) as total_calls,
  SUM(CASE WHEN response_status = 'success' THEN 1 ELSE 0 END) as successful_calls,
  SUM(CASE WHEN response_status = 'error' THEN 1 ELSE 0 END) as failed_calls,
  SUM(estimated_cost_usd) as total_cost,
  AVG(response_time_ms) as avg_response_time_ms,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens
FROM api_usage_logs
GROUP BY user_id, DATE_TRUNC('month', created_at), api_provider, api_endpoint;

-- Daily aggregation for dashboards
CREATE OR REPLACE VIEW daily_api_usage AS
SELECT
  DATE_TRUNC('day', created_at) as day,
  api_provider,
  api_endpoint,
  action,
  COUNT(*) as total_calls,
  SUM(CASE WHEN response_status = 'success' THEN 1 ELSE 0 END) as successful_calls,
  SUM(estimated_cost_usd) as total_cost,
  AVG(response_time_ms) as avg_response_time_ms
FROM api_usage_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), api_provider, api_endpoint, action
ORDER BY day DESC;

-- Function to log API usage (called from Edge Functions)
CREATE OR REPLACE FUNCTION log_api_usage(
  p_user_id UUID,
  p_api_provider TEXT,
  p_api_endpoint TEXT,
  p_action TEXT,
  p_response_status TEXT,
  p_response_time_ms INTEGER DEFAULT NULL,
  p_estimated_cost DECIMAL DEFAULT 0,
  p_error_code TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_input_tokens INTEGER DEFAULT NULL,
  p_output_tokens INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO api_usage_logs (
    user_id, api_provider, api_endpoint, action,
    response_status, response_time_ms, estimated_cost_usd,
    error_code, error_message, input_tokens, output_tokens
  ) VALUES (
    p_user_id, p_api_provider, p_api_endpoint, p_action,
    p_response_status, p_response_time_ms, p_estimated_cost,
    p_error_code, p_error_message, p_input_tokens, p_output_tokens
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;
