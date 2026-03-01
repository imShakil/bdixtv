import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy and data protection information'
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="rounded-2xl border border-steel/20 bg-white/90 p-6 shadow-card md:p-8">
        <Link href="/" className="mb-4 inline-block text-sm text-sea hover:underline">
          ← Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold text-ink">Privacy Policy</h1>
        <p className="mt-2 text-sm text-steel">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="mt-6 space-y-6 text-steel">
          <section>
            <h2 className="text-xl font-semibold text-ink">1. Information We Collect</h2>
            <p className="mt-2">
              We collect minimal information to provide our streaming service. This includes:
            </p>
            <ul className="ml-6 mt-2 list-disc space-y-1">
              <li>Usage data (channels viewed, time spent)</li>
              <li>Device information (browser type, operating system)</li>
              <li>Cookies for preferences and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">2. How We Use Your Information</h2>
            <p className="mt-2">We use collected information to:</p>
            <ul className="ml-6 mt-2 list-disc space-y-1">
              <li>Provide and improve our streaming service</li>
              <li>Analyze usage patterns and optimize performance</li>
              <li>Display relevant advertisements (with your consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">3. Cookies and Tracking</h2>
            <p className="mt-2">
              We use cookies and similar technologies for functionality and analytics. You can manage 
              cookie preferences through our consent banner or your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">4. Third-Party Services</h2>
            <p className="mt-2">We use the following third-party services:</p>
            <ul className="ml-6 mt-2 list-disc space-y-1">
              <li><strong>Google AdSense:</strong> For displaying advertisements</li>
              <li><strong>Google Funding Choices:</strong> For consent management (GDPR compliance)</li>
            </ul>
            <p className="mt-2">
              These services may collect data according to their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">5. Data Storage</h2>
            <p className="mt-2">
              We store minimal data locally in your browser (localStorage/sessionStorage) for:
            </p>
            <ul className="ml-6 mt-2 list-disc space-y-1">
              <li>Channel cache and preferences</li>
              <li>Consent choices</li>
              <li>Telemetry data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">6. Your Rights (GDPR)</h2>
            <p className="mt-2">
              If you are in the EEA, UK, or Switzerland, you have the right to:
            </p>
            <ul className="ml-6 mt-2 list-disc space-y-1">
              <li>Access your personal data</li>
              <li>Request data deletion</li>
              <li>Withdraw consent at any time</li>
              <li>Object to data processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">7. Content Disclaimer</h2>
            <p className="mt-2">
              We aggregate publicly available streaming links. We do not host, store, or control 
              the content of third-party streams. All streams are provided by external sources.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">8. Children's Privacy</h2>
            <p className="mt-2">
              Our service is not intended for children under 13. We do not knowingly collect 
              information from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">9. Changes to This Policy</h2>
            <p className="mt-2">
              We may update this privacy policy from time to time. Changes will be posted on this page 
              with an updated date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">10. Contact</h2>
            <p className="mt-2">
              For privacy-related questions or to exercise your rights, please contact us through 
              our GitHub repository.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
