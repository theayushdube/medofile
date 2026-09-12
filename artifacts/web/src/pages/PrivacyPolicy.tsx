import { Navbar } from "@/components/Navbar";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <p className="text-sm font-semibold uppercase tracking-[.14em] text-primary">Legal</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
        <p className="mt-4 text-sm text-muted-foreground">Last updated: September 12, 2026</p>
        <div className="prose prose-slate mt-10 max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground">
          <p>Medofile respects your privacy and aims to be clear about how information is used across our website and healthcare platform.</p>
          <h2>Information we collect</h2>
          <p>We may collect account details, contact information, appointment details, profile information, messages you send us, and technical information needed to keep the service secure and reliable.</p>
          <h2>How we use information</h2>
          <p>We use information to provide and improve Medofile, help patients connect with doctors, manage bookings and follow-ups, respond to enquiries, protect the service, and meet legal obligations.</p>
          <h2>Health information</h2>
          <p>Health-related information should only be shared when it is needed for a feature you choose to use. We limit access based on account and product permissions and do not sell personal health information.</p>
          <h2>Sharing and service providers</h2>
          <p>We may use trusted service providers for hosting, authentication, analytics, communication, and email delivery. They receive only the information needed to provide their service and must handle it under appropriate safeguards.</p>
          <h2>Your choices</h2>
          <p>You may contact us to ask about your information, correct details, or request help with account-related privacy questions. Some information may need to be retained for security, legal, or operational reasons.</p>
          <h2>Contact</h2>
          <p>For privacy questions, email <a href="mailto:admin@digitaldhatu.com">admin@digitaldhatu.com</a> or call +91 8080099200.</p>
          <p className="text-sm">This page provides general information about Medofile’s practices. Specific features may have additional notices shown at the point of use.</p>
        </div>
      </main>
    </div>
  );
}
