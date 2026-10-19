import { Link } from "react-router";
import { Section, SubHeading } from "../components/LegalSection";

export function Terms() {
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service (Beta Version)</h1>
        <p className="text-sm text-muted-foreground mb-10">Last Updated: October 2026</p>

        <div className="space-y-10">
          <section>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you,"
                or "your") and Tinker Studios ("Company," "we," "us," or "our"), regarding your access to and use of
                the helpyoufindthat website, application, and related software services (collectively, the
                "Service").
              </p>
              <p className="text-foreground font-medium">
                PLEASE READ THESE TERMS CAREFULLY. BY CREATING AN ACCOUNT, ACCESSING, OR USING THE SERVICE, YOU
                AGREE TO BE BOUND BY THESE TERMS AND OUR{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  PRIVACY POLICY
                </Link>
                . IF YOU DO NOT AGREE TO THESE TERMS, DO NOT ACCESS OR USE THE SERVICE.
              </p>
            </div>
          </section>

          <Section id="eligibility" title="1. Eligibility and Account Registration">
            <SubHeading>Age Requirement</SubHeading>
            <p>
              You must be at least 18 years of age (or the age of legal majority in your jurisdiction) to use the
              Service.
            </p>
            <SubHeading>Authority</SubHeading>
            <p>
              If you access or use the Service on behalf of a company, partnership, or other legal entity, you
              represent and warrant that you have full legal authority to bind that entity to these Terms.
            </p>
            <SubHeading>Account Responsibility</SubHeading>
            <p>
              You are solely responsible for safeguarding your login credentials and for all activities that occur
              under your account. You agree to notify us immediately of any unauthorized use or security
              compromise.
            </p>
          </Section>

          <Section id="beta" title="2. Beta Testing Services & Experimental Nature">
            <SubHeading>Pre-Release Beta Status</SubHeading>
            <p>
              The Service is provided solely as a pre-release "Beta" evaluation version. The Service is under
              active development, is provided on a complimentary trial basis, and may contain bugs, programming
              errors, design flaws, or experience service outages.
            </p>
            <SubHeading>No Uptime or Availability Guarantee</SubHeading>
            <p>
              We do not provide any Service Level Agreement (SLA), performance commitments, or uptime guarantees.
              Access may be throttled, suspended, or interrupted at any time without notice for updates,
              maintenance, or testing.
            </p>
            <SubHeading>Data Loss and Schema Modifications</SubHeading>
            <p>
              Because system configurations and database schemas evolve during active development, we do not
              warrant or guarantee against data loss, data corruption, or account resets. You are solely
              responsible for maintaining external backups of any critical data you process through the Service.
            </p>
            <SubHeading>Right to Modify or Discontinue</SubHeading>
            <p>
              We reserve the sole right to alter, throttle, suspend, or permanently terminate the Beta Service (in
              whole or in part) at any time, for any reason or no reason, without notice and without liability to
              you.
            </p>
          </Section>

          <Section id="credits" title="3. Beta Credits and Usage Tokens">
            <SubHeading>Complimentary Beta Allocation</SubHeading>
            <p>
              Upon creating a valid account, users receive a complimentary allocation of one hundred (100)
              promotional Beta credits ("Credits") to evaluate and test the Service. Specific credit consumption
              rates are outlined in-app adjacent to the respective features.
            </p>
            <SubHeading>No Monetary or Cash Value</SubHeading>
            <p>
              Credits are provided free of charge as a limited, revocable, non-transferable, and non-exclusive
              license to test system features. Credits do not constitute property, have zero ($0.00) monetary or
              cash value, do not accrue interest, and are not redeemable, transferable, or exchangeable for any
              currency, cash equivalent, or consideration.
            </p>
            <SubHeading>No Right or Entitlement to Credits</SubHeading>
            <p>
              You acknowledge and agree that you are not entitled to the preservation, replacement, or payout of
              any Credits. If Credits are lost, miscalculated, or consumed as a result of:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Software malfunctions, bugs, or processing errors;</li>
              <li>Database resets or account re-indexing; or</li>
              <li>A decision by Tinker Studios to shut down, sunset, or transition the Beta Service,</li>
            </ul>
            <p>
              we bear zero liability or obligation to restore, replace, or compensate you for any unused or spent
              Credits.
            </p>
            <SubHeading>Forfeiture and Expiration</SubHeading>
            <p>
              Tinker Studios reserves the right, in its sole discretion, to modify credit balances, expire unused
              credits, or revoke credits entirely at any time.
            </p>
          </Section>

          <Section id="ip" title="4. Intellectual Property & Feedback">
            <SubHeading>Company Intellectual Property</SubHeading>
            <p>
              Tinker Studios retains all right, title, and interest in and to the Service, including all source
              code, algorithms, user interfaces, documentation, trademarks, and logos. Nothing in these Terms
              grants you any ownership rights in the Service.
            </p>
            <SubHeading>User Data</SubHeading>
            <p>
              You retain full ownership of any content or data you submit to the Service ("User Data"). You grant
              Tinker Studios a limited, worldwide license to host, process, and transmit your User Data strictly as
              necessary to operate and maintain the Service.
            </p>
            <SubHeading>Feedback</SubHeading>
            <p>
              If you provide suggestions, bug reports, feature requests, or improvements ("Feedback"), you grant us
              an irrevocable, perpetual, royalty-free, worldwide license to use, adapt, implement, and commercialize
              such Feedback without any compensation, attribution, or accounting to you.
            </p>
          </Section>

          <Section id="acceptable-use" title="5. Acceptable Use and Prohibited Activities">
            <SubHeading>Prohibited Conduct</SubHeading>
            <p>You agree not to, directly or indirectly:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Reverse engineer, decompile, disassemble, or attempt to derive the source code or underlying
                architecture of the Service;
              </li>
              <li>
                Resell, lease, sublicense, distribute, or make the Service available to third parties or operate it
                as a shared service;
              </li>
              <li>
                Interfere with, overburden, compromise, or bypass the security, authentication protocols, rate
                limits, or network integrity of our infrastructure;
              </li>
              <li>
                Scrape, crawl, or harvest data or content from the Service using automated scripts, bots, or
                spiders without our express written permission;
              </li>
              <li>Use the Service for any unlawful, harassing, defamatory, fraudulent, or malicious purpose.</li>
            </ul>
            <SubHeading>Immediate Account Suspension/Termination</SubHeading>
            <p>
              We reserve the right, in our sole discretion and without prior notice or liability, to immediately
              suspend or permanently terminate your account and forfeit all associated Credits if you breach these
              Terms.
            </p>
          </Section>

          <Section id="warranties" title='6. Disclaimer of Warranties ("As-Is")'>
            <p className="font-medium">
              TO THE MAXIMUM EXTENT PERMITTED UNDER APPLICABLE LAW, THE BETA SERVICE IS PROVIDED STRICTLY ON AN
              "AS-IS" AND "AS-AVAILABLE" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS,
              IMPLIED, STATUTORY, OR COLLATERAL.
            </p>
            <p>
              TINKER STUDIOS EXPRESSLY DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO ANY IMPLIED WARRANTIES
              OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, ACCURACY, NON-INFRINGEMENT, OR
              UNINTERRUPTED, SECURE, BUG-FREE OPERATION. WE DO NOT WARRANT THAT THE SERVICE WILL SATISFY YOUR
              OPERATIONAL REQUIREMENTS, THAT DATA LOSS WILL NOT OCCUR, OR THAT DEFECTS WILL BE CORRECTED.
            </p>
          </Section>

          <Section id="liability" title="7. Limitation of Liability">
            <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:</p>
            <SubHeading>Exclusion of Consequential Damages</SubHeading>
            <p>
              IN NO EVENT SHALL TINKER STUDIOS, ITS SOLE PROPRIETOR, CONTRACTORS, OR AGENTS BE LIABLE FOR ANY
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT
              LIMITED TO LOSS OF PROFITS, LOSS OF REVENUE, LOSS OF GOODWILL, LOSS OF DATA, WORK STOPPAGE, OR SYSTEM
              OUTAGES, ARISING OUT OF OR IN CONNECTION WITH THE USE OR INABILITY TO USE THE SERVICE, REGARDLESS OF
              THE LEGAL THEORY (CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, OR OTHERWISE), EVEN IF ADVISED OF THE
              POSSIBILITY OF SUCH DAMAGES.
            </p>
            <SubHeading>Total Monetary Liability Cap</SubHeading>
            <p>
              BECAUSE THIS SERVICE AND ITS CREDITS ARE PROVIDED ENTIRELY FREE OF CHARGE DURING THE BETA PHASE, IN
              NO EVENT SHALL OUR TOTAL CUMULATIVE LIABILITY ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE
              EXCEED ZERO CANADIAN DOLLARS ($0.00 CAD).
            </p>
          </Section>

          <Section id="jurisdiction-notices" title="8. Jurisdiction-Specific Notices">
            <SubHeading>A. Notice to United States Users</SubHeading>
            <p>
              Some US jurisdictions do not allow the disclaimer of certain implied warranties or the limitation of
              liability for certain damages. If these laws apply to you, portions of Section 6 and Section 7 may
              not apply, and you may retain certain statutory rights.
            </p>
            <SubHeading>B. Notice to European Union and UK Users</SubHeading>
            <p>
              <strong className="text-foreground">Beta Notice &amp; Conformity (Directive (EU) 2019/770):</strong>{" "}
              You acknowledge and agree that you were expressly informed prior to using the Service that this is an
              experimental, pre-release Beta version provided free of charge, and that software errors, downtime,
              and operational variances are inherent to this evaluation phase.
            </p>
            <p>
              <strong className="text-foreground">Mandatory Consumer Rights:</strong> Nothing in these Terms shall
              limit or exclude any statutory rights you may hold under mandatory consumer laws that cannot be
              contractually waived. Section 7 does not exclude liability for gross negligence, willful misconduct,
              or personal injury caused by our negligence.
            </p>
          </Section>

          <Section id="indemnification" title="9. Indemnification">
            <p>
              You agree to defend, indemnify, and hold harmless Tinker Studios, its sole proprietor, and
              contractors from and against any claims, liabilities, damages, losses, and reasonable legal expenses
              (including reasonable legal fees) arising out of or related to: (a) your breach of these Terms; (b)
              your User Data; or (c) your misuse or unlawful use of the Service.
            </p>
          </Section>

          <Section id="governing-law" title="10. Governing Law and Dispute Resolution">
            <SubHeading>Governing Law</SubHeading>
            <p>
              These Terms and any dispute arising out of or related to them shall be governed by and construed in
              accordance with the laws of the Province of British Columbia and the federal laws of Canada
              applicable therein, without regard to conflict of law principles.
            </p>
            <SubHeading>Jurisdiction</SubHeading>
            <p>
              Subject to mandatory local consumer protection rules requiring local jurisdiction, you irrevocably
              submit to the exclusive jurisdiction of the courts located in Vancouver, British Columbia, Canada.
            </p>
            <SubHeading>Class Action Waiver</SubHeading>
            <p>
              To the maximum extent permitted by applicable law, you agree that any dispute resolution proceedings
              will be conducted solely on an individual basis and not as a class, consolidated, or representative
              action.
            </p>
          </Section>

          <Section id="general" title="11. Severability and General Provisions">
            <SubHeading>Severability</SubHeading>
            <p>
              If any provision of these Terms is determined by a court of competent jurisdiction to be invalid,
              illegal, or unenforceable, that specific provision shall be severed, and the remaining provisions
              shall continue in full force and effect.
            </p>
            <SubHeading>Entire Agreement</SubHeading>
            <p>
              These Terms, together with our{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              , constitute the complete and exclusive agreement between you and Tinker Studios concerning the
              Service, superseding all prior oral or written agreements.
            </p>
            <SubHeading>No Waiver</SubHeading>
            <p>
              Our failure to enforce any right or provision of these Terms shall not be deemed a waiver of such
              right or provision.
            </p>
          </Section>

          <Section id="modifications" title="12. Modifications to These Terms">
            <p>
              We may update these Terms from time to time. We'll update the "Last Updated" date above whenever we
              do. For minor or clarifying changes, that's the only notice you'll receive. For material changes —
              including changes to the Beta Credits terms, the liability provisions, or governing law — we'll
              provide additional notice, such as by email or an in-app notice, before the change takes effect.
            </p>
            <p>
              Your continued use of the Service after a change takes effect constitutes your acceptance of the
              revised Terms. If you do not agree to a change, your only remedy is to stop using the Service and,
              if applicable, close your account.
            </p>
          </Section>

          <Section id="contact" title="13. Contact Information">
            <p>For support, feedback, or legal inquiries, you may contact:</p>
            <ul className="list-none space-y-1">
              <li>
                <strong className="text-foreground">Entity:</strong> Tinker Studios
              </li>
              <li>
                <strong className="text-foreground">Mailing Address:</strong> Vancouver, British Columbia, Canada
              </li>
              <li>
                <strong className="text-foreground">Support &amp; Legal Email:</strong>{" "}
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
