import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | MurmReps",
  description: "Terms of Service for MurmReps — rep product finder.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-white">Terms of Service</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: March 27, 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-300">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing and using MurmReps (&quot;murmreps.com&quot;, &quot;the Site&quot;), you agree to be bound by
            these Terms of Service. If you do not agree to these terms, please do not use the Site.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">2. Description of Service</h2>
          <p>
            MurmReps is a product discovery and comparison platform. We aggregate product listings from
            third-party marketplaces and provide links to purchasing agents. MurmReps does not sell, ship,
            or handle any products directly. We are not a retailer or marketplace.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">3. Third-Party Links</h2>
          <p>
            The Site contains links to third-party websites and purchasing agents. These links are provided
            for convenience only. MurmReps has no control over, and assumes no responsibility for, the
            content, privacy policies, or practices of any third-party sites or services. You acknowledge
            and agree that MurmReps shall not be liable for any damage or loss caused by use of such
            third-party content, goods, or services.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">4. Product Information</h2>
          <p>
            Product names, images, prices, and descriptions displayed on MurmReps are sourced from
            third-party platforms. We make reasonable efforts to keep information accurate and up to date,
            but we do not guarantee the accuracy, completeness, or reliability of any product information.
            Prices and availability are subject to change without notice.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">5. User Conduct</h2>
          <p>You agree not to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-400">
            <li>Use the Site for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to any part of the Site</li>
            <li>Scrape, crawl, or use automated means to access the Site without permission</li>
            <li>Interfere with the proper functioning of the Site</li>
            <li>Impersonate any person or entity</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">6. Intellectual Property</h2>
          <p>
            The Site design, layout, and original content are the property of MurmReps. Product images and
            descriptions belong to their respective owners. All trademarks, brand names, and logos
            referenced on the Site are the property of their respective holders.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">7. Disclaimer of Warranties</h2>
          <p>
            The Site is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either
            express or implied. MurmReps does not warrant that the Site will be uninterrupted, error-free,
            or free of viruses or other harmful components.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">8. Limitation of Liability</h2>
          <p>
            In no event shall MurmReps be liable for any indirect, incidental, special, consequential, or
            punitive damages arising out of or related to your use of the Site. This includes, without
            limitation, damages for loss of profits, data, or other intangible losses resulting from
            purchases made through third-party links on the Site.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Changes will be effective immediately
            upon posting to the Site. Your continued use of the Site after changes constitutes acceptance
            of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">10. Contact</h2>
          <p>
            For questions about these Terms, contact us at{" "}
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
