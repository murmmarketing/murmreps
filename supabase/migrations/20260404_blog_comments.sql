CREATE TABLE IF NOT EXISTS blog_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  nickname text DEFAULT 'Anonymous',
  comment text NOT NULL,
  created_at timestamptz DEFAULT now(),
  ip_hash text
);

CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON blog_comments(post_id);
