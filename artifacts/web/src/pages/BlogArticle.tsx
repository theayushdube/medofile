import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, CalendarDays, ShieldCheck, Stethoscope } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useBlogSeo } from "@/lib/blogSeo";

type Section = { heading: string; body: string };
type Article = {
  slug: string;
  title: string;
  excerpt: string;
  topic: string;
  seoDescription: string;
  keywords: string[];
  content: Section[];
  relatedSpecializations: string[];
  publishedAt: string | null;
};

function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value))
    : "";
}

export default function BlogArticle() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug ?? "";
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  useBlogSeo(
    article?.title ?? "Medofile Health Guide",
    article?.seoDescription ?? "Patient-friendly, medically cautious health information from Medofile.",
    `/blog/${slug}`,
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/blog/${encodeURIComponent(slug)}`)
      .then(async (response) => {
        if (response.status === 404) {
          if (active) setMissing(true);
          return null;
        }
        if (!response.ok) throw new Error("Unable to load article");
        return response.json() as Promise<Article>;
      })
      .then((result) => {
        if (active && result) setArticle(result);
      })
      .catch(() => active && setMissing(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80">
          <ArrowLeft className="w-4 h-4" /> All health guides
        </Link>
        {loading && <div className="mt-7 space-y-4 animate-pulse"><div className="h-5 w-28 bg-muted rounded" /><div className="h-12 w-full bg-muted rounded" /><div className="h-5 w-4/5 bg-muted rounded" /><div className="h-64 bg-white border border-border rounded-2xl" /></div>}
        {!loading && missing && (
          <section className="mt-8 rounded-3xl bg-white border border-border p-10 text-center">
            <h1 className="text-2xl font-bold text-foreground">This guide is not available</h1>
            <p className="mt-3 text-muted-foreground">It may have been moved or is no longer published.</p>
            <Link href="/blog" className="inline-flex mt-6 text-primary font-semibold">Browse health guides</Link>
          </section>
        )}
        {!loading && article && (
          <article>
            <header className="mt-8">
              <div className="flex items-center gap-3 text-sm">
                <span className="rounded-full bg-teal-50 px-3 py-1.5 font-semibold text-teal-700">{article.topic}</span>
                <time className="inline-flex items-center gap-1.5 text-muted-foreground"><CalendarDays className="w-4 h-4" /> {formatDate(article.publishedAt)}</time>
              </div>
              <h1 className="mt-5 text-3xl md:text-5xl leading-tight font-bold tracking-tight text-foreground">{article.title}</h1>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">{article.excerpt}</p>
            </header>

            <div className="mt-10 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 flex gap-3 text-sm text-blue-950">
              <ShieldCheck className="w-5 h-5 shrink-0 text-primary mt-0.5" />
              <p><strong>Medical information notice:</strong> This guide is for general education. It cannot diagnose a condition or replace advice from a qualified healthcare professional.</p>
            </div>

            <div className="mt-10 space-y-8">
              {article.content.map((section, index) => (
                <section key={`${section.heading}-${index}`}>
                  <h2 className="text-2xl font-bold text-foreground">{section.heading}</h2>
                  {section.body.split(/\n{2,}/).map((paragraph, paragraphIndex) => (
                    <p key={paragraphIndex} className="mt-3 text-[1.03rem] leading-8 text-foreground/80">{paragraph}</p>
                  ))}
                </section>
              ))}
            </div>

            <section className="mt-12 rounded-3xl bg-[#0F2040] p-7 md:p-8 text-white">
              <Stethoscope className="w-8 h-8 text-teal-200" />
              <h2 className="mt-4 text-2xl font-bold">Looking for the right care?</h2>
              <p className="mt-2 text-sm leading-6 text-blue-100">Browse Medofile doctors and choose care based on specialty, language, location, and availability.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {article.relatedSpecializations.slice(0, 3).map((specialization) => (
                  <Link key={specialization} href={`/doctors?q=${encodeURIComponent(specialization)}`} className="rounded-xl bg-white/10 hover:bg-white/20 px-3 py-2 text-sm font-semibold transition-colors">
                    Find a {specialization}
                  </Link>
                ))}
                <Link href="/doctors" className="rounded-xl bg-teal-400 hover:bg-teal-300 text-[#08243e] px-3 py-2 text-sm font-bold transition-colors">Browse all doctors</Link>
              </div>
            </section>
            <div className="mt-6 flex flex-wrap gap-2">{article.keywords.map((keyword) => <span key={keyword} className="rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">#{keyword}</span>)}</div>
          </article>
        )}
      </main>
    </div>
  );
}