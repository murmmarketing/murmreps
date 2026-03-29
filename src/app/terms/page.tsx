import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for MurmReps — rep product discovery platform.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
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
        <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">Terms of Service</h1>
        <p className="mt-3 text-sm text-gray-500">Last updated: March 2026</p>
      </div>

      {/* Content */}
      <div className="space-y-10 text-[15px] leading-relaxed text-gray-300">

        {/* 1 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or using MurmReps (&quot;murmreps.com&quot;, &quot;the Site&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;), you
            agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree, do not use the
            Site. We may update these Terms at any time — continued use after changes constitutes
            acceptance.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">2. What MurmReps Is</h2>
          <p>
            MurmReps is a <strong className="text-white">product discovery platform</strong> that helps
            users find replica and alternative fashion items. We aggregate product listings from
            third-party marketplaces (Taobao, Weidian, 1688) and provide affiliate links to independent
            shopping agents.
          </p>
          <div className="mt-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
            <h3 className="mb-2 text-sm font-semibold text-white">Important</h3>
            <ul className="space-y-1.5 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FE4205]" />
                We do <strong className="text-gray-300">not</strong> sell, ship, or handle any products directly
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FE4205]" />
                We are not a retailer, marketplace, or shopping agent
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FE4205]" />
                We do not process payments — all transactions happen on third-party platforms
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FE4205]" />
                Product purchases are between you and the shopping agent you choose
              </li>
            </ul>
          </div>
        </section>

        {/* 3 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">3. Age Requirement</h2>
          <p>
            You must be at least <strong className="text-white">18 years old</strong> to use MurmReps. If
            you are between 13 and 18, you may only use the Site with the consent and supervision of a
            parent or legal guardian. By using the Site, you represent that you meet these age
            requirements.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">4. Affiliate Disclosure</h2>
          <p>
            MurmReps participates in affiliate programs with third-party shopping agents. When you click a
            product link and make a purchase through one of our partner agents, we may earn a commission at
            no additional cost to you. Our current affiliate partners include:
          </p>
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
            Affiliate relationships do not influence which products are displayed or their ranking on the
            Site.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">5. Third-Party Links & Services</h2>
          <p>
            The Site contains links to third-party websites and shopping agents. These links are provided
            for your convenience. MurmReps has no control over, and assumes no responsibility for, the
            content, privacy policies, practices, product quality, shipping, or customer service of any
            third-party sites.
          </p>
          <p className="mt-3">
            You acknowledge that any purchases, disputes, refunds, or issues arising from transactions with
            shopping agents are solely between you and that agent. MurmReps is not a party to any such
            transaction and bears no liability.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">6. Product Information</h2>
          <p>
            Product names, images, prices, and descriptions displayed on MurmReps are sourced from
            third-party platforms. While we make reasonable efforts to keep information accurate:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-6 text-gray-400">
            <li>We do not guarantee the accuracy, completeness, or reliability of any product information</li>
            <li>Prices are displayed in CNY (Chinese Yuan) and may fluctuate</li>
            <li>Product availability is not guaranteed — items may be out of stock</li>
            <li>Images may not perfectly represent the actual product</li>
          </ul>
        </section>

        {/* 7 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">7. User Conduct</h2>
          <p>You agree not to:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-6 text-gray-400">
            <li>Use the Site for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to any part of the Site or its systems</li>
            <li>Scrape, crawl, or use automated tools to access the Site without written permission</li>
            <li>Interfere with or disrupt the Site&apos;s infrastructure</li>
            <li>Impersonate any person or entity</li>
            <li>Use the Site to distribute spam, malware, or harmful content</li>
          </ul>
        </section>

        {/* 8 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">8. Intellectual Property</h2>
          <p>
            The Site&apos;s design, layout, code, and original content are the property of MurmReps and are
            protected by applicable intellectual property laws. Product images, brand names, and logos
            displayed on the Site belong to their respective trademark holders. MurmReps does not claim
            ownership of any third-party trademarks or intellectual property.
          </p>
          <p className="mt-3">
            Use of brand names on this Site is for identification purposes only and does not imply
            endorsement or affiliation.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">9. Disclaimer of Warranties</h2>
          <p>
            The Site is provided <strong className="text-white">&quot;as is&quot;</strong> and{" "}
            <strong className="text-white">&quot;as available&quot;</strong> without warranties of any kind, whether
            express or implied, including but not limited to implied warranties of merchantability, fitness
            for a particular purpose, and non-infringement.
          </p>
          <p className="mt-3">
            We do not warrant that the Site will be uninterrupted, secure, error-free, or free from
            viruses or other harmful components.
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">10. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, MurmReps and its operators shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages arising from:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-6 text-gray-400">
            <li>Your use of or inability to use the Site</li>
            <li>Products purchased through third-party links on the Site</li>
            <li>Any disputes with shopping agents or sellers</li>
            <li>Inaccurate or incomplete product information</li>
            <li>Unauthorized access to your data or transmissions</li>
            <li>Any loss of profits, data, or other intangible losses</li>
          </ul>
        </section>

        {/* 11 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">11. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the European Union and the Netherlands. Any disputes
            arising from these Terms shall be subject to the exclusive jurisdiction of the competent courts
            in the Netherlands.
          </p>
        </section>

        {/* 12 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">12. Changes to These Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Material changes will be indicated by
            updating the &quot;Last updated&quot; date at the top of this page. Your continued use of the Site
            after any changes constitutes acceptance of the new Terms.
          </p>
        </section>

        {/* 13 */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-white">13. Contact</h2>
          <p>
            If you have questions about these Terms, contact us at{" "}
            <a href="mailto:contact@murmreps.com" className="text-[#FE4205] hover:underline">
              contact@murmreps.com
            </a>
          </p>
        </section>

        {/* Cross-link */}
        <div className="border-t border-[rgba(255,255,255,0.06)] pt-8">
          <p className="text-sm text-gray-500">
            See also:{" "}
            <Link href="/privacy" className="text-[#FE4205] hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
