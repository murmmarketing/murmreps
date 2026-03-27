"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ThemeDetector() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/girls")) {
      document.documentElement.setAttribute("data-theme", "pink");
    } else if (!pathname?.startsWith("/products/")) {
      // Product detail pages manage their own theme based on collection
      document.documentElement.removeAttribute("data-theme");
    }
  }, [pathname]);

  return null;
}
