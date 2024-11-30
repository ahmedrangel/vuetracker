import type { H3Event } from "h3";

export const fetchVueTrackerProxy = async (url: string) => {
  console.info("Fetching data from proxy");
  const config = useRuntimeConfig();
  const result = await $fetch<VueTrackerProxyResponse>(config.analyzer.proxyURL, {
    query: { url }
  }).catch((e) => {
    console.info(e);
    return null;
  });
  if (!result) {
    throw createError({
      statusCode: ErrorCode.INTERNAL_SERVER_ERROR,
      statusMessage: "An error occurred while analyzing, please try again later"
    });
  }
  return result;
};

export const handleSiteDataInsertion = async (result: VueTrackerProxyResponse, siteSlug: string) => {
  const technologies = [], icons = [];
  const DB = useDB();
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
  if (result.meta?.icons?.length) {
    const iconsToInsert = result.meta.icons.map((icon) => {
      return { siteSlug, url: icon.url, sizes: icon.sizes };
    });
    icons.push(...iconsToInsert);
  }

  await Promise.all([
    technologies.length ? DB.insert(tables.technologies).values(technologies).returning({ slug: tables.technologies.slug, name: tables.technologies.name, type: tables.technologies.type, version: tables.technologies.version }).run() : null,
    icons.length ? DB.insert(tables.icons).values(icons).returning({ url: tables.icons.url, sizes: tables.icons.sizes }).run() : null
  ]);

  return { icons, technologies };
};

export const shouldInvalidateCacheByConditionHandler = (event: H3Event, invalidate: boolean) => {
  if (!invalidate) return invalidate;
  console.info("Cache invalidated due to not matching required properties!");
  event.node.res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  event.node.res.setHeader("Pragma", "no-cache");
  event.node.res.setHeader("Expires", "0");
  event.node.res.setHeader("Surrogate-Control", "no-store");
  const uniqueId = Date.now().toString();
  event.node.res.setHeader("X-Response-ID", uniqueId);
  return invalidate;
};

export const getCachedItemBody = async (itemKey: string) => {
  const storage = useStorage("cache");
  const cache = await storage.getItem(itemKey.replace(/-/g, "")) as CacheEntry<{ body: unknown }>;
  return cache?.value?.body;
};
