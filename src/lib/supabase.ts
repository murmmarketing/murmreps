import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public client for reading products (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for write operations (server-side only, uses service_role key)
export function getAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price_cny: number | null;
  price_usd: number | null;
  price_eur: number | null;
  tier: string | null;
  quality: string | null;
  source_link: string;
  image: string;
  images: string[];
  variants: { name: string; image?: string }[];
  qc_photos: { set: string; images: string[] }[];
  delivery_days: number | null;
  weight_g: number | null;
  dimensions: string | null;
  verified: boolean;
  qc_rating: number | null;
  views: number;
  likes: number;
  dislikes: number;
  created_at: string;
  updated_at: string;
}
