-- Add featured product columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_rank INTEGER;

-- Index for fast featured queries
CREATE INDEX IF NOT EXISTS idx_products_featured ON products (featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_featured_rank ON products (featured_rank) WHERE featured_rank IS NOT NULL;
