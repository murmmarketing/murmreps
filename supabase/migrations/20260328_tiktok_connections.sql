-- TikTok OAuth connections table
CREATE TABLE IF NOT EXISTS tiktok_connections (
  id TEXT PRIMARY KEY DEFAULT 'default',
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  open_id TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS but allow service_role full access
ALTER TABLE tiktok_connections ENABLE ROW LEVEL SECURITY;

-- Only service_role can access (no anon/authenticated access)
CREATE POLICY "Service role full access" ON tiktok_connections
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
