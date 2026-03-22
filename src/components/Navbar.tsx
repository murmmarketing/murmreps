"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useWishlistCount } from "@/lib/useWishlist";

const toolsLinks = [
  {
    href: "/converter",
    label: "Converter",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
      />
    ),
  },
  {
    href: "/agents",
    label: "Agents",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    ),
  },
  {
    href: "/tracking",
    label: "Tracking",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
      />
    ),
  },
  {
    href: "/qc",
    label: "QC Checker",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
      />
    ),
  },
  {
    href: "/image-search",
    label: "Image Search",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
      />
    ),
  },
  {
    href: "/wishlist",
    label: "Wishlist",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    ),
  },
];

const allMobileLinks = [
  { href: "/products", label: "Products" },
  { href: "/deals", label: "Deals" },
  { href: "/news", label: "News" },
  { href: "/guide", label: "Tutorials" },
  { href: "/converter", label: "Converter" },
  { href: "/agents", label: "Agents" },
  { href: "/tracking", label: "Tracking" },
  { href: "/qc", label: "QC Checker" },
  { href: "/image-search", label: "Image Search" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/verified", label: "Verified" },
];

function openSearchModal() {
  window.dispatchEvent(
    new KeyboardEvent("keydown", { key: "k", metaKey: true })
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const wishlistCount = useWishlistCount();
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.06)] bg-[#0a0a0a]">
      {/* ─── Desktop ─── */}
      <div className="mx-auto hidden h-14 max-w-7xl items-center gap-5 px-4 lg:flex xl:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="MurmReps"
            className="h-9 w-auto object-contain"
            loading="eager"
          />
        </Link>

        {/* Center search trigger */}
        <button
          onClick={openSearchModal}
          className="mx-4 flex h-9 w-[280px] shrink-0 items-center gap-2 rounded-btn border border-[rgba(255,255,255,0.1)] bg-[#141414] px-3 transition-colors duration-200 hover:border-[rgba(255,255,255,0.2)]"
        >
          <svg
            className="h-4 w-4 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <span className="flex-1 text-left text-[13px] text-text-muted">
            Search items...
          </span>
          <kbd className="flex items-center rounded-[4px] border border-[rgba(255,255,255,0.15)] px-1.5 py-0.5 font-sans text-[11px] leading-none text-[#6C757D]">
            ⌘K
          </kbd>
        </button>

        {/* Nav links */}
        <div className="flex items-center gap-5">
          <DesktopLink href="/products" active={pathname === "/products"}>
            Products
          </DesktopLink>
          <DesktopLink href="/deals" active={pathname === "/deals"}>
            Deals
          </DesktopLink>
          <DesktopLink href="/news" active={pathname === "/news"}>
            News
          </DesktopLink>
          <DesktopLink href="/guide" active={pathname === "/guide"}>
            Tutorials
          </DesktopLink>

          {/* Tools dropdown */}
          <div className="group relative">
            <button className="flex items-center gap-1 text-[14px] font-medium text-[#9CA3AF] transition-colors duration-200 hover:text-white">
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
              <div className="-translate-x-1/2 translate-y-1 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[#141414] py-2 shadow-lg transition-transform duration-200 group-hover:translate-y-0"
                style={{ minWidth: 200 }}
              >
                {toolsLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#9CA3AF] transition-colors duration-200 hover:bg-[rgba(254,66,5,0.1)] hover:text-white"
                  >
                    <svg
                      className="h-4 w-4 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      {link.icon}
                    </svg>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <DesktopLink href="/verified" active={pathname === "/verified"}>
            Verified
          </DesktopLink>
        </div>

        {/* Far right */}
        <div className="ml-auto flex items-center gap-4">
          {/* Wishlist heart */}
          <Link
            href="/wishlist"
            className="relative flex items-center text-[#9CA3AF] transition-colors duration-200 hover:text-white"
            aria-label="Wishlist"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Login button */}
          <div className="relative">
            <button
              onClick={() => setLoginOpen(!loginOpen)}
              className="rounded-full bg-accent px-5 py-2 text-[14px] font-semibold text-white transition-opacity duration-200 hover:opacity-90"
            >
              Login
            </button>
            {loginOpen && (
              <>
                <div
                  className="fixed inset-0 z-[60]"
                  onClick={() => setLoginOpen(false)}
                />
                <div className="absolute right-0 top-full z-[61] mt-2 w-72 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[#141414] p-4 shadow-lg">
                  <p className="text-[13px] leading-relaxed text-[#9CA3AF]">
                    Login coming soon! For now, your wishlist and votes are saved
                    locally on your device.
                  </p>
                  <button
                    onClick={() => setLoginOpen(false)}
                    className="mt-3 w-full rounded-btn bg-accent/10 py-2 text-[13px] font-semibold text-accent transition-colors duration-200 hover:bg-accent/20"
                  >
                    Got it
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── Mobile ─── */}
      <div className="flex h-12 items-center justify-between px-4 lg:hidden">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="MurmReps logo"
            className="h-7 w-auto object-contain"
            loading="eager"
          />
        </Link>

        {/* Center search icon */}
        <button
          onClick={openSearchModal}
          className="flex h-9 w-9 items-center justify-center rounded-btn text-[#9CA3AF] transition-colors hover:text-white"
          aria-label="Search"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </button>

        {/* Right: heart + hamburger */}
        <div className="flex items-center gap-3">
          <Link
            href="/wishlist"
            className="relative flex items-center text-[#9CA3AF] transition-colors duration-200 hover:text-white"
            aria-label="Wishlist"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <button
            className="flex flex-col gap-1.5"
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
      </div>

      {/* ─── Mobile overlay menu ─── */}
      {mobileOpen && (
        <div className="fixed inset-0 top-12 z-50 bg-[#0a0a0a] lg:hidden">
          <div className="flex h-full flex-col overflow-y-auto px-4 pb-8 pt-4">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => { setLoginOpen(!loginOpen); }}
                className="rounded-full bg-accent px-5 py-2 text-[14px] font-semibold text-white transition-opacity duration-200 hover:opacity-90"
              >
                Login
              </button>
            </div>

            {loginOpen && (
              <div className="mb-4 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[#141414] p-4">
                <p className="text-[13px] leading-relaxed text-[#9CA3AF]">
                  Login coming soon! For now, your wishlist and votes are saved
                  locally on your device.
                </p>
                <button
                  onClick={() => setLoginOpen(false)}
                  className="mt-3 w-full rounded-btn bg-accent/10 py-2 text-[13px] font-semibold text-accent transition-colors duration-200 hover:bg-accent/20"
                >
                  Got it
                </button>
              </div>
            )}

            <div className="flex flex-col">
              {allMobileLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex h-12 items-center border-b border-[rgba(255,255,255,0.06)] text-[15px] font-medium transition-colors duration-200 ${
                    pathname === link.href
                      ? "text-white"
                      : "text-[#9CA3AF] hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Social links at bottom */}
            <div className="mt-auto flex items-center gap-5 pt-8">
              <a
                href="https://instagram.com/murmreps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#9CA3AF] transition-colors hover:text-white"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://tiktok.com/@murmreps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#9CA3AF] transition-colors hover:text-white"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46 6.27 6.27 0 001.88-4.47V8.76a8.25 8.25 0 004.84 1.56V6.87a4.85 4.85 0 01-1.14-.18z" />
                </svg>
              </a>
              <a
                href="https://discord.gg/8r5EFMRg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#9CA3AF] transition-colors hover:text-white"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function DesktopLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative text-[14px] font-medium transition-colors duration-200 ${
        active ? "text-white" : "text-[#9CA3AF] hover:text-white"
      }`}
    >
      {children}
      {active && (
        <span className="absolute -bottom-[19px] left-0 right-0 h-[2px] bg-accent" />
      )}
    </Link>
  );
}
