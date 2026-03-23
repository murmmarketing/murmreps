"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePreferences } from "@/lib/usePreferences";

const agentOptions = [
  { key: "kakobuy", label: "KakoBuy", recommended: true },
  { key: "superbuy", label: "Superbuy", recommended: false },
  { key: "cnfans", label: "CnFans", recommended: false },
  { key: "mulebuy", label: "MuleBuy", recommended: false },
  { key: "acbuy", label: "ACBuy", recommended: false },
  { key: "lovegobuy", label: "LoveGoBuy", recommended: false },
  { key: "joyagoo", label: "JoyaGoo", recommended: false },
  { key: "sugargoo", label: "SugarGoo", recommended: false },
];

const currencyOptions = [
  { code: "EUR", symbol: "\u20AC" },
  { code: "USD", symbol: "$" },
  { code: "CNY", symbol: "\u00A5" },
  { code: "GBP", symbol: "\u00A3" },
  { code: "AUD", symbol: "A$" },
  { code: "CAD", symbol: "C$" },
  { code: "PLN", symbol: "z\u0142" },
  { code: "CHF", symbol: "CHF" },
];

const languageOptions = [
  { code: "en", label: "English", flag: "\uD83C\uDDEC\uD83C\uDDE7" },
  { code: "nl", label: "Nederlands", flag: "\uD83C\uDDF3\uD83C\uDDF1" },
  { code: "de", label: "Deutsch", flag: "\uD83C\uDDE9\uD83C\uDDEA" },
  { code: "fr", label: "Fran\u00E7ais", flag: "\uD83C\uDDEB\uD83C\uDDF7" },
  { code: "es", label: "Espa\u00F1ol", flag: "\uD83C\uDDEA\uD83C\uDDF8" },
  { code: "pl", label: "Polski", flag: "\uD83C\uDDF5\uD83C\uDDF1" },
];

export default function WelcomePopup() {
  const { prefs, setPrefs } = usePreferences();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  // Local state for selections before saving
  const [agent, setAgent] = useState(prefs.preferred_agent);
  const [currency, setCurrency] = useState(prefs.preferred_currency);
  const [language, setLanguage] = useState(prefs.preferred_language);

  useEffect(() => {
    if (prefs.preferences_set) return;
    if (pathname.startsWith("/admin")) return;

    const timer = setTimeout(() => {
      setVisible(true);
      // Trigger animation after mount
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimateIn(true);
        });
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [prefs.preferences_set, pathname]);

  const handleSave = () => {
    setPrefs({
      preferred_agent: agent,
      preferred_currency: currency,
      preferred_language: language,
      preferences_set: true,
    });
    setAnimateIn(false);
    setTimeout(() => setVisible(false), 300);
  };

  const handleClose = () => {
    setPrefs({ preferences_set: true });
    setAnimateIn(false);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{
        backgroundColor: animateIn ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0)",
        transition: "background-color 0.3s ease",
      }}
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-2xl bg-[#141414] p-8"
        style={{
          opacity: animateIn ? 1 : 0,
          transform: animateIn ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-[#6C757D] transition-colors hover:text-white"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <h2 className="font-heading text-2xl font-bold text-white">
          Welcome to MurmReps! {"\uD83C\uDF89"}
        </h2>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          Set your preferences for the best experience.
        </p>

        {/* Section 1: Agent */}
        <div className="mt-6">
          <label className="text-xs font-semibold uppercase tracking-[1px] text-[#FE4205]">
            Choose Your Agent
          </label>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {agentOptions.map((a) => (
              <button
                key={a.key}
                onClick={() => setAgent(a.key)}
                className={`relative rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  agent === a.key
                    ? "border border-[#FE4205] bg-[rgba(254,66,5,0.1)] text-white"
                    : "border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] text-[#9CA3AF] hover:border-[rgba(255,255,255,0.2)]"
                }`}
              >
                {a.label}
                {a.recommended && (
                  <span className="mt-0.5 block text-[10px] text-[#FE4205]">
                    {"\u2B50"} Recommended
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Currency */}
        <div className="mt-6">
          <label className="text-xs font-semibold uppercase tracking-[1px] text-[#FE4205]">
            Choose Your Currency
          </label>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {currencyOptions.map((c) => (
              <button
                key={c.code}
                onClick={() => setCurrency(c.code)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  currency === c.code
                    ? "bg-[#FE4205] text-white"
                    : "bg-[#1a1a1a] text-[#9CA3AF] hover:text-white"
                }`}
              >
                {c.symbol} {c.code}
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Language */}
        <div className="mt-6">
          <label className="text-xs font-semibold uppercase tracking-[1px] text-[#FE4205]">
            Choose Your Language
          </label>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {languageOptions.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  language === l.code
                    ? "border border-[#FE4205] bg-[rgba(254,66,5,0.1)] text-white"
                    : "border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] text-[#9CA3AF] hover:border-[rgba(255,255,255,0.2)]"
                }`}
              >
                <span className="mr-1">{l.flag}</span> {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="mt-8 h-12 w-full rounded-xl bg-[#FE4205] text-base font-bold text-white transition-all hover:shadow-[0_0_24px_rgba(254,66,5,0.3)]"
        >
          Save Preferences &amp; Continue
        </button>
      </div>
    </div>
  );
}
