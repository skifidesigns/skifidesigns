import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingContact } from './FloatingContact';

const COMPANY = {
  name: 'SKIFI GROUP LLC',
  brand: 'SkiFi Designs',
  address: '30 N Gould St Ste R, Sheridan, WY 82801, United States',
  jurisdiction: 'Wyoming, USA',
  filing: '2026-001892086',
  operations: 'Kerala, India',
  contactEmail: 'contact@skifidesigns.com',
  website: 'https://skifidesigns.com',
  effectiveDate: 'February 23, 2026',
};

const LegalLayout = ({ title, subtitle, children, slug }) => {
  useEffect(() => {
    document.title = `${title} | ${COMPANY.brand}`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && subtitle) meta.setAttribute('content', subtitle);
  }, [title, subtitle]);

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <section className="pt-32 pb-16 px-6 sm:px-8 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#2A7AFE] transition mb-8"
            data-testid={`legal-back-${slug}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <p className="text-xs uppercase tracking-[0.2em] text-[#2A7AFE] font-semibold mb-3">Legal</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base text-muted-foreground mb-2">{subtitle}</p>
          )}
          <p className="text-sm text-muted-foreground mb-12">
            Effective date: <span className="text-foreground font-medium">{COMPANY.effectiveDate}</span>
          </p>

          <div className="prose-skifi" data-testid={`legal-content-${slug}`}>
            {children}
          </div>

          <div className="mt-16 pt-8 border-t border-border text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">{COMPANY.name} <span className="font-normal text-muted-foreground">(d/b/a {COMPANY.brand})</span></p>
            <p>{COMPANY.address}</p>
            <p>Wyoming filing #{COMPANY.filing} · Operations: {COMPANY.operations}</p>
            <p className="mt-2">
              Questions? Email <a href={`mailto:${COMPANY.contactEmail}`} className="text-[#2A7AFE]">{COMPANY.contactEmail}</a>.
            </p>
          </div>
        </div>
      </section>
      <Footer />
      <FloatingContact />
    </div>
  );
};

// ============== PRIVACY POLICY ==============
export const PrivacyPolicy = () => (
  <LegalLayout
    title="Privacy Policy"
    subtitle="How SkiFi Designs collects, uses, and protects your information."
    slug="privacy"
  >
    <h2>1. Who we are</h2>
    <p>
      {COMPANY.name} (“we”, “us”, “our”) operates the website <strong>{COMPANY.website}</strong>{' '}
      under the brand <strong>{COMPANY.brand}</strong>. We are a single-member limited liability company
      formed in {COMPANY.jurisdiction} with operations based in {COMPANY.operations}. This Privacy Policy
      explains what personal information we collect from visitors and clients, how we use it, and the
      rights you have over it.
    </p>

    <h2>2. Information we collect</h2>
    <p>We collect the following categories of information:</p>
    <ul>
      <li><strong>Contact details</strong> you provide — name, email, company name, phone (optional).</li>
      <li><strong>Project details</strong> you submit through our onboarding form (project type, timeline, description, slide count).</li>
      <li><strong>Payment information</strong> processed by Stripe, our payment provider. We do <em>not</em> store full card numbers on our servers — Stripe handles tokenisation and PCI compliance.</li>
      <li><strong>Authentication data</strong> when you sign in with Google to access our Resources area (name, email address, profile picture, Google account ID).</li>
      <li><strong>Usage analytics</strong> — pages visited, device/browser type, approximate location (country/region only), referrer URL. Collected via PostHog.</li>
      <li><strong>Communications</strong> — emails, WhatsApp messages and meeting notes you send us.</li>
    </ul>

    <h2>3. How we use your information</h2>
    <ul>
      <li>To deliver the services you've ordered (design work, templates, consultations).</li>
      <li>To process payments and issue invoices/receipts.</li>
      <li>To send transactional emails (order confirmations, project updates, delivery files) via Resend.</li>
      <li>To respond to enquiries and provide customer support.</li>
      <li>To improve our website, services and marketing — based on aggregated analytics.</li>
      <li>To comply with legal obligations (tax, accounting, fraud prevention).</li>
    </ul>
    <p>We do <strong>not</strong> sell your personal information to third parties. Ever.</p>

    <h2>4. Legal bases (GDPR / UK-GDPR)</h2>
    <p>If you are located in the EEA, UK, or Switzerland, we rely on the following legal bases under Article 6 GDPR:</p>
    <ul>
      <li><strong>Contractual necessity</strong> — to deliver paid services you've ordered.</li>
      <li><strong>Legitimate interests</strong> — to operate the website, improve our offerings, and contact past clients about related services.</li>
      <li><strong>Consent</strong> — for non-essential cookies and marketing communications (you can withdraw consent at any time).</li>
      <li><strong>Legal obligation</strong> — for tax, accounting, and fraud-prevention records.</li>
    </ul>

    <h2>5. Third-party processors</h2>
    <p>We share data with the following carefully-vetted service providers solely to deliver our services:</p>
    <ul>
      <li><strong>Stripe</strong> — payment processing (USA / EU).</li>
      <li><strong>Resend</strong> — transactional email delivery (USA).</li>
      <li><strong>Google LLC</strong> — single sign-on for the Resources area (USA).</li>
      <li><strong>MongoDB Atlas</strong> — database hosting (region depends on deployment).</li>
      <li><strong>Cal.com</strong> — meeting scheduling.</li>
      <li><strong>PostHog</strong> — product analytics.</li>
      <li><strong>Cloudflare</strong> — content delivery and DDoS protection.</li>
    </ul>

    <h2>6. International data transfers</h2>
    <p>
      Because we operate from India and use US-based providers, your data may be transferred to and
      processed in the United States, India, the EU, or other jurisdictions. Where required, we rely on
      Standard Contractual Clauses (SCCs) or equivalent safeguards.
    </p>

    <h2>7. Data retention</h2>
    <ul>
      <li>Project files and order records: <strong>7 years</strong> (for tax/accounting compliance).</li>
      <li>Marketing contacts: until you unsubscribe.</li>
      <li>Analytics data: typically 12 months in aggregated form.</li>
      <li>Failed / abandoned checkout sessions: 90 days.</li>
    </ul>

    <h2>8. Your rights</h2>
    <p>Subject to applicable law, you have the right to:</p>
    <ul>
      <li><strong>Access</strong> the personal data we hold about you.</li>
      <li><strong>Correct</strong> inaccurate data.</li>
      <li><strong>Delete</strong> your data (subject to legal retention requirements).</li>
      <li><strong>Object</strong> to processing or restrict it.</li>
      <li><strong>Data portability</strong> — receive your data in a portable format.</li>
      <li><strong>Withdraw consent</strong> at any time, without affecting the lawfulness of past processing.</li>
      <li><strong>Lodge a complaint</strong> with your local data protection authority.</li>
    </ul>
    <p>To exercise any right, email us at <a href={`mailto:${COMPANY.contactEmail}`}>{COMPANY.contactEmail}</a>. We respond within 30 days.</p>

    <h2>9. California residents (CCPA / CPRA)</h2>
    <p>
      California residents have additional rights to know, delete, correct, and limit use of sensitive
      personal information. We do not sell or “share” your personal information as defined under the
      CCPA/CPRA. To submit a request, email us with “California Privacy Request” in the subject line.
    </p>

    <h2>10. Children's privacy</h2>
    <p>Our services are not directed to individuals under 16, and we do not knowingly collect data from children.</p>

    <h2>11. Security</h2>
    <p>
      We protect your data with industry-standard safeguards including HTTPS/TLS encryption in transit,
      access controls, and least-privilege principles. No system is 100% secure — if you believe your
      account or data has been compromised, please contact us immediately.
    </p>

    <h2>12. Changes to this policy</h2>
    <p>We may update this Privacy Policy. Material changes will be notified via email or a prominent notice on the website. Continued use after changes constitutes acceptance.</p>

    <h2>13. Contact</h2>
    <p>
      For privacy questions, requests, or complaints, email{' '}
      <a href={`mailto:${COMPANY.contactEmail}`}>{COMPANY.contactEmail}</a> with the subject "Privacy Request".
    </p>
  </LegalLayout>
);

// ============== TERMS OF SERVICE ==============
export const TermsOfService = () => (
  <LegalLayout
    title="Terms of Service"
    subtitle="The legal agreement between you and SkiFi Designs when using our website and services."
    slug="terms"
  >
    <h2>1. Agreement</h2>
    <p>
      These Terms of Service (“Terms”) form a binding agreement between you (“Client”, “you”) and{' '}
      {COMPANY.name} d/b/a {COMPANY.brand} (“we”, “us”, “our”). By accessing {COMPANY.website},
      placing an order, or signing up for our services, you agree to these Terms. If you do not agree,
      do not use our services.
    </p>

    <h2>2. Services</h2>
    <p>We provide custom presentation design services, including but not limited to:</p>
    <ul>
      <li>Investor pitch decks</li>
      <li>Sales decks and corporate presentations</li>
      <li>PowerPoint, Google Slides, Keynote, Figma and Adobe design work</li>
      <li>Digital templates (free and paid)</li>
      <li>Design consultations and discovery calls</li>
    </ul>
    <p>Our services are digital and delivered electronically. No physical goods ship.</p>

    <h2>3. Orders and pricing</h2>
    <ul>
      <li><strong>Per-Slide:</strong> US$15 per slide. Pricing displayed on the website is in US Dollars and exclusive of any applicable taxes.</li>
      <li><strong>Monthly Retainer:</strong> US$999/month, billed in advance, auto-renewing until cancelled.</li>
      <li>Custom quotes for enterprise projects are agreed in writing before work begins.</li>
      <li>Payment is collected via Stripe at order placement. Work begins after successful payment.</li>
    </ul>

    <h2>4. Scope of work and revisions</h2>
    <p>
      The project scope, deliverables and timeline are agreed during onboarding. Each project includes a
      reasonable number of revisions (typically two rounds). Scope changes, additional slides, or revisions
      beyond the agreed number are billed at our standard per-slide rate.
    </p>

    <h2>5. Client responsibilities</h2>
    <p>To deliver on schedule we require:</p>
    <ul>
      <li>Accurate brief, content, brand assets and any required logos/images.</li>
      <li>Timely feedback within the agreed review windows.</li>
      <li>That you own — or have legitimate rights to — all materials you provide to us.</li>
    </ul>

    <h2>6. Intellectual property</h2>
    <ul>
      <li><strong>Your content:</strong> You retain all rights to materials you provide. You grant us a non-exclusive licence to use them solely to deliver the project.</li>
      <li><strong>Final deliverables:</strong> Once full payment is received, you receive full ownership of the final files and may use them for any lawful purpose.</li>
      <li><strong>Working files & source assets:</strong> Source files (Figma, etc.) and intermediate drafts remain our property unless explicitly purchased.</li>
      <li><strong>Portfolio rights:</strong> We reserve the right to showcase completed (non-confidential) work in our portfolio, case studies and marketing. If your project is under NDA, tell us in writing before kick-off and we'll exclude it.</li>
      <li><strong>Stock assets:</strong> Stock images, icons or fonts we use are licensed for your final deliverable. You may not re-distribute them as stand-alone assets.</li>
      <li><strong>Templates:</strong> Templates purchased from our Resources area are licensed for the buyer's own/their employer's commercial use. Re-selling, sub-licensing or redistributing the template files is prohibited.</li>
    </ul>

    <h2>7. Refund Policy</h2>
    <p>Full details are in our <Link to="/refund-policy" className="text-[#2A7AFE] underline">Refund Policy</Link>. In summary:</p>
    <ul>
      <li><strong>100% refund</strong> — if requested before any design work has begun.</li>
      <li><strong>50% refund</strong> — after the first draft has been delivered (covers our design time).</li>
      <li><strong>No refund</strong> — once final files have been delivered and approved.</li>
      <li>Refund requests must be submitted within 7 days of the relevant milestone.</li>
    </ul>

    <h2>8. Subscriptions and cancellations</h2>
    <p>
      Monthly Retainer subscriptions auto-renew until cancelled. You may cancel at any time from your
      Stripe customer portal or by emailing us. Cancellation takes effect at the end of the current
      billing period; the current month is not pro-rated.
    </p>

    <h2>9. Chargebacks</h2>
    <p>
      We respond to all legitimate refund requests promptly and in good faith. Filing a chargeback with
      your bank without first contacting us is a breach of these Terms and may result in us pursuing the
      disputed amount plus reasonable costs.
    </p>

    <h2>10. Confidentiality</h2>
    <p>
      We treat all client materials as confidential and only share them within our delivery team. We are
      happy to sign mutual NDAs for sensitive projects on request.
    </p>

    <h2>11. Disclaimer of warranties</h2>
    <p>
      Our services are provided “as is” without warranties of any kind, whether express or implied,
      including merchantability, fitness for a particular purpose, or non-infringement. We do not
      guarantee any specific business outcome (fundraising success, sales, etc.) from designs we deliver.
    </p>

    <h2>12. Limitation of liability</h2>
    <p>
      To the maximum extent permitted by law, our aggregate liability arising out of or relating to these
      Terms or our services is limited to the total amount you have paid us in the 6 months immediately
      preceding the claim. We are not liable for indirect, incidental, special, consequential, or
      punitive damages, including lost profits or revenue.
    </p>

    <h2>13. Indemnification</h2>
    <p>
      You agree to indemnify and hold us harmless from any claims arising out of (a) your use of our
      services in violation of these Terms or applicable law, or (b) third-party rights claims based on
      content or materials you provided to us.
    </p>

    <h2>14. Governing law and dispute resolution</h2>
    <p>
      These Terms are governed by the laws of the State of {COMPANY.jurisdiction}, without regard to
      conflict-of-laws principles. Any dispute will first be addressed by good-faith negotiation. If
      unresolved within 30 days, disputes will be resolved by binding arbitration in {COMPANY.jurisdiction},
      or — at our option — in the courts located in Sheridan County, Wyoming. You waive any right to
      participate in class-action proceedings against us.
    </p>

    <h2>15. Termination</h2>
    <p>
      We may suspend or terminate your access to our services for breach of these Terms, non-payment, or
      abusive conduct. Sections that by their nature should survive (IP, liability, governing law) will
      survive termination.
    </p>

    <h2>16. Changes to these Terms</h2>
    <p>We may update these Terms. Material changes will be notified by email or a prominent website notice. Continued use after the changes constitutes acceptance.</p>

    <h2>17. Contact</h2>
    <p>For questions about these Terms email <a href={`mailto:${COMPANY.contactEmail}`}>{COMPANY.contactEmail}</a>.</p>
  </LegalLayout>
);

// ============== REFUND POLICY ==============
export const RefundPolicy = () => (
  <LegalLayout
    title="Refund Policy"
    subtitle="Our transparent, milestone-based refund terms for SkiFi Designs services."
    slug="refund"
  >
    <h2>1. Our philosophy</h2>
    <p>
      We want you delighted with the work. If something isn't right, we will always try to make it right
      through revisions first. When a refund is the right outcome, the tiers below apply.
    </p>

    <h2>2. Refund tiers (project-based work)</h2>
    <table>
      <thead>
        <tr><th>Stage</th><th>Refund</th><th>Why</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Before design work begins</strong></td>
          <td><strong>100%</strong> of amount paid</td>
          <td>No work has been completed yet.</td>
        </tr>
        <tr>
          <td><strong>After first draft is delivered</strong></td>
          <td><strong>50%</strong> of amount paid</td>
          <td>Compensates the design hours already invested.</td>
        </tr>
        <tr>
          <td><strong>After final files delivered &amp; approved</strong></td>
          <td><strong>No refund</strong></td>
          <td>The work is complete and licensed to you.</td>
        </tr>
      </tbody>
    </table>

    <h2>3. Request window</h2>
    <p>
      Refund requests must be submitted within <strong>7 days</strong> of the relevant milestone (kick-off
      confirmation, first-draft delivery, or final-file delivery). Requests outside this window will not
      be considered.
    </p>

    <h2>4. How to request</h2>
    <p>Email <a href={`mailto:${COMPANY.contactEmail}`}>{COMPANY.contactEmail}</a> with:</p>
    <ul>
      <li>Subject line: "Refund Request — [Your name / Order ID]"</li>
      <li>Stripe receipt / order ID</li>
      <li>Reason for the refund</li>
      <li>The milestone the request relates to</li>
    </ul>

    <h2>5. Processing time</h2>
    <p>
      Approved refunds are issued to the original payment method via Stripe within <strong>5–10
      business days</strong>. Your bank may take additional days to credit the funds.
    </p>

    <h2>6. Subscriptions (Monthly Retainer)</h2>
    <ul>
      <li>You may cancel at any time. The current billing month is <strong>not pro-rated</strong>.</li>
      <li>If you cancel before any design work is requested for the current month, contact us within 7 days of the billing date for a full refund of that month.</li>
      <li>No refunds for previously-completed monthly periods.</li>
    </ul>

    <h2>7. Templates (digital downloads)</h2>
    <p>
      Because templates are delivered instantly and cannot be "returned" once downloaded, paid template
      purchases are generally <strong>non-refundable</strong>. We will, however, refund in the following
      cases:
    </p>
    <ul>
      <li>The download link is broken and we cannot deliver the file within 48 hours.</li>
      <li>The file is materially different from what was advertised.</li>
    </ul>

    <h2>8. Chargebacks</h2>
    <p>
      Please contact us before initiating a chargeback. We respond to legitimate concerns quickly. A
      chargeback filed without first contacting us is treated as a breach of our Terms of Service and
      may incur additional fees.
    </p>

    <h2>9. Exceptions</h2>
    <p>
      Refunds may be declined where there is evidence of (a) abuse of the refund process, (b) breach of
      our Terms of Service, or (c) attempted misuse of work product (e.g., requesting a refund after the
      delivered files have already been used commercially).
    </p>

    <h2>10. Contact</h2>
    <p>
      Questions about your refund? Email{' '}
      <a href={`mailto:${COMPANY.contactEmail}`}>{COMPANY.contactEmail}</a> — we typically reply within
      one business day.
    </p>
  </LegalLayout>
);

// ============== COOKIE POLICY ==============
export const CookiePolicy = () => (
  <LegalLayout
    title="Cookie Policy"
    subtitle="What cookies and similar technologies SkiFi Designs uses and how to control them."
    slug="cookies"
  >
    <h2>1. What are cookies?</h2>
    <p>
      Cookies are small text files stored on your device when you visit a website. They help sites work
      properly, remember preferences, and understand how visitors use the site.
    </p>

    <h2>2. How we use cookies</h2>
    <p>We use the following categories:</p>
    <ul>
      <li>
        <strong>Strictly necessary cookies</strong> — required for the website to function. Used for
        secure login, remembering your dark/light theme preference, and shopping/onboarding flow.
        These cannot be disabled.
      </li>
      <li>
        <strong>Analytics cookies</strong> — set by PostHog to help us understand how visitors use the
        site (pages viewed, time on page, traffic source). Data is aggregated and does not identify you
        personally.
      </li>
      <li>
        <strong>Authentication cookies</strong> — set when you sign in with Google to access the
        Resources area.
      </li>
      <li>
        <strong>Third-party cookies</strong> — set by services we embed (Stripe checkout, Cal.com
        booking widget, Cloudflare). These are governed by the respective providers' own policies.
      </li>
    </ul>

    <h2>3. Local storage</h2>
    <p>
      We use browser <code>localStorage</code> for non-tracking purposes — for example, to remember your
      theme preference, admin session token, and to cache user preferences.
    </p>

    <h2>4. Controlling cookies</h2>
    <p>You can:</p>
    <ul>
      <li>Block or delete cookies in your browser settings (Chrome, Safari, Firefox, etc.).</li>
      <li>Use private/incognito browsing.</li>
      <li>Opt out of PostHog analytics by enabling "Do Not Track" in your browser.</li>
    </ul>
    <p>
      Blocking strictly-necessary cookies may break parts of the website (e.g., checkout, sign-in,
      onboarding wizard).
    </p>

    <h2>5. Third-party links</h2>
    <p>
      Our website links to third-party services (Behance, LinkedIn, Cal.com, Stripe, etc.). Once you
      leave our site, the destination site's cookie policy applies.
    </p>

    <h2>6. Changes</h2>
    <p>We may update this Cookie Policy as we add or remove services. Material changes will be reflected by an updated effective date at the top.</p>

    <h2>7. Contact</h2>
    <p>For any questions, email <a href={`mailto:${COMPANY.contactEmail}`}>{COMPANY.contactEmail}</a>.</p>
  </LegalLayout>
);
