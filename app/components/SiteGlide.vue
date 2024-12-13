<script setup lang="ts">
const props = defineProps<{
  sites: VueTrackerResponse[];
}>();

const filteredSites = useState("preview-array", () => props.sites.filter(site => site.ogImage).toSorted(() => Math.random() - 0.5).slice(0, 30));

onMounted(() => {
  const { $Swiper, $SwiperModules } = useNuxtApp();
  const { Autoplay, EffectCoverflow } = $SwiperModules;
  new $Swiper(".swiper", {
    slidesPerView: 1.1,
    centeredSlides: true,
    grabCursor: true,
    loop: true,
    effect: "coverflow",
    coverflowEffect: {
      rotate: 50,
      stretch: 0,
      depth: 300,
      modifier: 1,
      slideShadows: true
    },
    speed: 500,
    breakpoints: {
      1536: { slidesPerView: 2 },
      975: { slidesPerView: 1.8 },
      640: { slidesPerView: 1.5 },
      400: { slidesPerView: 1.2 }
    },
    modules: [Autoplay, EffectCoverflow]
  });
});

onBeforeUnmount(() => {
  clearNuxtState("preview-array");
});
</script>

<template>
  <div class="swiper">
    <div class="swiper-wrapper">
      <div v-for="(site, i) of filteredSites" :key="i" class="swiper-slide">
        <SiteCard class="site-card" :site="site" img-class="h-[190px] sm:h-[280px] md:h-[300px] lg:h-[340px] xl:h-[350px]" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.swiper-slide .site-card {
  transition: opacity .5s ease-in-out!important;
}

.swiper-slide:not(.swiper-slide-active) .site-card {
  opacity: 0.6;
  pointer-events: none;
}
</style>
