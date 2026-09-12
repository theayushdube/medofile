import { useState, type FormEvent } from "react";
import { CheckCircle2, Mail, MapPin, Phone, Send } from "lucide-react";
import { Navbar } from "@/components/Navbar";

type ContactFields = { name: string; email: string; phone: string; subject: string; message: string; website: string };
const initialFields: ContactFields = { name: "", email: "", phone: "", subject: "", message: "", website: "" };

export default function Contact() {
  const [fields, setFields] = useState<ContactFields>(initialFields);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; text: string }>({ type: "idle", text: "" });
  const [sending, setSending] = useState(false);

  function updateField(key: keyof ContactFields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setStatus({ type: "idle", text: "" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const result = await response.json().catch(() => ({})) as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error || "We could not send your enquiry.");
      setFields(initialFields);
      setStatus({ type: "success", text: result.message || "Thanks — your enquiry has been sent." });
    } catch (error) {
      setStatus({ type: "error", text: error instanceof Error ? error.message : "We could not send your enquiry. Please email us directly." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="bg-gradient-to-br from-[#0F2040] via-[#0A56B7] to-[#00A996] text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
            <p className="text-sm font-semibold uppercase tracking-[.14em] text-teal-200">Contact Medofile</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">Tell us how we can help.</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-blue-50 md:text-lg">Questions, feedback, partnership ideas, or support requests — send us an enquiry and our team will get back to you.</p>
          </div>
        </section>
        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[0.75fr_1.25fr] md:py-16">
          <aside className="rounded-3xl bg-[#0F2040] p-7 text-white md:p-8">
            <h2 className="text-2xl font-bold">Contact details</h2>
            <p className="mt-3 text-sm leading-6 text-blue-100">Prefer to write directly? Use the details below and include enough context for us to route your enquiry.</p>
            <div className="mt-8 space-y-5 text-sm">
              <a href="mailto:admin@digitaldhatu.com" className="flex items-start gap-3 text-blue-50 hover:text-white"><Mail className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" /><span><strong className="block text-white">Email</strong>admin@digitaldhatu.com</span></a>
              <a href="tel:+918080099200" className="flex items-start gap-3 text-blue-50 hover:text-white"><Phone className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" /><span><strong className="block text-white">Phone</strong>+91 8080099200</span></a>
              <div className="flex items-start gap-3 text-blue-50"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" /><span><strong className="block text-white">Availability</strong>Monday to Saturday, 10 AM–6 PM IST</span></div>
            </div>
          </aside>

          <form onSubmit={submit} className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-foreground">Your name <span className="text-destructive">*</span>
                <input required value={fields.name} onChange={(event) => updateField("name", event.target.value)} maxLength={100} placeholder="Your full name" className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-primary/30" />
              </label>
              <label className="text-sm font-semibold text-foreground">Email address <span className="text-destructive">*</span>
                <input required type="email" value={fields.email} onChange={(event) => updateField("email", event.target.value)} maxLength={160} placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-primary/30" />
              </label>
              <label className="text-sm font-semibold text-foreground">Phone number
                <input type="tel" value={fields.phone} onChange={(event) => updateField("phone", event.target.value)} maxLength={30} placeholder="+91 ..." className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-primary/30" />
              </label>
              <label className="text-sm font-semibold text-foreground">Subject <span className="text-destructive">*</span>
                <input required value={fields.subject} onChange={(event) => updateField("subject", event.target.value)} maxLength={160} placeholder="How can we help?" className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-primary/30" />
              </label>
            </div>
            <label className="mt-5 block text-sm font-semibold text-foreground">Message <span className="text-destructive">*</span>
              <textarea required minLength={10} maxLength={4000} rows={7} value={fields.message} onChange={(event) => updateField("message", event.target.value)} placeholder="Tell us a little more about your enquiry..." className="mt-2 w-full resize-y rounded-xl border border-border bg-background px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-primary/30" />
            </label>
            <label className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">Website
              <input tabIndex={-1} autoComplete="off" value={fields.website} onChange={(event) => updateField("website", event.target.value)} />
            </label>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div aria-live="polite" className="text-sm">
                {status.type === "success" && <p className="flex items-center gap-2 text-emerald-700"><CheckCircle2 className="h-4 w-4" />{status.text}</p>}
                {status.type === "error" && <p className="text-destructive">{status.text}</p>}
              </div>
              <button disabled={sending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">
                <Send className="h-4 w-4" /> {sending ? "Sending..." : "Send enquiry"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
