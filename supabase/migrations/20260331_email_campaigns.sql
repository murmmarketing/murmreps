CREATE TABLE IF NOT EXISTS email_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subject text NOT NULL,
  audience text DEFAULT 'all',
  sent_count integer DEFAULT 0,
  error_count integer DEFAULT 0,
  sent_at timestamptz DEFAULT now()
);
