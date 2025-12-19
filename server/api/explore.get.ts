export default defineEventHandler(async () => {
  const [sites, icons, technologies] = await Promise.all([
    db.select({
      slug: tables.sites.slug,
      url: tables.sites.url,
      hostname: tables.sites.hostname,
      title: tables.sites.title,
      ogImage: tables.sites.ogImage,
      createdAt: tables.sites.createdAt,
      updatedAt: tables.sites.updatedAt
    }).from(tables.sites).groupBy(tables.sites.slug).orderBy(desc(tables.sites.createdAt)).all(),
    db.select({
      siteSlug: tables.icons.siteSlug,
      url: tables.icons.url,
      sizes: tables.icons.sizes
    }).from(tables.icons).all(),
    db.select({
      siteSlug: tables.technologies.siteSlug,
      slug: tables.technologies.slug,
      type: tables.technologies.type
    }).from(tables.technologies).all()
  ]);

  return sites.map(site => ({
    ...site,
    icons: icons.filter(icon => icon.siteSlug === site.slug),
    technologies: technologies.filter(tech => tech.siteSlug === site.slug)
  }));
});
