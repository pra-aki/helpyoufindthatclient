import { Link } from "react-router";
import { Section, SubHeading } from "../components/LegalSection";

export function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">H</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-muted-foreground" style={{ fontFamily: "cursive" }}>
                  help you
                </span>
                <span className="text-xl font-bold text-foreground">Find That</span>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <span className="text-sm text-muted-foreground hover:text-foreground">Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last Updated: October 2026</p>

        <div className="space-y-10">
          <Section id="relationship" title="How This Policy Relates to Our Terms of Service">
            <p>
              This Privacy Policy explains what personal information helpyoufindthat ("the Service") collects, how
              we use and share it, and the rights you have over it. It is a disclosure statement, not a contract —
              our contractual relationship with you (rules of use, intellectual property, liability) is set out
              separately in our{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>
              . This Privacy Policy is written to meet our obligations under Canada's Personal Information
              Protection and Electronic Documents Act ("PIPEDA"), British Columbia's Personal Information
              Protection Act ("BC PIPA"), and, for users in the European Economic Area and United Kingdom, the
              General Data Protection Regulation ("GDPR" / "UK GDPR").
            </p>
          </Section>

          <Section id="who-we-are" title="1. Who We Are">
            <p>
              The Service is operated by Tinker Studios ("we," "us," or "our"), based in British Columbia, Canada.
              For the purposes of PIPEDA, BC PIPA, and the GDPR, we are the controller of the personal information
              described in this policy. You can reach us using the contact details in Section 16.
            </p>
          </Section>

          <Section id="information-we-collect" title="2. Information We Collect">
            <p>We collect the following categories of information when you use the Service.</p>

            <SubHeading>Account information</SubHeading>
            <p>
              Your email address, your password, and an optional display name you provide when you sign up.
              Authentication is handled entirely by our authentication provider, Supabase — we never see or store
              your password in plain text.
            </p>

            <SubHeading>Product and search content you provide</SubHeading>
            <p>
              The product or service names, website URLs, and descriptions you enter; the forums and date ranges
              you choose to search; and the settings for any scheduled daily search ("job") you create, including
              the notification email address (which defaults to your account email unless you change it).
            </p>

            <SubHeading>Lead data we retrieve on your behalf</SubHeading>
            <p>
              When you run a search, we query publicly available posts on the forums you select (such as Reddit,
              Quora, Facebook Groups, or LinkedIn Groups) and store each matching thread's title, link, forum, a
              short summary, its estimated posting date, and a relevance score. This is information other people
              posted publicly on those platforms — it is not personal information about you. If you mark a lead as
              "responded to," we store the date you did so.
            </p>

            <SubHeading>Search logs</SubHeading>
            <p>
              A record of each search request we send to our AI search provider, including the search prompt
              generated from your product description and basic metadata about what came back (result counts, the
              URLs returned, and how long it took). These logs are automatically deleted 30 days after they're
              created.
            </p>

            <SubHeading>Credits and usage records</SubHeading>
            <p>
              Your account's credit balance and a transaction history explaining it — for example, credits spent on
              a search or a scheduled run, and any refunds. We do not currently charge for credits or collect
              payment information. See Section 15 for what changes if that becomes available.
            </p>

            <SubHeading>Session data</SubHeading>
            <p>
              When you sign in, an authentication token is stored in your browser's local storage so you stay
              signed in between visits. This is not a tracking cookie, and it is not shared with any third party.
            </p>

            <SubHeading>Technical and log data</SubHeading>
            <p>
              Like most websites, the infrastructure providers that host the Service — Cloudflare for the website
              and Render for the application server — automatically log standard technical information for
              security and reliability, such as IP address, browser type, and request timestamps. We do not use
              this data for advertising, and we do not build profiles from it.
            </p>

            <SubHeading>What we don't collect</SubHeading>
            <p>
              We do not use advertising or analytics trackers of any kind. We do not sell your personal
              information. The Service is not directed at, and we do not knowingly collect information from,
              anyone under 18.
            </p>
          </Section>

          <Section id="how-we-use" title="3. How We Use Your Information">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To create, maintain, and authenticate your account</li>
              <li>To run the searches you request and store the leads they find</li>
              <li>To run scheduled daily searches you set up and email you the new leads they find</li>
              <li>To generate website descriptions and reply drafts you ask us to compose</li>
              <li>To operate the credits system that governs usage of the Service</li>
              <li>To maintain the security, integrity, and reliability of the Service, including rate limiting and diagnosing errors</li>
              <li>To communicate with you about your account, support requests, or important notices about the Service</li>
              <li>To comply with our legal obligations</li>
            </ul>
          </Section>

          <Section id="legal-basis" title="4. Legal Basis for Processing (EEA / UK Users)">
            <p>
              Where the GDPR or UK GDPR applies to you, we rely on the following legal bases: processing your
              account and product information is necessary to perform our contract with you (providing the
              Service you signed up for); processing search logs and technical data is necessary for our
              legitimate interest in operating, securing, and improving the Service, an interest we've weighed
              against your rights. We do not rely on consent as the basis for core functionality, since providing
              the Service is contractually necessary. If we introduce optional features that rely on consent (for
              example, marketing emails), we will ask for it separately, and you may withdraw it at any time.
            </p>
          </Section>

          <Section id="how-we-share" title="5. How We Share Your Information">
            <p>
              We do not sell your personal information, and we do not share it with advertisers or data brokers.
              We share it only with the service providers who help us operate the Service (each acting as a
              processor on our instructions), to comply with a legal obligation such as a valid court order, or
              with your consent.
            </p>
            <p>Our current service providers are:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-foreground">Supabase, Inc.</strong> — authentication and database hosting;
                stores all of the data described in Section 2
              </li>
              <li>
                <strong className="text-foreground">Render Services, Inc.</strong> — hosting for our backend
                application server
              </li>
              <li>
                <strong className="text-foreground">Cloudflare, Inc.</strong> — hosting and content delivery for
                our website
              </li>
              <li>
                <strong className="text-foreground">Perplexity AI, Inc.</strong> — receives the product
                descriptions and search parameters you provide, in order to search public forums on your behalf
                and draft any descriptions or replies you ask it to generate
              </li>
              <li>
                <strong className="text-foreground">Resend</strong> — sends the scheduled-search notification
                emails you've set up, to the email address you configured for that job
              </li>
            </ul>
          </Section>

          <Section id="international-transfers" title="6. International Data Transfers">
            <p>
              Our service providers may store and process information outside of Canada, including in the United
              States. Where applicable law requires additional safeguards for such transfers (such as under the
              GDPR), we rely on the contractual and technical safeguards our service providers maintain, and we
              select providers that uphold appropriate security and privacy commitments.
            </p>
          </Section>

          <Section id="retention" title="7. Data Retention">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Account and product data is retained for as long as your account is active.</li>
              <li>Search logs are automatically deleted 30 days after they're created.</li>
              <li>
                Credit transaction history is retained for as long as your account exists, as a record of account
                activity.
              </li>
              <li>
                If you close your account, we delete or anonymize your personal information within a reasonable
                period, except where we're required to keep it by law or for legitimate record-keeping (such as
                financial transaction history).
              </li>
            </ul>
            <p>
              Self-service account deletion is not yet available in the app. Until it is, contact us at{" "}
              <a href="mailto:support@helpyoufindthat.com" className="text-primary hover:underline">
                support@helpyoufindthat.com
              </a>{" "}
              and we will process your deletion request manually.
            </p>
          </Section>

          <Section id="your-rights" title="8. Your Privacy Rights">
            <SubHeading>If you are in Canada</SubHeading>
            <p>
              Under PIPEDA and BC PIPA, you have the right to access the personal information we hold about you,
              request correction of inaccurate information, and withdraw consent to our collection, use, or
              disclosure of your information, subject to legal or contractual restrictions. To exercise these
              rights, contact us using the details in Section 16. If you're not satisfied with our response, you
              may complain to the{" "}
              <a
                href="https://www.priv.gc.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Office of the Privacy Commissioner of Canada
              </a>{" "}
              or, for matters specific to British Columbia, the{" "}
              <a
                href="https://www.oipc.bc.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Office of the Information and Privacy Commissioner for British Columbia
              </a>
              .
            </p>

            <SubHeading>If you are in the EEA or UK</SubHeading>
            <p>
              Under the GDPR or UK GDPR, you have the right to access, rectify, or erase your personal data,
              restrict or object to our processing of it, and receive a copy of it in a portable format. You may
              lodge a complaint with your local data protection supervisory authority — in the UK, the{" "}
              <a
                href="https://ico.org.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Information Commissioner's Office
              </a>
              .
            </p>

            <p>
              We will respond to verified requests within the time required by applicable law — generally 30 days
              under PIPEDA and BC PIPA, and one month under the GDPR, extendable where the law permits.
            </p>
          </Section>

          <Section id="security" title="9. Security">
            <p>
              We use industry-standard safeguards to protect your information, including encryption in transit
              (TLS), and database access controls (row-level security) that restrict your data to your own
              account. Your password is managed entirely by our authentication provider and is never stored by us
              in plain text or accessible to us. No method of transmission or storage is completely secure, and we
              cannot guarantee absolute security — our Terms of Service describe this in more detail for the
              current Beta period of the Service.
            </p>
          </Section>

          <Section id="cookies" title="10. Cookies and Similar Technologies">
            <p>
              We do not use advertising or analytics cookies. We use your browser's local storage to keep you
              signed in; this is required for the Service to function and is not used to track you across other
              websites.
            </p>
          </Section>

          <Section id="automated-processing" title="11. Automated Processing">
            <p>
              We use a third-party AI service to search forums on your behalf and to estimate how relevant a
              thread is to your product. This produces search results and suggested content for you to review —
              it does not make any automated decision that produces legal effects concerning you or similarly
              significantly affects you. You decide which leads to pursue, reply to, or discard.
            </p>
          </Section>

          <Section id="childrens-privacy" title="12. Children's Privacy">
            <p>
              The Service is not directed at anyone under 18, and we do not knowingly collect personal information
              from anyone under that age. If you believe a child has provided us with personal information,
              contact us and we will delete it.
            </p>
          </Section>

          <Section id="third-party-links" title="13. Third-Party Links">
            <p>
              Leads found through the Service link out to content posted publicly on other platforms (such as
              Reddit or Quora). We are not responsible for the privacy practices of those platforms; please review
              their own privacy policies before interacting with them.
            </p>
          </Section>

          <Section id="payment-information" title="14. Payment Information">
            <p>
              We do not currently charge for the Service or collect payment card information. If we introduce paid
              plans, payment will be handled by a PCI-compliant third-party payment processor, and we will update
              this Privacy Policy to describe that processor and how payment information is handled before it's
              integrated.
            </p>
          </Section>

          <Section id="changes" title="15. Changes to This Policy">
            <p>
              We may update this policy from time to time. We'll update the "Last Updated" date above whenever we
              do, and for material changes, we'll provide additional notice — for example, by email or an in-app
              notice.
            </p>
          </Section>

          <Section id="contact" title="16. Contact Us">
            <p>For privacy inquiries, access/correction/deletion requests, or general legal notices:</p>
            <ul className="list-none space-y-1">
              <li>
                <strong className="text-foreground">Legal Entity:</strong> Tinker Studios
              </li>
              <li>
                <strong className="text-foreground">Mailing Address:</strong> Vancouver, BC, Canada
              </li>
              <li>
                <strong className="text-foreground">Privacy/Legal Inquiries:</strong>{" "}
                <a href="mailto:support@helpyoufindthat.com" className="text-primary hover:underline">
                  support@helpyoufindthat.com
                </a>
              </li>
            </ul>
          </Section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8 mt-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          © 2026 helpyoufindthat. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
