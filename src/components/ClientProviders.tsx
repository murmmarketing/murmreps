"use client";

import { ReactNode } from "react";
import { PreferencesProvider } from "@/lib/usePreferences";
import WelcomePopup from "@/components/WelcomePopup";
import ThemeDetector from "@/components/ThemeDetector";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <PreferencesProvider>
      <ThemeDetector />
      {children}
      <WelcomePopup />
    </PreferencesProvider>
  );
}
