import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 container py-8 md:py-16">
        <div className="prose dark:prose-invert max-w-4xl mx-auto">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: May 29, 2024</p>
          
          <p>
            SmartCV ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by SmartCV.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, build a resume, or communicate with us. This may include:
          </p>
          <ul>
            <li><strong>Account Information:</strong> Your name, email address, password, and other registration information.</li>
            <li><strong>Resume Content:</strong> Any information you voluntarily provide for your resume, such as work experience, education, skills, and contact details.</li>
            <li><strong>Usage Information:</strong> We collect information about your activity on our service, such as features you use and templates you select.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Provide, operate, and maintain our services, including our AI-powered resume generation.</li>
            <li>Improve, personalize, and expand our services.</li>
            <li>Communicate with you, including for customer service, to provide you with updates and other information relating to the service, and for marketing and promotional purposes.</li>
            <li>Process your transactions.</li>
            <li>Find and prevent fraud.</li>
          </ul>

          <h2>3. How We Share Your Information</h2>
          <p>
            We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information. We may share information with third-party vendors and service providers that perform services on our behalf, such as AI model providers (for the purpose of generating resume content) and payment processors. These third parties are obligated to protect your information.
          </p>

          <h2>4. Data Security</h2>
          <p>
            We use industry-standard security measures to protect the information we collect. However, no electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.
          </p>
          
          <h2>5. Your Choices</h2>
          <p>
            You can review and update your account information at any time by logging into your account. You may also delete your account and associated data from your account settings.
          </p>

          <h2>6. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@smartcv.com">privacy@smartcv.com</a>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
