"use client";
import { useState } from "react";

const faqs = [
  { q: "Is buying reps safe?", a: "Millions of people buy reps through agents every year. Using a trusted agent like KakoBuy protects your money — you pay the agent, they buy from the seller, and you get QC photos before shipping. If the item is bad, you can return it." },
  { q: "How long does shipping take?", a: "Typically 7-20 days depending on your shipping line. Budget lines (SAL, China Post) take 15-30 days. Express lines (DHL, FedEx, EMS) take 5-15 days. Your agent will show available options and estimated times." },
  { q: "Will my package get seized by customs?", a: "It's rare — less than 1% of packages. Agents declare packages at low values and remove brand tags to reduce risk. If it does happen, most agents offer shipping insurance." },
  { q: "What if the product doesn't match the photos?", a: "That's what QC (Quality Check) photos are for. Your agent photographs every item before shipping. If you're not happy, you can return it for a refund (usually free within the agent's warehouse)." },
  { q: "How do I know my size?", a: "Rep sizing can run small. General rule: size up 1-2 sizes from your normal size for Chinese sellers. Always check the size chart on the product listing. When in doubt, ask your agent to measure the item." },
  { q: "What is an agent and why do I need one?", a: "An agent is a service that buys products from Chinese sellers on your behalf. You can't buy directly from Weidian/Taobao without a Chinese address and payment method. The agent handles purchasing, quality checking, storing, and shipping your items internationally." },
  { q: "How much does shipping cost?", a: "Roughly €10-25 per kg depending on destination and speed. A typical haul of 3-5 items (2-4kg) costs €20-60 to ship. Ship more items together to reduce the per-item cost." },
  { q: "Which agent should I use?", a: "We recommend KakoBuy for beginners — clean interface, responsive support, and competitive shipping rates. You can compare all 8 agents on any product page on MurmReps." },
];

export default function HomeFAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h2 className="mb-8 text-center font-heading text-2xl font-bold text-white sm:text-3xl">
        New to Reps? Common Questions
      </h2>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] overflow-hidden"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between p-5 text-left"
            >
              <span className="text-sm font-semibold text-white pr-4">{faq.q}</span>
              <svg
                className={`h-4 w-4 shrink-0 text-accent transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            <div
              className="overflow-hidden transition-all duration-200"
              style={{ maxHeight: open === i ? 300 : 0, opacity: open === i ? 1 : 0 }}
            >
              <p className="px-5 pb-5 text-sm leading-relaxed text-text-secondary">
                {faq.a}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
