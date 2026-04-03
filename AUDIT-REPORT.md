# MurmReps Codebase Audit — April 2026

## CRITICAL (must fix)

### 1. Blog post XSS risk via dangerouslySetInnerHTML
- **File:** `src/app/news/[slug]/page.tsx:62`
- **Issue:** Blog content from Supabase rendered via `dangerouslySetInnerHTML`. Admin-only input so low actual risk, but should sanitize.
- **Status:** Acceptable risk — only admins create posts via authenticated API.

No other critical bugs found. Build passes clean, no TypeScript errors.

## HIGH (should fix)

### 1. console.log in production code
- `src/app/products/page.tsx:200` — `console.log("Supabase fetch failed:", err)`
- **Fix:** Remove or replace with silent error handling.

### 2. Missing error boundary on product detail page
- **File:** `src/app/products/[id]/page.tsx`
- **Issue:** If Supabase fetch fails for recommendations, no error is shown but the sections silently disappear. OK for UX but the initial product fetch from static JSON could fail if the JSON doesn't contain the product.

### 3. Referral visit endpoint has no rate limiting
- **File:** `src/app/api/referral/visit/route.ts`
- **Issue:** Anyone can spam visits to inflate referral counts. Should add IP-based rate limiting.

## MEDIUM (nice to fix)

### 1. Unused `staticProducts` import on /products
- **File:** `src/app/products/page.tsx:6`
- `import staticProducts from "@/data/products.json"` — only used for TypeScript type inference (`typeof staticProducts`), not actual data. Could define a proper Product type instead.

### 2. Footer img element warning
- **File:** `src/components/Footer.tsx:43`
- ESLint warns about using `<img>` instead of `next/image`. Has eslint-disable comment but could use Next Image for optimization.

### 3. Duplicate Supabase client creation
- Several API routes create their own Supabase client instead of using the shared `getAdminClient()` from `src/lib/supabase.ts`.
- Files: `src/app/api/newsletter/route.ts`, `src/app/api/products/[id]/reviews/route.ts`, `src/app/api/referral/*.ts`

### 4. Missing SEO meta on /referral page
- **File:** `src/app/referral/page.tsx`
- No metadata export. Should have title/description.

### 5. Missing SEO meta on /brands page
- **File:** `src/app/brands/page.tsx`
- Has metadata but could add OG/Twitter cards.

## LOW (cleanup)

### 1. Inconsistent orange color references
- Mix of `#FE4205`, `#f97316`, `bg-accent`, `text-accent` across files.
- The CSS variable `--accent` exists but some places hardcode the hex.

### 2. Product type defined multiple times
- Product interface is defined in: products page, girls page, product detail, admin page, guides, etc.
- Should extract to a shared `types/product.ts`.

### 3. Old /guide route still exists alongside /guides
- Both `src/app/guide/page.tsx` and `src/app/guides/page.tsx` exist.
- The old /guide page should redirect to /guides.

### 4. Large admin products page (2100+ lines)
- `src/app/admin/products/page.tsx` is massive. Could be split into smaller components.

### 5. products.json static file (40K+ lines)
- `src/data/products.json` is only used for initial product detail page load before Supabase fetch. Could be removed if SSR is used instead.
