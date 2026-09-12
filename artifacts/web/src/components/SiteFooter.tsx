import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "wouter";

const footerLinks = [
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

const patientLinks = [
  { label: "Find Doctors", href: "/doctors" },
  { label: "AI Assistant", href: "/healthbot" },
  { label: "Home Visit", href: "/doctors" },
  { label: "Book Appointment", href: "/doctors" },
];

const doctorLinks = [
  { label: "Join Medofile", href: "/register?role=doctor" },
  { label: "Grow Practice", href: "/register?role=doctor" },
  { label: "Create a Profile", href: "/register?role=doctor" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms" },
];

function FooterLinkColumn({ title, links }: { title: string; links: Array<{ label: string; href: string }> }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <nav className="mt-4 flex flex-col items-start gap-3 text-sm text-blue-100">
        {links.map((link) => <Link key={link.label} href={link.href} className="hover:text-white">{link.label}</Link>)}
      </nav>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-gradient-to-br from-[#0F2040] to-[#0A3D8F] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.35fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Medofile home">
            <img src="/brand-mark.svg" alt="" className="h-9 w-9 rounded-xl shadow-sm" />
            <span className="text-xl font-bold tracking-tight">Medofile</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-blue-100">
            Your complete healthcare platform — connecting patients with trusted doctors across India.
          </p>
          <div className="mt-5 flex flex-col gap-2.5 text-sm text-blue-100">
            <a className="inline-flex items-center gap-2 hover:text-white" href="mailto:admin@digitaldhatu.com">
              <Mail className="h-4 w-4 text-teal-300" /> admin@digitaldhatu.com
            </a>
            <a className="inline-flex items-center gap-2 hover:text-white" href="tel:+918080099200">
              <Phone className="h-4 w-4 text-teal-300" /> +91 8080099200
            </a>
          </div>
        </div>

        <FooterLinkColumn title="For Patients" links={patientLinks} />
        <FooterLinkColumn title="For Doctors" links={doctorLinks} />
        <div>
          <FooterLinkColumn title="Company" links={footerLinks} />
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-white">Support & legal</h2>
            <div className="mt-4 flex flex-col items-start gap-3 text-sm text-blue-100">
              {legalLinks.map((link) => <Link key={link.href} href={link.href} className="hover:text-white">{link.label}</Link>)}
              <Link href="/doctors" className="inline-flex items-center gap-2 hover:text-white">
                <MapPin className="h-4 w-4 text-teal-300" /> Find care near you
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-blue-200 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Medofile. All rights reserved.</span>
          <span>For general health information only — not a substitute for medical advice.</span>
        </div>
      </div>
    </footer>
  );
}
