import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, BookOpen, CalendarDays, HeartPulse, Stethoscope } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useBlogSeo } from "@/lib/blogSeo";

type Article = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  topic: string;
  keywords: string[];
  publishedAt: string | null;
};

function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value))
    : "Today";
}

export default function BlogIndex() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useBlogSeo(
    "Health guides for everyday care",
    "Practical, medically cautious health guides from Medofile to help you understand symptoms, preventive care, and when to see a doctor.",
    "/blog",
  );

  useEffect(() => {
    let active = true;
    fetch("/api/blog")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load articles");
        return response.json() as Promise<{ data: Article[] }>;
      })
      .then((result) => active && setArticles(result.data))
      .catch(() => active && setError("Health guides are temporarily unavailable. Please try again shortly."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <header className="overflow-hidden bg-gradient-to-br from-[#0F2040] via-[#0A56B7] to-[#00A996] text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20 grid md:grid-cols-[1fr_0.8fr] gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-sm font-semibold">
              <HeartPulse className="w-4 h-4 text-teal-200" /> Medofile Health Guides
            </span>
            <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Clear health information for your everyday care.
            </h1>
            <p className="mt-5 max-w-xl text-base md:text-lg text-blue-50 leading-7">
              Fresh, practical guidance to help you prepare for care and know when it’s time to speak with a qualified doctor.
            </p>
          </div>
          <div className="rounded-3xl bg-white/10 border border-white/20 p-7 backdrop-blur-sm">
            <BookOpen className="w-10 h-10 text-teal-200" />
            <h2 className="mt-5 text-xl font-bold">New guidance, published daily</h2>
            <p className="mt-2 text-sm leading-6 text-blue-50">
              Our guides are general education, not a diagnosis or a substitute for personal medical advice.
            </p>
            <Link href="/doctors" className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-white hover:text-teal-100">
              Find a doctor on Medofile <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between gap-4 mb-7">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">Latest articles</p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">Read the newest health guides</h2>
          </div>
          <span className="hidden sm:inline-flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="w-4 h-4" /> Updated daily</span>
        </div>

        {loading && <div className="grid md:grid-cols-3 gap-5">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-72 rounded-2xl bg-white border border-border animate-pulse" />)}</div>}
        {!loading && error && <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-red-800">{error}</div>}
        {!loading && !error && articles.length === 0 && (
          <div className="rounded-3xl bg-white border border-border p-10 text-center">
            <Stethoscope className="w-10 h-10 text-primary mx-auto" />
            <h2 className="mt-4 font-bold text-xl text-foreground">The first guide is on its way</h2>
            <p className="mt-2 text-muted-foreground">Please check back soon for Medofile’s first daily health guide.</p>
          </div>
        )}
        {!loading && !error && articles.length > 0 && (
          <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" aria-label="Published health articles">
            {articles.map((article) => (
              <article key={article.id} className="group flex flex-col rounded-2xl bg-white border border-border p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="rounded-full bg-teal-50 px-2.5 py-1 font-semibold text-teal-700">{article.topic}</span>
                  <time className="text-muted-foreground">{formatDate(article.publishedAt)}</time>
                </div>
                <h2 className="mt-5 text-xl leading-7 font-bold text-foreground group-hover:text-primary transition-colors">{article.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground flex-1">{article.excerpt}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {article.keywords.slice(0, 3).map((keyword) => <span key={keyword} className="text-xs text-muted-foreground">#{keyword.replace(/\s+/g, "")}</span>)}
                </div>
                <Link href={`/blog/${article.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80">
                  Read health guide <ArrowRight className="w-4 h-4" />
                </Link>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}