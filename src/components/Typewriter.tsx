"use client";

import { useEffect, useState, useRef } from "react";

const phrases = [
  "2000+ verified products across 8 agents.",
  "Honest QC reviews. No cap.",
  "Convert any link to all agents instantly.",
  "The best rep finds, updated weekly.",
];

const TYPE_SPEED = 40;
const DELETE_SPEED = 20;
const PAUSE_AFTER_TYPE = 2000;
const PAUSE_AFTER_DELETE = 300;
const INITIAL_DELAY = 500;

export default function Typewriter() {
  const [displayed, setDisplayed] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const phraseIdx = useRef(0);
  const charIdx = useRef(0);
  const isDeleting = useRef(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // Blinking cursor
    const cursorInterval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    const tick = () => {
      const currentPhrase = phrases[phraseIdx.current];

      if (!isDeleting.current) {
        // Typing
        charIdx.current++;
        setDisplayed(currentPhrase.slice(0, charIdx.current));

        if (charIdx.current === currentPhrase.length) {
          // Fully typed — pause then start deleting
          isDeleting.current = true;
          timeout.current = setTimeout(tick, PAUSE_AFTER_TYPE);
        } else {
          timeout.current = setTimeout(tick, TYPE_SPEED);
        }
      } else {
        // Deleting
        charIdx.current--;
        setDisplayed(currentPhrase.slice(0, charIdx.current));

        if (charIdx.current === 0) {
          // Fully deleted — move to next phrase
          isDeleting.current = false;
          phraseIdx.current = (phraseIdx.current + 1) % phrases.length;
          timeout.current = setTimeout(tick, PAUSE_AFTER_DELETE);
        } else {
          timeout.current = setTimeout(tick, DELETE_SPEED);
        }
      }
    };

    // Initial delay before starting
    timeout.current = setTimeout(tick, INITIAL_DELAY);
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  return (
    <p className="mt-6 text-lg text-text-secondary">
      {displayed}
      <span
        className={`ml-0.5 inline-block h-[1.2em] w-[2px] translate-y-[0.15em] bg-accent transition-opacity duration-100 ${
          cursorVisible ? "opacity-100" : "opacity-0"
        }`}
      />
    </p>
  );
}
