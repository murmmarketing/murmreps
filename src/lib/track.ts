import { supabase } from "./supabase";

export function trackEvent(
  event_type: string,
  data?: { product_id?: number; agent_name?: string; metadata?: Record<string, unknown> }
) {
  // Fire and forget — don't block UI
  supabase
    .from("analytics")
    .insert({ event_type, ...data })
    .then(() => {});
}
