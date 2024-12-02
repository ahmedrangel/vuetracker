export default defineEventHandler(async (event) => {
  const { host } = getRouterParams(event);
  const siteSlug = host?.replaceAll(".", "-");
  const DB = useDB();

  const site = await DB.select({
    slug: tables.sites.slug,
    url: tables.sites.url,
    hostname: tables.sites.hostname,
    domain: tables.sites.domain,
    language: tables.sites.language,
    title: tables.sites.title,
    siteName: tables.sites.siteName,
    description: tables.sites.description,
    ogImage: tables.sites.ogImage,
    isAdultContent: tables.sites.isAdultContent,
    hasSSR: tables.sites.hasSSR,
    isStatic: tables.sites.isStatic,
    vueVersion: tables.sites.vueVersion,
    createdAt: tables.sites.createdAt,
    updatedAt: tables.sites.updatedAt,
    icons: sql`json_group_array(DISTINCT json_object( 'url', ${tables.icons.url}, 'sizes', ${tables.icons.sizes})) FILTER (WHERE ${tables.icons.id} IS NOT NULL)`.as("icons"),
    technologies: sql`json_group_array(DISTINCT json_object('slug', ${tables.technologies.slug}, 'name', ${tables.technologies.name}, 'type', ${tables.technologies.type}, 'version', ${tables.technologies.version})) FILTER (WHERE ${tables.technologies.id} IS NOT NULL)`.as("technologies")
  }).from(tables.sites)
    .where(eq(tables.sites.slug, siteSlug))
    .leftJoin(tables.icons, eq(tables.icons.siteSlug, tables.sites.slug))
    .leftJoin(tables.technologies, eq(tables.technologies.siteSlug, tables.sites.slug))
    .get() as unknown as VueTrackerRawResponse;

  const parsedIcons = site.icons ? JSON.parse(site.icons) : [];
  const parsedTechnologies = site.technologies ? JSON.parse(site.technologies) : [];
  site.icons = parsedIcons;
  site.technologies = parsedTechnologies;

  if (!site.slug) {
    throw createError({
      statusCode: ErrorCode.NOT_FOUND,
      statusMessage: "Site not found"
    });
  }

  return site;
});
