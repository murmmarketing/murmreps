CREATE TABLE IF NOT EXISTS search_queries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  query text NOT NULL,
  results_count integer DEFAULT 0,
  searched_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_queries_query ON search_queries(query);
CREATE INDEX IF NOT EXISTS idx_search_queries_time ON search_queries(searched_at);
