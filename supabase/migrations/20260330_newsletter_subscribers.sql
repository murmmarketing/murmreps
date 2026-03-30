CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz,
  source text DEFAULT 'popup'
);

-- Index for quick lookups and active subscriber counts
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers (email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers (subscribed_at) WHERE unsubscribed_at IS NULL;
