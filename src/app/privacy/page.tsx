import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for MurmReps — how we collect, use, and protect your data.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
      {/* Header */}
      <div className="mb-12">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-white"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to MurmReps
        </Link>
        <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-gray-500">Last updated: March 2026</p>
      </div>

      {/* Content */}
      <div className="space-y-10 text-[15px] leading-relaxed text-gray-300">

        {/* 1 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">1. Who We Are</h2>
          <p>
            MurmReps (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the website murmreps.com. We are an EU-based
            product discovery platform that helps users find replica and alternative fashion items through
            affiliate links to third-party shopping agents. This Privacy Policy explains how we collect,
            use, store, and protect your information.
          </p>
          <p className="mt-3">
            For any privacy-related enquiries, contact us at{" "}
            <a href="mailto:contact@murmreps.com" className="text-[#FE4205] hover:underline">
              contact@murmreps.com
            </a>
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">2. Information We Collect</h2>

          <h3 className="mb-2 mt-6 text-base font-medium text-white">2.1 Automatically Collected</h3>
          <p>When you visit the Site, we automatically collect:</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-6 text-gray-400">
            <li>Browser type and version</li>
            <li>Operating system and device type</li>
            <li>Pages visited, time spent, and navigation paths</li>
            <li>Referring website or source</li>
            <li>Approximate location (country/region, derived from IP)</li>
            <li>IP address (anonymized via Google Analytics)</li>
          </ul>

          <h3 className="mb-2 mt-6 text-base font-medium text-white">2.2 Data You Provide</h3>
          <ul className="list-disc space-y-1.5 pl-6 text-gray-400">
            <li>
              <strong className="text-gray-300">Wishlist selections</strong> — stored locally in your
              browser (localStorage), not on our servers
            </li>
            <li>
              <strong className="text-gray-300">Search queries</strong> — logged anonymously to improve
              search quality
            </li>
            <li>
              <strong className="text-gray-300">User preferences</strong> — theme, agent preference,
              stored in your browser
            </li>
            <li>
              <strong className="text-gray-300">Contact information</strong> — only if you email us
              directly
            </li>
          </ul>

          <h3 className="mb-2 mt-6 text-base font-medium text-white">2.3 What We Do NOT Collect</h3>
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
            <ul className="space-y-1.5 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-400">&#10003;</span>
                We do not collect names, email addresses, or account data (no user accounts exist)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-400">&#10003;</span>
                We do not process payments or store financial information
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-400">&#10003;</span>
                We do not sell, rent, or share personal data with third parties for marketing
              </li>
            </ul>
          </div>
        </section>

        {/* 3 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">3. How We Use Your Information</h2>
          <ul className="list-disc space-y-1.5 pl-6 text-gray-400">
            <li>To operate and improve the Site</li>
            <li>To understand user behaviour and optimize the experience</li>
            <li>To display relevant product recommendations</li>
            <li>To analyse Site traffic and performance (via Google Analytics)</li>
            <li>To measure the effectiveness of advertising campaigns (via Meta Pixel, TikTok Pixel)</li>
            <li>To respond to enquiries if you contact us</li>
          </ul>
        </section>

        {/* 4 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">4. Cookies & Tracking</h2>
          <p>We use the following cookies and tracking technologies:</p>

          <div className="mt-4 overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)] bg-[#141414]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Purpose</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                <tr>
                  <td className="px-4 py-3 font-medium text-white">Essential</td>
                  <td className="px-4 py-3 text-gray-400">Site functionality, admin auth</td>
                  <td className="px-4 py-3 text-gray-500">Session</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-white">Analytics</td>
                  <td className="px-4 py-3 text-gray-400">Google Analytics (G-D3QBGSNWPV) — traffic, page views, user flows</td>
                  <td className="px-4 py-3 text-gray-500">Up to 2 years</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-white">Advertising</td>
                  <td className="px-4 py-3 text-gray-400">Meta Pixel, TikTok Pixel — ad measurement and retargeting</td>
                  <td className="px-4 py-3 text-gray-500">Up to 1 year</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-white">Local Storage</td>
                  <td className="px-4 py-3 text-gray-400">Wishlist, user preferences, theme — stored only on your device</td>
                  <td className="px-4 py-3 text-gray-500">Persistent</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-gray-400">
            You can opt out of Google Analytics by installing the{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FE4205] hover:underline"
            >
              GA Opt-out Browser Add-on
            </a>
            . You can manage Meta ad preferences in your{" "}
            <a
              href="https://www.facebook.com/adpreferences"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FE4205] hover:underline"
            >
              Facebook settings
            </a>
            . Most browsers also allow you to block or delete cookies through their settings.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">5. Affiliate Links & Third Parties</h2>
          <p>
            When you click product links, you are redirected to third-party shopping agents. Each agent has
            its own privacy policy and data practices. We encourage you to review their policies before
            making purchases.
          </p>
          <p className="mt-3">Our current affiliate agent partners:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["KakoBuy", "Superbuy", "CnFans", "MuleBuy", "ACBuy", "LoveGoBuy", "JoyaGoo", "SugarGoo"].map((agent) => (
              <span
                key={agent}
                className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[#141414] px-3 py-1 text-xs font-medium text-gray-400"
              >
                {agent}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-400">
            We earn commissions from purchases made through these affiliate links. This does not affect the
            price you pay.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">6. Data Storage & Security</h2>
          <p>
            Our database infrastructure is hosted on{" "}
            <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[#FE4205] hover:underline">
              Supabase
            </a>{" "}
            (AWS eu-central-1). The Site is deployed on{" "}
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#FE4205] hover:underline">
              Vercel
            </a>
            .
          </p>
          <p className="mt-3">
            We store product catalog data and anonymous site analytics (page views, search queries). We do
            not store personal user data such as names, emails, or payment information. User preferences
            and wishlists are stored locally in your browser.
          </p>
          <p className="mt-3">
            We implement reasonable technical and organizational measures to protect the data we handle,
            including encrypted connections (HTTPS), access controls, and regular security reviews.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">7. Your Rights (GDPR)</h2>
          <p>
            As an EU-based service, we comply with the General Data Protection Regulation (GDPR). You have
            the right to:
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { title: "Access", desc: "Request a copy of any personal data we hold about you" },
              { title: "Rectification", desc: "Request correction of inaccurate data" },
              { title: "Erasure", desc: "Request deletion of your data (\"right to be forgotten\")" },
              { title: "Restriction", desc: "Request we limit processing of your data" },
              { title: "Portability", desc: "Receive your data in a structured, machine-readable format" },
              { title: "Object", desc: "Object to processing based on legitimate interests" },
            ].map((right) => (
              <div key={right.title} className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#141414] p-4">
                <h3 className="text-sm font-semibold text-white">{right.title}</h3>
                <p className="mt-1 text-xs text-gray-400">{right.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-4">
            To exercise any of these rights, email{" "}
            <a href="mailto:contact@murmreps.com" className="text-[#FE4205] hover:underline">
              contact@murmreps.com
            </a>
            . We will respond within 30 days.
          </p>
          <p className="mt-3 text-sm text-gray-400">
            You also have the right to lodge a complaint with your local data protection authority. In the
            Netherlands, this is the{" "}
            <a
              href="https://autoriteitpersoonsgegevens.nl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FE4205] hover:underline"
            >
              Autoriteit Persoonsgegevens
            </a>
            .
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">8. Data Retention</h2>
          <p>
            Anonymous analytics data is retained for up to 26 months (Google Analytics default). Search
            query logs are retained for up to 12 months. If you contact us by email, we retain that
            correspondence for up to 24 months. You can request deletion of any data at any time.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">9. Children&apos;s Privacy</h2>
          <p>
            MurmReps is not intended for users under 16 years of age. We do not knowingly collect personal
            information from children. If you believe a child under 16 has provided us with personal data,
            contact us and we will promptly delete it.
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">10. International Transfers</h2>
          <p>
            Your data may be processed in the EU and US (via our hosting providers). Where data is
            transferred outside the EEA, we ensure adequate safeguards are in place through Standard
            Contractual Clauses (SCCs) or adequacy decisions.
          </p>
        </section>

        {/* 11 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page with
            an updated revision date. Material changes may be communicated through a notice on the Site.
          </p>
        </section>

        {/* 12 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">12. Contact</h2>
          <p>
            For any questions or requests regarding this Privacy Policy or your data, contact:
          </p>
          <div className="mt-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5 text-sm">
            <p className="font-medium text-white">MurmReps</p>
            <p className="mt-1 text-gray-400">
              Email:{" "}
              <a href="mailto:contact@murmreps.com" className="text-[#FE4205] hover:underline">
                contact@murmreps.com
              </a>
            </p>
            <p className="mt-1 text-gray-400">Website: murmreps.com</p>
          </div>
        </section>

        {/* Cross-link */}
        <div className="border-t border-[rgba(255,255,255,0.06)] pt-8">
          <p className="text-sm text-gray-500">
            See also:{" "}
            <Link href="/terms" className="text-[#FE4205] hover:underline">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
