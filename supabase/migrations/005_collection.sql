ALTER TABLE products ADD COLUMN IF NOT EXISTS collection TEXT;
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
