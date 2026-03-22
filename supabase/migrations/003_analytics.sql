CREATE TABLE analytics (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  product_id INTEGER REFERENCES products(id),
  agent_name TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_analytics_event ON analytics(event_type);
CREATE INDEX idx_analytics_created ON analytics(created_at);
CREATE INDEX idx_analytics_agent ON analytics(agent_name);
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert from anon" ON analytics FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow service role read" ON analytics FOR SELECT TO service_role USING (true);
