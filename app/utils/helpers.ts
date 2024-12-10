export const sleep = async (ms?: number) => {
  return await new Promise(resolve => setTimeout(resolve, ms));
};

export const getTechnologyMetas = (type: VueTrackerTechnology["type"], slug?: string) => {
  if (!slug) return undefined;
  const technology = [frameworks, modules, plugins, uis];
  const types = ["framework", "module", "plugin", "ui"] as const;
  const index = types.indexOf(type);
  const technologyType = technology[index];
  if (!technologyType) return undefined;
  const map = Object.fromEntries(Object.entries(technologyType).map(([key, { metas }]) => [metas.slug, { key, metas }]));
  return map[slug]?.metas || undefined;
};

export const onScreen = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  return (rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth);
};

export const hideImageOnError = (e: Event) => {
  if (import.meta.client) (e.target as HTMLImageElement).style.display = "none";
};

export const findFavicon = (icons?: VueTrackerSiteIcons[]) => {
  if (!icons?.length) return null;
  const favicon = icons.find(el => el.url.includes("/favicon.ico")) || icons[0];
  return favicon?.url;
};
