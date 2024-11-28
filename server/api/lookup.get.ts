export default defineCachedEventHandler(async (event) => {
  const { url } = getQuery(event) as { url: string };
  const config = useRuntimeConfig();
  const result = await $fetch<VueTrackerResponse>(config.analyzer.proxy, {
    query: { url }
  }).catch(() => null);
  return result;
});
