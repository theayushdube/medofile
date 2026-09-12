import { Navbar } from "@/components/Navbar";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <p className="text-sm font-semibold uppercase tracking-[.14em] text-primary">Legal</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground">Terms of Service</h1>
        <p className="mt-4 text-sm text-muted-foreground">Last updated: September 12, 2026</p>
        <div className="prose prose-slate mt-10 max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground">
          <p>By using Medofile, you agree to use the platform responsibly and in accordance with these terms.</p>
          <h2>What Medofile provides</h2>
          <p>Medofile provides tools for discovering doctors, viewing professional profiles, requesting appointments, organizing care information, and accessing general health education.</p>
          <h2>Not medical advice</h2>
          <p>Medofile does not provide diagnosis, treatment, emergency care, or a substitute for a qualified healthcare professional. If you believe you have a medical emergency, contact local emergency services immediately.</p>
          <h2>Doctor information and appointments</h2>
          <p>Doctor profiles are provided for convenience and may change. An appointment request is not a guarantee of care until the doctor or clinic confirms it. Patients and doctors are responsible for providing accurate information and attending or updating appointments responsibly.</p>
          <h2>Accounts and acceptable use</h2>
          <p>Keep your account information accurate and secure. Do not impersonate another person, submit misleading health or professional information, misuse contact details, interfere with the service, or use Medofile for unlawful activity.</p>
          <h2>Content and availability</h2>
          <p>We work to keep Medofile useful and available, but features, content, and availability may change. General health guides are educational and should be checked with a qualified clinician before making healthcare decisions.</p>
          <h2>Contact</h2>
          <p>Questions about these terms can be sent to <a href="mailto:admin@digitaldhatu.com">admin@digitaldhatu.com</a> or +91 8080099200.</p>
        </div>
      </main>
    </div>
  );
}
