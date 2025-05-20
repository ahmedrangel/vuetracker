export default defineEventHandler(async () => {
  const routeRules = [] as { loc: string, lastmod: string }[];
  const DB = useDB();
  const sites = await DB.select({
    url: tables.sites.url,
    updatedAt: tables.sites.updatedAt,
  }).from(tables.sites).all();
  routeRules.push({ loc: "/explore", lastmod: new Date().toISOString() });

  for (const site of sites) {
    routeRules.push({ loc: normalizeSITE(site.url), lastmod: new Date(site.updatedAt).toISOString() });
  }
  return routeRules;
});
