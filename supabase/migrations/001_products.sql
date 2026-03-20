CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT DEFAULT 'Various',
  category TEXT NOT NULL CHECK (category IN ('Shoes', 'Streetwear', 'Bags & Acc', 'Jewelry')),
  price_cny DECIMAL,
  price_usd DECIMAL,
  price_eur DECIMAL,
  tier TEXT CHECK (tier IN ('budget', 'mid', 'premium')),
  quality TEXT CHECK (quality IN ('best', 'good', 'budget')),
  source_link TEXT,
  image TEXT,
  images JSONB DEFAULT '[]',
  variants JSONB DEFAULT '[]',
  qc_photos JSONB DEFAULT '[]',
  delivery_days INTEGER,
  weight_g INTEGER,
  dimensions TEXT,
  verified BOOLEAN DEFAULT false,
  qc_rating INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can read all products
CREATE POLICY "Public read" ON products FOR SELECT USING (true);

-- Only service role can insert/update/delete (admin panel uses service role)
CREATE POLICY "Service role full access" ON products FOR ALL USING (auth.role() = 'service_role');
