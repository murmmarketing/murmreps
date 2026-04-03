"use client";

import { ReactNode } from "react";
import { PreferencesProvider } from "@/lib/usePreferences";
import { ToastProvider } from "@/components/Toast";
import WelcomePopup from "@/components/WelcomePopup";
import ThemeDetector from "@/components/ThemeDetector";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <PreferencesProvider>
      <ToastProvider>
        <ThemeDetector />
        {children}
        <WelcomePopup />
      </ToastProvider>
    </PreferencesProvider>
  );
}
