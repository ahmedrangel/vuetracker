import Glide from "@glidejs/glide";

declare module "#app" {
  interface NuxtApp {
    $Glide: typeof Glide;
  }
}

export default defineNuxtPlugin(() => {
  return {
    provide: { Glide }
  };
});
