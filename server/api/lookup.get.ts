export default defineCachedEventHandler(async (event) => {
  const { url } = getQuery(event) as { url: string };
  const config = useRuntimeConfig();
  const result = await $fetch<VueTrackerResponse>(config.analyzer.proxy, {
    query: { url }
  }).catch(() => null);
  if (!result) {
    throw createError({
      statusCode: ErrorCode.INTERNAL_SERVER_ERROR,
      statusMessage: 'An error occurred while analyzing, please try again later'
    });
  }
  return result;
});
