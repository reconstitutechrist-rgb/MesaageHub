-- Add dedicated Twilio phone number columns to user_subscriptions
-- Each subscriber gets their own Twilio number assigned on signup

ALTER TABLE user_subscriptions
  ADD COLUMN IF NOT EXISTS twilio_phone_number TEXT,
  ADD COLUMN IF NOT EXISTS twilio_phone_sid TEXT;

-- Index for looking up which user owns a given number (inbound routing)
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_twilio_phone
  ON user_subscriptions(twilio_phone_number)
  WHERE twilio_phone_number IS NOT NULL;

-- Comment for clarity
COMMENT ON COLUMN user_subscriptions.twilio_phone_number IS 'Dedicated Twilio phone number assigned to this subscriber (E.164 format)';
COMMENT ON COLUMN user_subscriptions.twilio_phone_sid IS 'Twilio IncomingPhoneNumber SID for managing this number';
