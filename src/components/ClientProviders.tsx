"use client";

import { ReactNode } from "react";
import { PreferencesProvider } from "@/lib/usePreferences";
import WelcomePopup from "@/components/WelcomePopup";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <PreferencesProvider>
      {children}
      <WelcomePopup />
    </PreferencesProvider>
  );
}
