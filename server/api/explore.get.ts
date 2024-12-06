import type { SQL } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const { framework, ui, sort, order, vueOnly, page, includeAdult } = getQuery(event) as Record<string, string>;
  const DB = useDB();
  const dbSort = sort === "updated" ? tables.sites.updatedAt : tables.sites.createdAt;
  const dbOrder = order === "asc" ? asc(dbSort) : desc(dbSort);
  const pageSize = 24;
  const currentPage = parseInt(page || "1", 10);
  const offset = (currentPage - 1) * pageSize;
  const conditions: SQL[] = [];

  if (vueOnly === "1") {
    conditions.push(notExists(
      DB.select().from(tables.technologies)
        .where(
          and(
            eq(tables.technologies.siteSlug, tables.sites.slug),
            eq(tables.technologies.type, "framework")
          )
        )
    ));
  }
  if (framework) {
    conditions.push(exists(
      DB.select().from(tables.technologies)
        .where(
          and(
            eq(tables.technologies.siteSlug, tables.sites.slug),
            eq(tables.technologies.slug, framework),
            eq(tables.technologies.type, "framework")
          )
        )
    ));
  }
  if (ui) {
    conditions.push(exists(
      DB.select().from(tables.technologies)
        .where(
          and(
            eq(tables.technologies.siteSlug, tables.sites.slug),
            eq(tables.technologies.slug, ui),
            eq(tables.technologies.type, "ui")
          )
        )
    ));
  }
  if (includeAdult !== "1") conditions.push(eq(tables.sites.isAdultContent, 0));

  const results = await DB.select({
    url: tables.sites.url,
    hostname: tables.sites.hostname,
    title: tables.sites.title,
    ogImage: tables.sites.ogImage,
    createdAt: tables.sites.createdAt,
    updatedAt: tables.sites.updatedAt,
    icons: sql<string>`json_group_array(DISTINCT JSON_OBJECT('url', ${tables.icons.url}, 'sizes', ${tables.icons.sizes}))`.as("icons"),
    technologies: sql<string>`json_group_array(DISTINCT JSON_OBJECT('slug', ${tables.technologies.slug}, 'type', ${tables.technologies.type}))`.as("technologies")
  })
    .from(tables.sites)
    .leftJoin(tables.icons, eq(tables.sites.slug, tables.icons.siteSlug))
    .leftJoin(tables.technologies, eq(tables.sites.slug, tables.technologies.siteSlug))
    .where(and(...conditions))
    .groupBy(tables.sites.slug)
    .orderBy(dbOrder)
    .limit(pageSize).offset(offset).all();

  const totalResultCount = await DB.select({ count: count(tables.sites.slug) })
    .from(tables.sites)
    .where(and(...conditions)).get();

  return {
    pageInfo: {
      currentPage,
      limit: pageSize,
      hasNextPage: totalResultCount?.count ? currentPage < Math.ceil(totalResultCount?.count / pageSize) : false,
      totalPages: totalResultCount?.count ? Math.ceil(totalResultCount.count / pageSize) : 1,
      totalRecords: totalResultCount?.count || 0
    },
    data: results.map(row => ({
      ...row,
      icons: row.icons ? JSON.parse(row.icons).filter((el: { url: string }) => el.url) : [],
      technologies: row.technologies ? JSON.parse(row.technologies).filter((el: { slug: string }) => el.slug) : []
    }))
  };
});
