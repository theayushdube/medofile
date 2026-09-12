import { ArrowRight, BriefcaseBusiness, HeartPulse, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";

export default function Careers() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="bg-[#0F2040] text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[.14em] text-teal-200"><BriefcaseBusiness className="h-4 w-4" /> Careers at Medofile</span>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">Help make care easier to find.</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-blue-100 md:text-lg">
              We are building a thoughtful healthcare experience for patients and doctors. If you care about useful products and meaningful outcomes, we would like to hear from you.
            </p>
          </div>
        </section>
        <section className="mx-auto max-w-4xl px-4 py-14 md:py-20">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: HeartPulse, title: "Mission-led", text: "Work on a product that supports real care decisions." },
              { icon: Sparkles, title: "Curious", text: "Bring strong questions and keep improving the details." },
              { icon: BriefcaseBusiness, title: "Responsible", text: "Build with trust, privacy, and accessibility in mind." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-border bg-white p-5">
                <Icon className="h-5 w-5 text-primary" />
                <h2 className="mt-4 font-bold text-foreground">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-3xl border border-primary/20 bg-primary/5 p-7 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[.14em] text-primary">Current opportunities</p>
            <h2 className="mt-3 text-2xl font-bold text-foreground">We are growing thoughtfully.</h2>
            <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
              We do not have a public list of open roles yet. Send us your background, the kind of work you want to do, and why Medofile interests you. Our team will review it when a relevant opportunity opens.
            </p>
            <a href="mailto:admin@digitaldhatu.com?subject=Careers%20at%20Medofile" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90">
              Share your profile <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">Looking for care instead? <Link href="/doctors" className="font-semibold text-primary hover:underline">Find a doctor</Link></p>
        </section>
      </main>
    </div>
  );
}
