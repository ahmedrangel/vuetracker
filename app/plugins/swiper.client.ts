import Swiper from "swiper";
import { Autoplay, EffectCoverflow, Navigation } from "swiper/modules";

declare module "#app" {
  interface NuxtApp {
    $Swiper: typeof Swiper;
  }
}

export default defineNuxtPlugin(() => {
  return {
    provide: {
      Swiper,
      SwiperModules: {
        Autoplay,
        EffectCoverflow,
        Navigation
      }
    }
  };
});
