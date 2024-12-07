export const normalizeSITE = (url: string) => {
  return url.replace("https://", "").slice(0, -1);
};
