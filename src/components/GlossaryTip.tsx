"use client";
import { useState, useRef, useEffect } from "react";

const GLOSSARY: Record<string, string> = {
  QC: "Quality Check — photos your agent takes of the actual item before shipping so you can verify quality",
  W2C: "Where to Cop — asking where to buy a specific item",
  agent: "A middleman service that buys products from Chinese sellers and ships them to you internationally",
  haul: "A batch of items you buy and ship together to save on shipping costs",
  GP: "Guinea Pig — being the first person to buy and review an item",
  GL: "Green Light — the item looks good, ship it",
  RL: "Red Light — the item has flaws, return it",
  rep: "Replica — a product inspired by or copying a designer/brand item",
  retail: "The original authentic version of the product",
  Weidian: "A Chinese marketplace where many rep sellers list products",
  Taobao: "China's largest online marketplace, similar to Amazon",
  Yupoo: "A photo hosting site where sellers showcase their products",
  "shipping line": "The delivery method your agent uses to send your package internationally",
  warehouse: "Your agent's storage facility where items are held until you're ready to ship",
  seized: "When customs intercepts and confiscates your package (rare)",
  TTS: "True to Size — fits like your normal size",
  OOS: "Out of Stock",
};

export default function GlossaryTip({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const [experienced, setExperienced] = useState(true);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const views = parseInt(localStorage.getItem("murmreps_pageviews") || "0");
    setExperienced(localStorage.getItem("murmreps_experienced") === "true");
    const next = views + 1;
    localStorage.setItem("murmreps_pageviews", String(next));
    if (next >= 5) localStorage.setItem("murmreps_experienced", "true");
  }, []);

  const definition = GLOSSARY[term];
  if (!definition || experienced) {
    return <>{children}</>;
  }

  return (
    <span
      ref={ref}
      className="relative inline cursor-help border-b border-dotted border-[#6B7280]"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow((s) => !s)}
    >
      {children}
      {show && (
        <span className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-lg bg-[#1a1a1a] px-3 py-2 text-xs text-[#d4d4d8] shadow-lg border border-[rgba(255,255,255,0.08)]" style={{ maxWidth: 220, width: "max-content" }}>
          <span className="font-semibold text-white">{term}:</span> {definition}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#1a1a1a]" />
        </span>
      )}
    </span>
  );
}
