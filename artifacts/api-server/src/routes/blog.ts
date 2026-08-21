import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { blogArticles, blogSettings } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdminAuth } from "../middleware/auth.js";
import {
  generateDailyBlogArticle,
  getBlogSettingsSummary,
} from "../services/blogPublisher.js";

const router: IRouter = Router();

function limitFrom(value: unknown, defaultValue = 12): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(50, Math.max(1, Math.floor(parsed))) : defaultValue;
}

router.get("/blog", async (req, res): Promise<void> => {
  try {
    const limit = limitFrom(req.query.limit);
    const offset = Math.max(0, Number(req.query.offset) || 0);
    const published = await db
      .select()
      .from(blogArticles)
      .where(eq(blogArticles.status, "published"))
      .orderBy(desc(blogArticles.publishedAt), desc(blogArticles.id))
      .limit(limit)
      .offset(offset);
    res.json({ data: published, meta: { limit, offset, hasMore: published.length === limit } });
  } catch {
    res.status(500).json({ error: "Unable to load health articles" });
  }
});

router.get("/blog/:slug", async (req, res): Promise<void> => {
  try {
    const [article] = await db
      .select()
      .from(blogArticles)
      .where(eq(blogArticles.slug, req.params.slug))
      .limit(1);
    if (!article || article.status !== "published") {
      res.status(404).json({ error: "Article not found" });
      return;
    }
    res.json(article);
  } catch {
    res.status(500).json({ error: "Unable to load this article" });
  }
});

router.get("/admin/blog", requireAdminAuth, async (_req, res): Promise<void> => {
  try {
    const [articles, summary] = await Promise.all([
      db.select().from(blogArticles).orderBy(desc(blogArticles.createdAt)).limit(60),
      getBlogSettingsSummary(),
    ]);
    res.json({ articles, ...summary });
  } catch {
    res.status(500).json({ error: "Unable to load blog administration" });
  }
});

router.put("/admin/blog/settings", requireAdminAuth, async (req, res): Promise<void> => {
  if (typeof req.body?.autoPublish !== "boolean") {
    res.status(400).json({ error: "autoPublish must be true or false" });
    return;
  }
  try {
    const summary = await getBlogSettingsSummary();
    const [settings] = await db
      .update(blogSettings)
      .set({ autoPublish: req.body.autoPublish, updatedAt: new Date() })
      .where(eq(blogSettings.id, summary.settings.id))
      .returning();
    res.json(settings);
  } catch {
    res.status(500).json({ error: "Unable to update automation settings" });
  }
});

router.post("/admin/blog/generate", requireAdminAuth, async (_req, res): Promise<void> => {
  try {
    const result = await generateDailyBlogArticle({ forceDraft: true });
    res.status(result.created ? 201 : 200).json(result);
  } catch {
    res.status(502).json({ error: "Article generation did not complete. The issue was recorded in the blog log." });
  }
});

router.post("/admin/blog/:id/publish", requireAdminAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid article id" });
    return;
  }
  const [article] = await db
    .update(blogArticles)
    .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(blogArticles.id, id))
    .returning();
  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  res.json(article);
});

router.post("/admin/blog/:id/unpublish", requireAdminAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid article id" });
    return;
  }
  const [article] = await db
    .update(blogArticles)
    .set({ status: "draft", publishedAt: null, updatedAt: new Date() })
    .where(eq(blogArticles.id, id))
    .returning();
  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  res.json(article);
});

export default router;