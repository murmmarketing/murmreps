// Google Analytics 4 event helpers
// These fire alongside existing Supabase analytics — both systems run in parallel

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function gtagEvent(action: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, params);
  }
}

export function trackAgentClick(agentName: string, productId?: number) {
  gtagEvent("agent_click", { agent_name: agentName, product_id: productId });
}

export function trackProductView(productId: number, category?: string) {
  gtagEvent("product_view", { product_id: productId, category });
}

export function trackConverterUse(platform?: string) {
  gtagEvent("converter_use", { platform });
}

export function trackSignupClick(agentName: string) {
  gtagEvent("signup_click", { agent_name: agentName });
}

export function trackSearch(query: string) {
  gtagEvent("search", { search_term: query });
}
