"use client";
import { useState, useEffect, createContext, useContext, useCallback } from "react";

type ToastCtx = { showToast: (message: string) => void };
const ToastContext = createContext<ToastCtx>({ showToast: () => {} });

export function useToast() { return useContext(ToastContext); }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={`fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-lg bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        {message}
      </div>
    </ToastContext.Provider>
  );
}
