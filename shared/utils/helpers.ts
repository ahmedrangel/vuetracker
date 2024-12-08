export const normalizeSITE = (url: string) => {
  return url.replace("https://", "").replace(/\/$/, "");
};
