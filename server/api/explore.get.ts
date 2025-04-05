export default defineEventHandler(async () => {
  const DB = useDB();
  const results = await DB.select({
    slug: tables.sites.slug,
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
    .groupBy(tables.sites.slug)
    .orderBy(desc(tables.sites.createdAt)).all();

  return results.map(row => ({
    ...row,
    icons: JSON.parse(row.icons).filter((el: { url: string }) => el.url),
    technologies: JSON.parse(row.technologies).filter((el: { slug: string }) => el.slug)
  }));
});
