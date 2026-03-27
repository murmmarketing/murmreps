import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | MurmReps",
  description: "Privacy Policy for MurmReps — how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-white">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: March 27, 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-300">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">1. Introduction</h2>
          <p>
            MurmReps (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates murmreps.com. This Privacy Policy explains how we
            collect, use, and protect your information when you visit our Site.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">2. Information We Collect</h2>
          <h3 className="mb-2 text-sm font-medium text-gray-200">Automatically Collected</h3>
          <ul className="list-disc space-y-1 pl-6 text-gray-400">
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Pages visited and time spent</li>
            <li>Referring website</li>
            <li>IP address (anonymized)</li>
            <li>Device type (mobile/desktop)</li>
          </ul>
          <h3 className="mb-2 mt-4 text-sm font-medium text-gray-200">Voluntarily Provided</h3>
          <ul className="list-disc space-y-1 pl-6 text-gray-400">
            <li>Wishlist selections (stored locally in your browser)</li>
            <li>Search queries (used to improve search results)</li>
            <li>Contact information if you email us</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">3. How We Use Your Information</h2>
          <ul className="list-disc space-y-1 pl-6 text-gray-400">
            <li>To operate and improve the Site</li>
            <li>To understand how users interact with our content</li>
            <li>To display relevant product recommendations</li>
            <li>To analyze Site traffic via Google Analytics</li>
            <li>To respond to inquiries</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">4. Analytics</h2>
          <p>
            We use Google Analytics (property ID: G-D3QBGSNWPV) to understand Site usage. Google Analytics
            uses cookies to collect anonymous usage data. You can opt out by installing the{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FE4205] hover:underline"
            >
              Google Analytics Opt-out Browser Add-on
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">5. Cookies</h2>
          <p>We use the following types of cookies:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-400">
            <li>
              <strong className="text-gray-300">Essential cookies</strong> — required for the Site to
              function (e.g., admin authentication)
            </li>
            <li>
              <strong className="text-gray-300">Analytics cookies</strong> — Google Analytics cookies to
              measure traffic and usage patterns
            </li>
            <li>
              <strong className="text-gray-300">Local storage</strong> — used for wishlist data and user
              preferences (stored only on your device)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">6. Third-Party Services</h2>
          <p>
            When you click on product links, you will be redirected to third-party purchasing agents
            (e.g., KakoBuy, Sugargoo, CSSBuy). These services have their own privacy policies. We
            encourage you to review their policies before making purchases.
          </p>
          <p className="mt-2">
            We may also use Meta (Facebook) Pixel for advertising purposes. This allows us to measure the
            effectiveness of our advertising and deliver relevant ads. You can manage your ad preferences
            in your Facebook settings.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">7. Data Storage</h2>
          <p>
            We use Supabase for our database infrastructure. Product data and site analytics are stored
            securely. We do not store personal user data such as names, email addresses, or payment
            information (we do not process payments).
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">8. Your Rights</h2>
          <p>Under GDPR and applicable data protection laws, you have the right to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-400">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Withdraw consent at any time</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:contact@murmreps.com" className="text-[#FE4205] hover:underline">
              contact@murmreps.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">9. Children&apos;s Privacy</h2>
          <p>
            The Site is not intended for children under 16. We do not knowingly collect personal
            information from children. If you believe a child has provided us with personal data, please
            contact us.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page with
            an updated revision date. Your continued use of the Site constitutes acceptance of the revised
            policy.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">11. Contact</h2>
          <p>
            For privacy-related questions, contact us at{" "}
            <a href="mailto:contact@murmreps.com" className="text-[#FE4205] hover:underline">
              contact@murmreps.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
