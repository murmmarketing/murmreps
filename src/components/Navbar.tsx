"use client";

import Link from "next/link";
import { useState } from "react";

const toolsLinks = [
  { href: "/guide", label: "Guide" },
  { href: "/agents", label: "Agents" },
  { href: "/tracking", label: "Tracking" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-subtle bg-void/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-[10px]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
            <span className="font-heading text-[18px] font-black leading-none text-white">
              M
            </span>
          </div>
          <span className="font-heading text-xl font-extrabold tracking-[-1.5px]">
            <span className="text-white">Murm</span>
            <span className="text-accent">Reps</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <NavLink href="/products">Products</NavLink>
          <NavLink href="/converter">Converter</NavLink>

          {/* Tools dropdown */}
          <div className="group relative">
            <button className="flex items-center gap-1 text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-accent">
              Tools
              <svg
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
            <div className="pointer-events-none absolute left-1/2 top-full pt-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
              <div className="-translate-x-1/2 rounded-card border border-subtle bg-surface py-1.5 shadow-lg">
                {toolsLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block whitespace-nowrap px-5 py-2 text-sm font-medium text-text-secondary transition-colors duration-200 hover:bg-accent/10 hover:text-accent"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <NavLink href="/verified">Verified</NavLink>
        </div>

        {/* Mobile toggle */}
        <button
          className="flex flex-col gap-1.5 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-6 bg-white transition-all duration-200 ${mobileOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-all duration-200 ${mobileOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-all duration-200 ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-subtle px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-3 pt-3">
            <MobileNavLink
              href="/products"
              onClick={() => setMobileOpen(false)}
            >
              Products
            </MobileNavLink>
            <MobileNavLink
              href="/converter"
              onClick={() => setMobileOpen(false)}
            >
              Converter
            </MobileNavLink>
            <MobileNavLink
              href="/guide"
              onClick={() => setMobileOpen(false)}
            >
              Guide
            </MobileNavLink>
            <MobileNavLink
              href="/agents"
              onClick={() => setMobileOpen(false)}
            >
              Agents
            </MobileNavLink>
            <MobileNavLink
              href="/tracking"
              onClick={() => setMobileOpen(false)}
            >
              Tracking
            </MobileNavLink>
            <MobileNavLink
              href="/verified"
              onClick={() => setMobileOpen(false)}
            >
              Verified
            </MobileNavLink>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-accent"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-btn px-3 py-2 text-sm font-medium text-text-secondary transition-colors duration-200 hover:bg-surface hover:text-accent"
    >
      {children}
    </Link>
  );
}
