"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ThemeDetector() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/girls")) {
      document.documentElement.setAttribute("data-theme", "pink");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [pathname]);

  return null;
}
