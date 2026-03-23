"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePreferences } from "@/lib/usePreferences";

const agentReferralUrls: Record<string, string> = {
  kakobuy: "https://ikako.vip/r/6gkjt",
  superbuy: "https://www.superbuy.com/en/page/partner/?partnercode=Eg87dv",
  cnfans: "https://cnfans.com/?ref=17439797",
  mulebuy: "https://mulebuy.com/?ref=201054809",
  acbuy: "https://www.acbuy.com/?code=RJLAUE",
  lovegobuy: "https://www.lovegobuy.com/?invite_code=5C3H94",
  joyagoo: "https://joyagoo.com/register?ref=300914828",
  sugargoo: "https://www.sugargoo.com",
};

const agentNames: Record<string, string> = {
  kakobuy: "KakoBuy",
  superbuy: "Superbuy",
  cnfans: "CnFans",
  mulebuy: "MuleBuy",
  acbuy: "ACBuy",
  lovegobuy: "LoveGoBuy",
  joyagoo: "JoyaGoo",
  sugargoo: "SugarGoo",
};

const currencyOptions = [
  { code: "EUR", symbol: "\u20AC" },
  { code: "USD", symbol: "$" },
  { code: "GBP", symbol: "\u00A3" },
  { code: "CNY", symbol: "\u00A5" },
  { code: "AUD", symbol: "A$" },
  { code: "CAD", symbol: "C$" },
  { code: "PLN", symbol: "z\u0142" },
  { code: "CHF", symbol: "Fr" },
  { code: "CZK", symbol: "K\u010D" },
];

const otherAgents = ["superbuy", "cnfans", "mulebuy", "acbuy", "lovegobuy", "joyagoo", "sugargoo"];

export default function WelcomePopup() {
  const { prefs, setPrefs } = usePreferences();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [step, setStep] = useState(1);
  const [stepOpacity, setStepOpacity] = useState(1);

  const [selectedAgent, setSelectedAgent] = useState("kakobuy");
  const [selectedCurrency, setSelectedCurrency] = useState("EUR");

  useEffect(() => {
    if (prefs.preferences_set) return;
    if (pathname.startsWith("/admin")) return;

    const timer = setTimeout(() => {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimateIn(true);
        });
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [prefs.preferences_set, pathname]);

  function saveAndClose() {
    setPrefs({
      preferred_agent: selectedAgent,
      preferred_currency: selectedCurrency,
      preferences_set: true,
    });
    setAnimateIn(false);
    setTimeout(() => setVisible(false), 300);
  }

  function goToStep(next: number) {
    setStepOpacity(0);
    setTimeout(() => {
      setStep(next);
      setStepOpacity(1);
    }, 150);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{
        backgroundColor: animateIn ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        transition: "background-color 0.3s ease",
      }}
      onClick={saveAndClose}
    >
      <div
        className="relative w-[calc(100%-32px)] max-w-[460px] max-h-[90vh] overflow-y-auto rounded-[20px] p-6"
        style={{
          backgroundColor: "#0A0A0A",
          boxShadow: "0 0 60px rgba(254,66,5,0.08)",
          opacity: animateIn ? 1 : 0,
          transform: animateIn ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Orange glow line */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] rounded-t-[20px]"
          style={{
            background: "linear-gradient(to right, transparent, #FE4205, transparent)",
          }}
        />

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="rounded-full"
              style={{
                width: step === s ? 28 : 8,
                height: 8,
                backgroundColor: step === s ? "#FE4205" : "rgba(255,255,255,0.12)",
                transition: "width 0.3s ease, background-color 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* Step content with fade transition */}
        <div
          style={{
            opacity: stepOpacity,
            transition: "opacity 0.15s ease",
          }}
        >
          {/* Step 1: Choose Agent */}
          {step === 1 && (
            <div>
              <h2
                className="text-xl text-white"
                style={{ fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)", fontWeight: 700 }}
              >
                Quick setup
              </h2>
              <p className="mt-1 text-sm text-[#9CA3AF]">
                Choose your agent and currency to personalize pricing and links.
              </p>

              {/* KakoBuy featured card */}
              <button
                onClick={() => setSelectedAgent("kakobuy")}
                className="mt-5 w-full rounded-xl p-4 text-left transition-colors"
                style={{
                  backgroundColor: selectedAgent === "kakobuy" ? "rgba(254,66,5,0.08)" : "#141414",
                  border: selectedAgent === "kakobuy"
                    ? "1px solid #FE4205"
                    : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">KakoBuy</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-white"
                    style={{ fontSize: 10, backgroundColor: "#FE4205" }}
                  >
                    Best option
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#9CA3AF]">
                  Cheapest, fastest and most reliable.
                </p>
              </button>

              {/* Other agents grid */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {otherAgents.map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedAgent(key)}
                    className="rounded-xl p-3 text-sm font-medium text-white transition-colors"
                    style={{
                      backgroundColor: selectedAgent === key ? "rgba(254,66,5,0.08)" : "#141414",
                      border: selectedAgent === key
                        ? "1px solid #FE4205"
                        : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {agentNames[key]}
                  </button>
                ))}
              </div>

              {/* Next button */}
              <button
                onClick={() => goToStep(2)}
                className="mt-6 h-12 w-full rounded-xl bg-[#FE4205] text-white transition-all hover:shadow-[0_0_24px_rgba(254,66,5,0.3)]"
                style={{ fontWeight: 700 }}
              >
                Next
              </button>
            </div>
          )}

          {/* Step 2: Choose Currency */}
          {step === 2 && (
            <div>
              <h2
                className="text-xl text-white"
                style={{ fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)", fontWeight: 700 }}
              >
                Choose your currency
              </h2>
              <p className="mt-1 text-sm text-[#9CA3AF]">
                Select how prices are displayed across the site.
              </p>

              {/* 3x3 currency grid */}
              <div className="mt-5 grid grid-cols-3 gap-2">
                {currencyOptions.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setSelectedCurrency(c.code)}
                    className="rounded-xl p-3 text-center transition-colors"
                    style={{
                      backgroundColor: selectedCurrency === c.code ? "rgba(254,66,5,0.08)" : "#141414",
                      border: selectedCurrency === c.code
                        ? "1px solid #FE4205"
                        : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="text-lg text-white">{c.symbol}</div>
                    <div className="text-xs text-[#9CA3AF]">{c.code}</div>
                  </button>
                ))}
              </div>

              {/* Back + Next row */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => goToStep(1)}
                  className="text-sm text-[#9CA3AF] transition-colors hover:text-white"
                >
                  &larr; Back
                </button>
                <button
                  onClick={() => goToStep(3)}
                  className="flex-1 h-12 rounded-xl bg-[#FE4205] text-white transition-all hover:shadow-[0_0_24px_rgba(254,66,5,0.3)]"
                  style={{ fontWeight: 700 }}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Register CTA */}
          {step === 3 && (
            <div>
              <h2
                className="text-xl text-white"
                style={{ fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)", fontWeight: 700 }}
              >
                One last step
              </h2>
              <p className="mt-1 text-sm text-[#9CA3AF]">
                Support MurmReps by signing up with our recommended agent — it&apos;s free and helps us keep building.
              </p>

              {/* Selected agent card */}
              <div
                className="mt-5 rounded-xl p-4 text-center"
                style={{
                  backgroundColor: "#141414",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span className="text-base font-medium text-white">
                  {agentNames[selectedAgent] || selectedAgent}
                </span>
              </div>

              {/* Register CTA */}
              <button
                onClick={() => {
                  window.open(agentReferralUrls[selectedAgent] || "#", "_blank");
                  saveAndClose();
                }}
                className="mt-5 h-12 w-full rounded-xl bg-[#FE4205] text-white transition-all hover:shadow-[0_0_24px_rgba(254,66,5,0.3)]"
                style={{ fontWeight: 700 }}
              >
                Register on {agentNames[selectedAgent] || selectedAgent}
              </button>

              {/* Skip link */}
              <p
                className="mt-4 text-center text-sm cursor-pointer"
                style={{ color: "#6C757D" }}
                onClick={saveAndClose}
              >
                Skip and don&apos;t support 💔
              </p>

              {/* Back link */}
              <p
                className="mt-3 text-center text-xs text-[#9CA3AF] cursor-pointer"
                onClick={() => goToStep(2)}
              >
                &larr; Back
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
