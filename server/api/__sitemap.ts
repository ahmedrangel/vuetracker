export default defineEventHandler(async () => {
  const routeRules = [] as { loc: string, lastmod: string }[];
  const DB = useDB();
  const sites = await DB.select({
    hostname: tables.sites.hostname
  }).from(tables.sites).all();
  routeRules.push({ loc: "/explore", lastmod: new Date().toISOString() });

  for (const site of sites) {
    routeRules.push({ loc: site.hostname, lastmod: new Date().toISOString() });
  }
  return routeRules;
});
