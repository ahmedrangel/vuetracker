import { parseURL } from "ufo";

const maxAge = 1 * 60 * 60 * 24 * 1000; // 1 day

export default defineCachedEventHandler(async (event) => {
  const rawURL = getQuery(event)?.url as string;

  const regex = /^(https?:\/\/)?[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}(:\d+)?(\/[^\s]*)?$/;
  if (!regex.test(rawURL)) {
    throw createError({
      statusCode: ErrorCode.BAD_REQUEST,
      statusMessage: "Invalid URL"
    });
  }

  const { protocol, host } = parseURL(rawURL);
  const url = protocol + "//" + host;

  const redirectedURL = (await $fetch.raw(url, {
    retry: 0,
    headers: { "User-Agent": "VueTracker/1.0 (Cloudflare Workers); https://vuetracker.nuxt.dev" }
  }).catch(() => null))?.url;

  const parsedURL = parseURL(redirectedURL || url)!;
  const finalURL = `${parsedURL.protocol}//${parsedURL.host}${parsedURL.pathname || ""}`;
  const siteSlug = normalizeSITE(finalURL)?.replaceAll(".", "-").replaceAll("/", "_");
  const now = Date.now();
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
    console.info("Site not found in database");
    const [result] = await Promise.all<VueTrackerProxyResponse>([
      fetchVueTrackerProxy(url),
      DB.delete(tables.sites).where(eq(tables.sites.slug, siteSlug)).run()
    ]);
    const site = await DB.insert(tables.sites).values({
      slug: siteSlug,
      url: result.url,
      hostname: result.hostname,
      domain: result.domain,
      language: result.meta?.language,
      title: result.meta?.title,
      siteName: result.meta?.siteName,
      description: result.meta?.description,
      ogImage: result.meta?.ogImage,
      isAdultContent: Number(result.meta?.isAdultContent),
      hasSSR: Number(result.hasSSR),
      isStatic: Number(result.isStatic),
      vueVersion: result.vueVersion,
      createdAt: now,
      updatedAt: now
    }).returning().get();
    if (!site) {
      throw createError({
        statusCode: ErrorCode.INTERNAL_SERVER_ERROR,
        statusMessage: "An error occurred while analyzing, please try again later"
      });
    }

    const { icons, technologies } = await handleSiteDataInsertion(result, siteSlug);
    return {
      ...site,
      icons,
      technologies
    };
  }

  // Site found in DB but outdated
  if (site.slug && site.updatedAt < now - maxAge) {
    console.info("Site outdated, updating");
    const [result] = await Promise.all<VueTrackerProxyResponse>([
      fetchVueTrackerProxy(url),
      DB.delete(tables.technologies).where(eq(tables.technologies.siteSlug, site.slug)).run(),
      DB.delete(tables.icons).where(eq(tables.icons.siteSlug, site.slug)).run()
    ]);

    const updatedSite = await DB.update(tables.sites).set({
      url: result.url,
      hostname: result.hostname,
      domain: result.domain,
      language: result.meta?.language,
      title: result.meta?.title,
      siteName: result.meta?.siteName,
      description: result.meta?.description,
      ogImage: result.meta?.ogImage,
      isAdultContent: Number(result.meta?.isAdultContent),
      hasSSR: Number(result.hasSSR),
      isStatic: Number(result.isStatic),
      vueVersion: result.vueVersion,
      updatedAt: now
    }).where(eq(tables.sites.slug, site.slug)).returning().get();

    const { icons, technologies } = await handleSiteDataInsertion(result, siteSlug);
    return {
      ...updatedSite,
      icons,
      technologies
    };
  }

  console.info("Site found in database and is not expired");
  return site;
}, {
  swr: false,
  maxAge: 7200, // Browser cache 2 h
  group: "api",
  name: "lookup",
  getKey: event => (getQuery(event)?.url as string)?.replace(/[-.]/g, "_"),
  shouldInvalidateCache: async (event) => {
    const cacheKey = (getQuery(event)?.url as string)?.replace(/[-.]/g, "_");
    const body = await getCachedItemBody(`api:lookup:${cacheKey}.json`);
    const invalidate = body && !body?.slug;
    return shouldInvalidateCacheByConditionHandler(event, invalidate);
  }
});
