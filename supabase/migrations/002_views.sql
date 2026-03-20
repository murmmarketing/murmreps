ALTER TABLE products ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

CREATE OR REPLACE FUNCTION increment_views(product_id INTEGER)
RETURNS void AS $$
UPDATE products SET views = views + 1 WHERE id = product_id;
$$ LANGUAGE sql;
