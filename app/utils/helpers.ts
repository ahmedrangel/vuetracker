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

export const findFavicon = (icons?: VueTrackerSiteIcons[]) => {
  if (!icons?.length) return null;
  const favicon = icons.find(el => el.url.includes("/favicon.ico")) || icons[0];
  return favicon?.url;
};

export const fixOgImage = (hostname?: string, url?: string | null) => {
  if (!url || !hostname) return undefined;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `https://${hostname}${url}`;
  return url;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const cachedData: Record<string, Ref<any>> = ({});

export const useCachedData = <T = any>(key: string, getValue?: () => T): Ref<T> => {
  const isFunction = typeof getValue === "function";

  if (!cachedData[key]) {
    cachedData[key] = ref(isFunction ? getValue() : undefined);
  }
  else if (isFunction) {
    cachedData[key].value = getValue();
  }

  return cachedData[key];
};

export const setupCachedData = <T>(key: string): T => {
  const cachedData = useCachedData(key);

  if (cachedData.value) {
    return cachedData.value;
  }

  const { data } = useNuxtData(key);

  if (data.value) {
    useCachedData(key, () => data.value);
  }
  else {
    watch(data, (newData) => {
      useCachedData(key, () => newData);
    });
  }
  return data.value;
};
