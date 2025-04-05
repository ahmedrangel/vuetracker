export { withQuery, parseURL } from "ufo";

export const normalizeSITE = (url: string) => {
  return url.replace("https://", "").replace(/\/$/, "");
};
