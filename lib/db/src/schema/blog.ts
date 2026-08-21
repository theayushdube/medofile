import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export type BlogSection = {
  heading: string;
  body: string;
};

export const blogArticles = pgTable(
  "blog_articles",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    topic: text("topic").notNull(),
    seoDescription: text("seo_description").notNull(),
    keywords: jsonb("keywords").notNull().default([]).$type<string[]>(),
    content: jsonb("content").notNull().default([]).$type<BlogSection[]>(),
    relatedSpecializations: jsonb("related_specializations")
      .notNull()
      .default([])
      .$type<string[]>(),
    status: text("status").notNull().default("draft"),
    generationDate: date("generation_date", { mode: "string" }).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("blog_articles_slug_unique").on(table.slug),
    uniqueIndex("blog_articles_generation_date_unique").on(table.generationDate),
    index("blog_articles_status_published_idx").on(table.status, table.publishedAt),
  ],
);

export const blogSettings = pgTable("blog_settings", {
  id: serial("id").primaryKey(),
  autoPublish: boolean("auto_publish").notNull().default(true),
  topicCursor: integer("topic_cursor").notNull().default(0),
  lastCheckedDate: date("last_checked_date", { mode: "string" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const blogGenerationLogs = pgTable(
  "blog_generation_logs",
  {
    id: serial("id").primaryKey(),
    generationDate: date("generation_date", { mode: "string" }).notNull(),
    topic: text("topic").notNull(),
    status: text("status").notNull(),
    articleId: integer("article_id"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("blog_generation_logs_date_idx").on(table.generationDate)],
);

export const blogGenerationRuns = pgTable(
  "blog_generation_runs",
  {
    id: serial("id").primaryKey(),
    generationDate: date("generation_date", { mode: "string" }).notNull(),
    state: text("state").notNull().default("processing"),
    attemptCount: integer("attempt_count").notNull().default(1),
    articleId: integer("article_id"),
    errorMessage: text("error_message"),
    lockedAt: timestamp("locked_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("blog_generation_runs_date_unique").on(table.generationDate)],
);

export type BlogArticle = typeof blogArticles.$inferSelect;
export const insertBlogArticleSchema = createInsertSchema(blogArticles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBlogArticle = z.infer<typeof insertBlogArticleSchema>;