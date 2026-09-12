import { ArrowRight, HeartPulse, ShieldCheck, UsersRound } from "lucide-react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { usePageSeo } from "@/lib/seo";

export default function AboutUs() {
  usePageSeo({ title: "About Medofile | Connected Healthcare in India", description: "Learn how Medofile helps patients find trusted doctors near them, book appointments, and stay connected to their care journey.", path: "/about" });
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="bg-gradient-to-br from-[#0F2040] via-[#0A56B7] to-[#00A996] text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-sm font-semibold">
              <HeartPulse className="h-4 w-4 text-teal-200" /> About Medofile
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Healthcare should feel connected, clear, and close.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-blue-50 md:text-lg">
              Medofile helps people find trusted doctors, make informed booking decisions, and keep the important parts of their care journey together.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: UsersRound, title: "Built around people", text: "We design every experience around the patient, the doctor, and the real decisions they make before and after an appointment." },
              { icon: ShieldCheck, title: "Trust by design", text: "Clear profiles, verified reviews, transparent details, and careful handling of health information are core to the product." },
              { icon: HeartPulse, title: "Care that continues", text: "Medofile is more than a booking directory. It helps people return to follow-ups, reminders, and practical care guidance." },
            ].map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
                <h2 className="mt-5 text-xl font-bold text-foreground">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>

          <div className="mt-14 grid items-center gap-8 rounded-3xl bg-white p-7 shadow-sm md:grid-cols-[1fr_0.8fr] md:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[.14em] text-primary">Our purpose</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Make the next care decision easier.</h2>
              <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
                Finding the right care can be stressful. We bring doctors, useful health information, appointment details, and follow-up support into one calm, accessible experience.
              </p>
              <Link href="/doctors" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90">
                Find a doctor <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-3xl bg-secondary p-7">
              <p className="text-4xl font-bold text-primary">One place.</p>
              <p className="mt-1 text-4xl font-bold text-foreground">More confidence.</p>
              <p className="mt-5 text-sm leading-6 text-muted-foreground">From first search to the next follow-up, Medofile keeps care easier to navigate.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
