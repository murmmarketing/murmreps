ALTER TABLE products ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS dislikes INTEGER DEFAULT 0;

CREATE OR REPLACE FUNCTION increment_likes(product_id INTEGER)
RETURNS void AS $$
UPDATE products SET likes = likes + 1 WHERE id = product_id;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_dislikes(product_id INTEGER)
RETURNS void AS $$
UPDATE products SET dislikes = dislikes + 1 WHERE id = product_id;
$$ LANGUAGE sql SECURITY DEFINER;
