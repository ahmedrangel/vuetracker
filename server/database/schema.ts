import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const sites = sqliteTable("sites", {
  slug: text().primaryKey(),
  url: text().notNull().unique(),
  hostname: text().notNull(),
  domain: text().notNull(),
  inputURL: text().notNull(),
  language: text(),
  title: text(),
  siteName: text(),
  description: text(),
  ogImage: text(),
  isAdultContent: integer().notNull().default(0),
  hasSSR: integer().notNull().default(0),
  isStatic: integer(),
  vueVersion: text().notNull(),
  createdAt: integer().notNull(),
  updatedAt: integer().notNull()
});

export const icons = sqliteTable("icons", {
  id: integer().primaryKey({ autoIncrement: true }),
  siteSlug: text().notNull().references(() => sites.slug, { onDelete: "cascade" }),
  url: text().notNull(),
  sizes: text()
}, table => [
  index("idx_icons_site_slug").on(table.siteSlug)
]);

export const technologies = sqliteTable("technologies", {
  id: integer().primaryKey({ autoIncrement: true }),
  siteSlug: text().notNull().references(() => sites.slug, { onDelete: "cascade" }),
  slug: text().notNull(),
  name: text().notNull(),
  type: text().notNull(),
  version: text()
}, table => [
  index("idx_technologies_site_slug").on(table.siteSlug)
]);
