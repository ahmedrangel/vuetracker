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
    headers: { "User-Agent": "VueTracker/1.0 (Cloudflare Workers; +vuetracker.pages.dev)" }
  }).catch(() => null))?.url;
  const parsedURL = parseURL(redirectedURL || url)!;
  const finalURL = `${parsedURL.protocol}//${parsedURL.host}${parsedURL.pathname || ""}`;
  const siteSlug = normalizeSITE(finalURL)?.replaceAll(".", "-").replaceAll("/", "_");
  const now = Date.now();
  const DB = useDB();

  const site = await selectSite(eq(tables.sites.slug, siteSlug));

  if (!site.slug) {
    console.info("Site not found in database");
    const [result] = await Promise.all<VueTrackerProxyResponse>([
      fetchVueTrackerProxy(finalURL),
      DB.delete(tables.sites).where(eq(tables.sites.slug, siteSlug)).run()
    ]);
    const parsedResultURL = parseURL(result.url);
    const siteURL = `${parsedResultURL.protocol}//${parsedResultURL.host}${parsedResultURL.pathname}`;
    const site = await DB.insert(tables.sites).values({
      slug: siteSlug,
      url: siteURL,
      hostname: result.hostname,
      domain: result.domain,
      inputURL: rawURL,
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
    }).onConflictDoNothing().returning().get();
    if (site) {
      const { icons, technologies } = await handleSiteDataInsertion(result, siteSlug);
      return {
        ...site,
        icons,
        technologies
      };
    }
    const conflictedSite = await selectSite(eq(tables.sites.url, siteURL));
    if (!conflictedSite) {
      throw createError({
        statusCode: ErrorCode.NOT_FOUND,
        statusMessage: "Site not found"
      });
    }
    return conflictedSite;
  }

  // Site found in DB but outdated
  if (site.slug && site.updatedAt < now - maxAge) {
    console.info("Site outdated, updating");
    const [result] = await Promise.all<VueTrackerProxyResponse>([
      fetchVueTrackerProxy(finalURL),
      DB.delete(tables.technologies).where(eq(tables.technologies.siteSlug, site.slug)).run(),
      DB.delete(tables.icons).where(eq(tables.icons.siteSlug, site.slug)).run()
    ]);

    const parsedResultURL = parseURL(result.url);
    const siteURL = `${parsedResultURL.protocol}//${parsedResultURL.host}${parsedResultURL.pathname}`;
    const updatedSite = await DB.update(tables.sites).set({
      url: siteURL,
      hostname: result.hostname,
      domain: result.domain,
      inputURL: rawURL,
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
    }).where(or(eq(tables.sites.slug, site.slug), eq(tables.sites.url, siteURL))).returning().get();

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
  maxAge: 3600, // Browser/KV cache 1 h
  group: "api",
  name: "lookup",
  getKey: event => normalizeSITE((getQuery(event)?.url as string))?.replace(/[-./]/g, "_")
});
