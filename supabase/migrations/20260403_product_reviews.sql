-- Product reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id integer NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  nickname text DEFAULT 'Anonymous',
  created_at timestamptz DEFAULT now(),
  ip_hash text,
  helpful_count integer DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON product_reviews(rating);

-- Add rating columns to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS avg_rating numeric(2,1);
ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;
