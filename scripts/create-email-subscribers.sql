-- Create email_subscribers table
CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  alert_preference TEXT NOT NULL DEFAULT 'all_grants' CHECK (alert_preference IN ('similar_only', 'all_grants')),
  focus_areas TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  unsubscribe_token UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for weekly digest queries
CREATE INDEX IF NOT EXISTS idx_email_subscribers_active ON email_subscribers (is_active) WHERE is_active = true;

-- RLS policies
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow inserts from service role (API routes use admin client)
-- No public read access needed
