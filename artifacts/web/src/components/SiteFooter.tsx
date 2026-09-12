import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "wouter";

const footerLinks = [
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-[#0F2040] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Medofile home">
            <img src="/brand-mark.svg" alt="" className="h-9 w-9 rounded-xl bg-white shadow-sm" />
            <span className="text-xl font-bold tracking-tight">Medofile</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-blue-100">
            Connected healthcare that helps patients find trusted doctors, understand their care, and stay organized before and after appointments.
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

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[.14em] text-teal-200">Medofile</h2>
          <nav className="mt-4 flex flex-col items-start gap-3 text-sm text-blue-100" aria-label="Company">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white">{link.label}</Link>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[.14em] text-teal-200">Support & legal</h2>
          <div className="mt-4 flex flex-col items-start gap-3 text-sm text-blue-100">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white">{link.label}</Link>
            ))}
            <Link href="/doctors" className="inline-flex items-center gap-2 hover:text-white">
              <MapPin className="h-4 w-4 text-teal-300" /> Find care near you
            </Link>
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
