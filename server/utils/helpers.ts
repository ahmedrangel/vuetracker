export const fetchVueTrackerProxy = async (url: string) => {
  console.info("Fetching data from proxy");
  const config = useRuntimeConfig();
  const result = await $fetch<VueTrackerProxyResponse>(config.analyzer.proxyURL, {
    retry: 0,
    query: { url }
  }).catch((e) => {
    console.info(e);
    throw createError({
      statusCode: ErrorCode.INTERNAL_SERVER_ERROR,
      statusMessage: e.data?.error || "An error occurred while analyzing, please try again later"
    });
  });
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
