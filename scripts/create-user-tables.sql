-- ============================================
-- Run this SQL in Supabase SQL Editor to create
-- all tables needed for user features.
-- ============================================

-- 1. Email Subscribers (for weekly digest)
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

CREATE INDEX IF NOT EXISTS idx_email_subscribers_active ON email_subscribers (is_active) WHERE is_active = true;

-- 2. Saved Opportunities (bookmarks)
CREATE TABLE IF NOT EXISTS saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  notes TEXT DEFAULT '',
  remind_before_deadline BOOLEAN DEFAULT false,
  reminder_days INTEGER DEFAULT 7,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_opps_user ON saved_opportunities (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_opps_opp ON saved_opportunities (opportunity_id);

-- 3. Application Tracking (Kanban board)
CREATE TABLE IF NOT EXISTS application_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'researching' CHECK (status IN ('researching', 'writing', 'submitted', 'awarded', 'rejected', 'archived')),
  notes TEXT DEFAULT '',
  submitted_at TIMESTAMPTZ,
  awarded_amount INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_app_tracking_user ON application_tracking (user_id);

-- ============================================
-- Row Level Security Policies
-- ============================================

ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_tracking ENABLE ROW LEVEL SECURITY;

-- Saved opportunities: users can only see/modify their own
CREATE POLICY "Users can view own saved opportunities" ON saved_opportunities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved opportunities" ON saved_opportunities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved opportunities" ON saved_opportunities
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update own saved opportunities" ON saved_opportunities
  FOR UPDATE USING (auth.uid() = user_id);

-- Application tracking: users can only see/modify their own
CREATE POLICY "Users can view own applications" ON application_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications" ON application_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications" ON application_tracking
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON application_tracking
  FOR UPDATE USING (auth.uid() = user_id);
