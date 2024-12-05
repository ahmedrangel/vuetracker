import { technologies } from "../database/schema";

export default defineEventHandler(async (event) => {
  const { framework, ui, sort, order, vueOnly } = getQuery(event) as Record<string, string>;
  const DB = useDB();
  const dbSort = sort === "updated" ? tables.sites.updatedAt : tables.sites.createdAt;
  const dbOrder = order === "asc" ? asc(dbSort) : desc(dbSort);
  const filters = [];

  if (framework) filters.push(eq(tables.technologies.slug, framework));
  if (ui) filters.push(eq(tables.technologies.slug, ui));

  const results = await DB.select({
    url: tables.sites.url,
    hostname: tables.sites.hostname,
    title: tables.sites.title,
    ogImage: tables.sites.ogImage,
    createdAt: tables.sites.createdAt,
    updatedAt: tables.sites.updatedAt,
    icons: sql`GROUP_CONCAT(DISTINCT JSON_OBJECT('url', ${tables.icons.url}, 'sizes', ${tables.icons.sizes}))`.as("icons"),
    technologies: sql`GROUP_CONCAT(DISTINCT JSON_OBJECT('slug', ${technologies.slug}, 'type', ${technologies.type}))`.as("technologies")
  })
    .from(tables.sites)
    .leftJoin(tables.icons, eq(tables.sites.slug, tables.icons.siteSlug))
    .leftJoin(tables.technologies, eq(tables.sites.slug, tables.technologies.siteSlug))
    .where(
      vueOnly === "1" ? notExists(
        DB.select()
          .from(tables.technologies)
          .where(
            and(
              eq(tables.technologies.siteSlug, tables.sites.slug),
              eq(tables.technologies.type, "framework")
            )
          )
      ) : and(
        framework ? exists(
          DB.select()
            .from(tables.technologies)
            .where(
              and(
                eq(tables.technologies.siteSlug, tables.sites.slug),
                eq(tables.technologies.slug, framework),
                eq(tables.technologies.type, "framework")
              )
            )
        ) : undefined,
        ui ? exists(
          DB.select()
            .from(tables.technologies)
            .where(
              and(
                eq(tables.technologies.siteSlug, tables.sites.slug),
                eq(tables.technologies.slug, ui),
                eq(tables.technologies.type, "ui")
              )
            )
        ) : undefined
      )
    )
    .groupBy(tables.sites.slug)
    .orderBy(dbOrder)
    .limit(30).all();
  return results.map(row => ({
    ...row,
    icons: row.icons ? JSON.parse(`[${row.icons}]`).filter((el: { url: string }) => el.url) : [],
    technologies: row.technologies ? JSON.parse(`[${row.technologies}]`).filter((el: { slug: string }) => el.slug) : []
  }));
});
