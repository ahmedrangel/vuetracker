import { parseURL } from "ufo";

const cacheGroup = "lookup";
const cacheName = "site";

export default defineCachedEventHandler(async (event) => {
  const { url } = getQuery(event) as { url: string };
  const config = useRuntimeConfig();
  const result = await $fetch<VueTrackerResponse>(config.analyzer.proxyURL, {
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
}, {
  maxAge: 12 * 60 * 60,
  swr: true,
  group: cacheGroup,
  name: cacheName,
  getKey: (event) => {
    const { url } = getQuery(event) as { url: string };
    const key = parseURL(url).host;
    if (!key) {
      throw createError({
        statusCode: ErrorCode.BAD_REQUEST,
        statusMessage: "Invalid URL"
      });
    }
    return key.replace("www.", "");
  }
});
