export default defineEventHandler(async () => {
  const routeRules = [] as { loc: string, lastmod: string }[];
  const DB = useDB();
  const sites = await DB.select({
    url: tables.sites.url
  }).from(tables.sites).all();
  routeRules.push({ loc: "/explore", lastmod: new Date().toISOString() });

  for (const site of sites) {
    routeRules.push({ loc: normalizeSITE(site.url), lastmod: new Date().toISOString() });
  }
  return routeRules;
});
