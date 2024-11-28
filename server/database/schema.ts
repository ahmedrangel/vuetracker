import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const sites = sqliteTable("sites", {
  id: integer().primaryKey({ autoIncrement: true }),
  url: text().notNull(),
  hostname: text().notNull(),
  domain: text().notNull(),
  language: text(),
  title: text(),
  siteName: text(),
  description: text(),
  isAdultContent: integer().notNull().default(0),
  hasSSR: integer().notNull().default(0),
  isStatic: integer().notNull().default(1),
  vueVersion: text().notNull(),
  createdAt: integer().notNull(),
  updatedAt: integer().notNull()
});

export const icons = sqliteTable("icons", {
  id: integer().primaryKey({ autoIncrement: true }),
  siteId: integer().notNull().references(() => sites.id),
  url: text().notNull(),
  sizes: text()
});

export const technologies = sqliteTable("technologies", {
  id: integer().primaryKey({ autoIncrement: true }),
  siteId: integer().notNull().references(() => sites.id),
  name: text().notNull(),
  slug: text().notNull(),
  imgPath: text(),
  url: text().notNull(),
  type: text().notNull(),
  version: text()
});
