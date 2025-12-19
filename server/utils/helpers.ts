import type { SQL } from "drizzle-orm";

export const fetchVueTrackerProxy = async (url: string) => {
  console.info("Fetching data from proxy");
  const config = useRuntimeConfig();
  const result = await $fetch<VueTrackerProxyResponse>(`${config.analyzer.proxyURL}/analyze`, {
    retry: 0,
    query: { url }
  }).catch(async (e) => {
    const { error } = e.data;
    // Cause 4 = vue not detected
    if (error?.cause?.code === 4) {
      await db.delete(tables.sites).where(eq(tables.sites.url, url)).run();
    }
    throw createError({
      statusCode: ErrorCode.INTERNAL_SERVER_ERROR,
      statusMessage: error?.message || error || "An error occurred while analyzing, please try again later"
    });
  });
  return result;
};

export const handleSiteDataInsertion = async (result: VueTrackerProxyResponse, siteSlug: string) => {
  const technologies = [], icons = [];
  if (result.framework) {
    technologies.push({
      slug: result.framework.slug,
      name: result.framework.name,
      siteSlug,
      type: "framework",
      version: result.framework?.version || null
    });
  }
  if (result.frameworkModules?.length) {
    const modulesToInsert = result.frameworkModules.map((frameworkModule) => {
      return { slug: frameworkModule.slug, name: frameworkModule.name, siteSlug, type: "module" };
    });
    technologies.push(...modulesToInsert);
  }
  if (result.plugins?.length) {
    const pluginsToInsert = result.plugins.map((plugin) => {
      return { slug: plugin.slug, name: plugin.name, siteSlug, type: "plugin" };
    });
    technologies.push(...pluginsToInsert);
  }
  if (result.ui) {
    technologies.push({ slug: result.ui.slug, name: result.ui.name, siteSlug, type: "ui" });
  }
  if (result.server) {
    technologies.push({ slug: result.server.slug, name: result.server.name, siteSlug, type: "server" });
  }
  if (result.meta?.icons?.length) {
    const iconsToInsert = result.meta.icons.map((icon) => {
      return { siteSlug, url: icon.url, sizes: icon.sizes };
    });
    icons.push(...iconsToInsert);
  }

  await Promise.all([
    technologies.length ? db.insert(tables.technologies).values(technologies).returning({ slug: tables.technologies.slug, name: tables.technologies.name, type: tables.technologies.type, version: tables.technologies.version }).run() : null,
    icons.length ? db.insert(tables.icons).values(icons).returning({ url: tables.icons.url, sizes: tables.icons.sizes }).run() : null
  ]);

  return { icons, technologies };
};

export const selectSite = async (condition: SQL<unknown>) => {
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
    .where(condition)
    .get() as unknown as VueTrackerResponse;

  if (!site) return;

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
};
