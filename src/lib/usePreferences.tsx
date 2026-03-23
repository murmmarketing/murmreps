"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PriceProduct {
  price_cny?: number | null;
  price_usd?: number | null;
  price_eur?: number | null;
}

interface Preferences {
  preferred_agent: string;
  preferred_currency: string;
  preferred_language: string;
  preferences_set: boolean;
}

const defaults: Preferences = {
  preferred_agent: "kakobuy",
  preferred_currency: "EUR",
  preferred_language: "en",
  preferences_set: false,
};

const PreferencesContext = createContext<{
  prefs: Preferences;
  setPrefs: (p: Partial<Preferences>) => void;
  formatPrice: (product: PriceProduct) => string;
}>({ prefs: defaults, setPrefs: () => {}, formatPrice: () => "" });

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefsState] = useState<Preferences>(defaults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("murmreps_preferences");
    if (saved) {
      try { setPrefsState({ ...defaults, ...JSON.parse(saved) }); } catch {}
    }
    setLoaded(true);
  }, []);

  const setPrefs = (partial: Partial<Preferences>) => {
    setPrefsState(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem("murmreps_preferences", JSON.stringify(next));
      return next;
    });
  };

  // Currency conversion rates from CNY (approximate)
  const rates: Record<string, { symbol: string; rate: number }> = {
    CNY: { symbol: "\u00A5", rate: 1 },
    USD: { symbol: "$", rate: 0.14 },
    EUR: { symbol: "\u20AC", rate: 0.13 },
    GBP: { symbol: "\u00A3", rate: 0.11 },
    AUD: { symbol: "A$", rate: 0.22 },
    CAD: { symbol: "C$", rate: 0.19 },
    PLN: { symbol: "z\u0142", rate: 0.56 },
    CHF: { symbol: "CHF ", rate: 0.12 },
  };

  const formatPrice = (product: PriceProduct): string => {
    const cur = prefs.preferred_currency;
    // Use existing converted prices if available
    if (cur === "CNY" && product.price_cny != null) return `\u00A5${product.price_cny}`;
    if (cur === "USD" && product.price_usd != null) return `$${product.price_usd}`;
    if (cur === "EUR" && product.price_eur != null) return `\u20AC${product.price_eur}`;
    // Convert from CNY
    if (product.price_cny != null) {
      const r = rates[cur] || rates.CNY;
      const converted = (product.price_cny * r.rate).toFixed(2);
      return `${r.symbol}${converted}`;
    }
    return "Multi";
  };

  if (!loaded) return null; // avoid hydration mismatch

  return (
    <PreferencesContext.Provider value={{ prefs, setPrefs, formatPrice }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}
