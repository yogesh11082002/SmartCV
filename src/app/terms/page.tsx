import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 container py-8 md:py-16">
        <div className="prose dark:prose-invert max-w-4xl mx-auto">
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: May 29, 2024</p>
          
          <p>
            Please read these Terms of Service ("Terms") carefully before using the SmartCV website and services (the "Service") operated by SmartCV ("us", "we", or "our").
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
          </p>

          <h2>2. Accounts</h2>
          <p>
            When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </p>

          <h2>3. Use of AI Services</h2>
          <p>
            Our Service uses artificial intelligence to generate and suggest content for your resume. While we strive for accuracy, we do not guarantee that the generated content will be free of errors, suitable for any specific purpose, or result in employment. You are solely responsible for reviewing, editing, and verifying all content before use.
          </p>

          <h2>4. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are and will remain the exclusive property of SmartCV and its licensors. You retain all rights to the personal content you create and input into your resumes.
          </p>

          <h2>5. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
          
          <h2>6. Limitation of Liability</h2>
          <p>
            In no event shall SmartCV, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>

          <h2>7. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which our company is established, without regard to its conflict of law provisions.
          </p>
          
          <h2>8. Changes</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect.
          </p>

          <h2>9. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at <a href="mailto:legal@smartcv.com">legal@smartcv.com</a>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
