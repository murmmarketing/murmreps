-- Referral system tables
CREATE TABLE IF NOT EXISTS referrers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname text NOT NULL,
  email text,
  ref_code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referral_visits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ref_code text NOT NULL,
  visited_at timestamptz DEFAULT now(),
  converted boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_referral_code ON referral_visits(ref_code);
CREATE INDEX IF NOT EXISTS idx_referrer_code ON referrers(ref_code);
