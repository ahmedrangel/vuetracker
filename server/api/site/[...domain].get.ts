export default defineEventHandler(async (event) => {
  const { domain } = getRouterParams(event);

  const site = await db.select({
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
    updatedAt: tables.sites.updatedAt
  }).from(tables.sites)
    .where(or(eq(tables.sites.url, `https://${domain}/`), eq(tables.sites.url, `https://${domain}`)))
    .get();

  if (!site) {
    throw createError({
      statusCode: ErrorCode.NOT_FOUND,
      statusMessage: "Site not found"
    });
  }

  const [icons, technologies] = await Promise.all([
    db.select({
      url: tables.icons.url,
      sizes: tables.icons.sizes
    }).from(tables.icons).where(eq(tables.icons.siteSlug, site.slug)).all() as unknown as VueTrackerSiteIcons[],
    db.select({
      slug: tables.technologies.slug,
      name: tables.technologies.name,
      type: tables.technologies.type,
      version: tables.technologies.version
    }).from(tables.technologies).where(eq(tables.technologies.siteSlug, site.slug)).all() as unknown as VueTrackerTechnology[]
  ]);

  return {
    ...site,
    icons,
    technologies
  };
});
