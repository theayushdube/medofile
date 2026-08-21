import { db } from "@workspace/db";
import {
  type BlogSection,
  blogArticles,
  blogGenerationLogs,
  blogGenerationRuns,
  blogSettings,
} from "@workspace/db/schema";
import { and, desc, eq, lt, or } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { createHash } from "node:crypto";
import { logger } from "../lib/logger.js";

const TOPICS = [
  "Understanding high blood pressure: everyday habits that support heart health",
  "When a persistent headache needs medical attention",
  "Healthy ways to prepare for a routine health check-up",
  "Managing seasonal allergies while knowing when to seek care",
  "How to support better sleep with practical daily routines",
  "Early conversations about joint pain and mobility",
  "A family guide to common childhood fever questions",
  "Skin care basics and signs that deserve a dermatologist visit",
  "Making sense of blood sugar screening and lifestyle support",
  "Digestive health: when common discomfort should be checked",
  "Women’s preventive health appointments: what to expect",
  "Eye strain, screen habits, and when to book an eye examination",
  "Mental wellbeing: recognising when professional support can help",
  "Dental check-ups and everyday oral-health habits",
];

type GeneratedArticle = {
  title: string;
  excerpt: string;
  topic: string;
  seoDescription: string;
  keywords: string[];
  relatedSpecializations: string[];
  sections: BlogSection[];
};

function indiaDate(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (kind: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === kind)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 72);
}

function parseGeneratedArticle(value: string): GeneratedArticle {
  const source = value.replace(/^```json\s*|\s*```$/g, "").trim();
  const parsed = JSON.parse(source) as GeneratedArticle;
  if (
    !parsed.title ||
    !parsed.excerpt ||
    !parsed.seoDescription ||
    !Array.isArray(parsed.sections) ||
    parsed.sections.length < 3
  ) {
    throw new Error("The generated article did not have the required structure");
  }
  return {
    title: parsed.title.trim().slice(0, 110),
    excerpt: parsed.excerpt.trim().slice(0, 320),
    topic: parsed.topic?.trim().slice(0, 100) || "Everyday health",
    seoDescription: parsed.seoDescription.trim().slice(0, 165),
    keywords: Array.isArray(parsed.keywords)
      ? parsed.keywords.map((item) => String(item).trim()).filter(Boolean).slice(0, 8)
      : [],
    relatedSpecializations: Array.isArray(parsed.relatedSpecializations)
      ? parsed.relatedSpecializations.map((item) => String(item).trim()).filter(Boolean).slice(0, 3)
      : [],
    sections: parsed.sections
      .map((section) => ({
        heading: String(section.heading ?? "").trim().slice(0, 100),
        body: String(section.body ?? "").trim().slice(0, 1500),
      }))
      .filter((section) => section.heading && section.body)
      .slice(0, 6),
  };
}

async function getSettings() {
  const [existing] = await db.select().from(blogSettings).orderBy(blogSettings.id).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(blogSettings).values({}).returning();
  return created;
}

function articleText(article: Pick<GeneratedArticle, "title" | "excerpt" | "sections">): string {
  return [article.title, article.excerpt, ...article.sections.flatMap((section) => [section.heading, section.body])]
    .join(" ")
    .toLowerCase();
}

function tokenSet(value: string): Set<string> {
  return new Set(value.match(/[a-z]{3,}/g) ?? []);
}

function similarity(a: string, b: string): number {
  const left = tokenSet(a);
  const right = tokenSet(b);
  if (!left.size || !right.size) return 0;
  let overlap = 0;
  for (const token of left) if (right.has(token)) overlap += 1;
  return overlap / (left.size + right.size - overlap);
}

function validateGeneratedArticle(article: GeneratedArticle): void {
  const text = articleText(article);
  if (!/\bgeneral information\b/i.test(text) || !/\bnot a diagnos/i.test(text)) {
    throw new Error("The generated article is missing its required medical-information notice");
  }
  if (/\b(you have|this is definitely|guaranteed cure|stop taking|start taking)\b/i.test(text)) {
    throw new Error("The generated article includes prohibited diagnostic or medication language");
  }
  if (/\b\d+\s*(mg|ml|tablets?|capsules?)\b/i.test(text)) {
    throw new Error("The generated article includes medication dosing language");
  }
}

async function generateArticle(topicSeed: string, recentTitles: string[]): Promise<GeneratedArticle> {
  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    max_completion_tokens: 1800,
    messages: [
      {
        role: "system",
        content:
          "You write original, patient-friendly health education for Medofile in India. " +
          "Never diagnose, prescribe, quote unverifiable statistics, promise outcomes, or copy a known source. " +
          "Use calm, medically cautious language such as 'may' and 'can'. Include a clear prompt to seek urgent help for emergency symptoms when relevant. " +
          "Return valid JSON only, no markdown. The JSON shape is: " +
          '{"title":"", "excerpt":"", "topic":"", "seoDescription":"", "keywords":[""], "relatedSpecializations":[""], "sections":[{"heading":"", "body":""}]}. ' +
          "Write 4 or 5 sections. Keep total body under 900 words. The final section must explain when to book a qualified doctor and must say the article is general information, not a diagnosis. " +
          `Avoid repeating these recently used titles: ${recentTitles.join(" | ") || "None yet"}.`,
      },
      {
        role: "user",
        content: `Create today’s original Medofile article using this approved topic direction: ${topicSeed}`,
      },
    ],
  });
  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("No article content was returned by the generation service");
  }
  return parseGeneratedArticle(content);
}

async function claimDailyGeneration(date: string): Promise<boolean> {
  const [inserted] = await db
    .insert(blogGenerationRuns)
    .values({ generationDate: date, state: "processing", attemptCount: 1, lockedAt: new Date(), updatedAt: new Date() })
    .onConflictDoNothing()
    .returning();
  if (inserted) return true;

  const [existing] = await db
    .select()
    .from(blogGenerationRuns)
    .where(eq(blogGenerationRuns.generationDate, date))
    .limit(1);
  if (!existing || existing.state === "success") return false;

  const staleBefore = new Date(Date.now() - 20 * 60 * 1000);
  const [reclaimed] = await db
    .update(blogGenerationRuns)
    .set({
      state: "processing",
      attemptCount: existing.attemptCount + 1,
      errorMessage: null,
      lockedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(blogGenerationRuns.id, existing.id),
        or(
          eq(blogGenerationRuns.state, "failed"),
          and(eq(blogGenerationRuns.state, "processing"), lt(blogGenerationRuns.lockedAt, staleBefore)),
        ),
      ),
    )
    .returning();
  return Boolean(reclaimed);
}

export async function generateDailyBlogArticle(options: { forceDraft?: boolean } = {}) {
  const date = indiaDate();
  const settings = await getSettings();
  const [existing] = await db
    .select()
    .from(blogArticles)
    .where(eq(blogArticles.generationDate, date))
    .limit(1);
  if (existing) {
    if (settings.lastCheckedDate !== date) {
      await db.update(blogSettings).set({ lastCheckedDate: date, updatedAt: new Date() }).where(eq(blogSettings.id, settings.id));
    }
    return { article: existing, created: false };
  }
  if (!(await claimDailyGeneration(date))) return { article: null, created: false };

  const topicSeed = TOPICS[settings.topicCursor % TOPICS.length]!;

  try {
    const recent = await db
      .select({ title: blogArticles.title, excerpt: blogArticles.excerpt, content: blogArticles.content })
      .from(blogArticles)
      .orderBy(desc(blogArticles.createdAt))
      .limit(40);
    const recentTitles = recent.map((article) => article.title);
    let generated: GeneratedArticle | null = null;
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const candidate = await generateArticle(topicSeed, recentTitles);
        validateGeneratedArticle(candidate);
        const candidateText = articleText(candidate);
        const isDuplicate = recent.some((article) =>
          similarity(candidate.title, article.title) > 0.88 ||
          similarity(candidateText, [article.title, article.excerpt, JSON.stringify(article.content)].join(" ")) > 0.82,
        );
        if (isDuplicate) throw new Error("The generated article was too similar to existing Medofile content");
        generated = candidate;
        break;
      } catch (error) {
        lastError = error;
      }
    }
    if (!generated) throw lastError instanceof Error ? lastError : new Error("Unable to generate a safe original article");

    const status = settings.autoPublish && !options.forceDraft ? "published" : "draft";
    const slug = `${slugify(generated.title) || "health-guide"}-${date.replaceAll("-", "")}`;
    const [article] = await db
      .insert(blogArticles)
      .values({
        slug,
        title: generated.title,
        excerpt: generated.excerpt,
        topic: generated.topic,
        seoDescription: generated.seoDescription,
        keywords: generated.keywords,
        content: generated.sections,
        relatedSpecializations: generated.relatedSpecializations,
        status,
        generationDate: date,
        publishedAt: status === "published" ? new Date() : null,
      })
      .returning();

    await db.insert(blogGenerationLogs).values({
      generationDate: date,
      topic: topicSeed,
      status: "success",
      articleId: article!.id,
    });
    await db
      .update(blogSettings)
      .set({ topicCursor: settings.topicCursor + 1, lastCheckedDate: date, updatedAt: new Date() })
      .where(eq(blogSettings.id, settings.id));
    await db
      .update(blogGenerationRuns)
      .set({ state: "success", articleId: article!.id, updatedAt: new Date() })
      .where(eq(blogGenerationRuns.generationDate, date));
    return { article: article!, created: true };
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "Unknown generation error";
    await db.insert(blogGenerationLogs).values({
      generationDate: date,
      topic: topicSeed,
      status: "failed",
      errorMessage: message,
    });
    await db
      .update(blogGenerationRuns)
      .set({ state: "failed", errorMessage: message, updatedAt: new Date() })
      .where(eq(blogGenerationRuns.generationDate, date));
    logger.error({ err: error, date, topic: topicSeed }, "Daily blog generation failed");
    throw error;
  }
}

export async function getBlogSettingsSummary() {
  const settings = await getSettings();
  const logs = await db.select().from(blogGenerationLogs).orderBy(desc(blogGenerationLogs.createdAt)).limit(12);
  return {
    settings,
    nextTopic: TOPICS[settings.topicCursor % TOPICS.length],
    logs,
  };
}

let schedulerStarted = false;

export function startBlogScheduler(): void {
  if (schedulerStarted) return;
  schedulerStarted = true;

  const check = async () => {
    try {
      const settings = await getSettings();
      const today = indiaDate();
      if (settings.autoPublish && settings.lastCheckedDate !== today) {
        await generateDailyBlogArticle();
      }
    } catch (error) {
      logger.error({ err: error }, "Blog scheduler check failed");
    }
  };

  void check();
  setInterval(() => void check(), 60 * 60 * 1000).unref();
}