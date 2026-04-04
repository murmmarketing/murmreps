CREATE TABLE IF NOT EXISTS agent_coupons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent text NOT NULL,
  code text NOT NULL,
  description text,
  discount_type text DEFAULT 'percentage',
  discount_value text,
  min_spend text,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
