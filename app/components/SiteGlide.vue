<script setup lang="ts">
const props = defineProps<{
  sites: VueTrackerResponse[];
}>();

const filteredSites = useState("preview-array", () => props.sites.filter(site => site.ogImage).toSorted(() => Math.random() - 0.5).slice(0, 20));

const { $Glide } = useNuxtApp();
onMounted(() => {
  new $Glide(".glide", {
    type: "carousel",
    perView: 1,
    peek: 400,
    focusAt: "center",
    gap: 0,
    breakpoints: {
      1536: { peek: 250 },
      975: { peek: 100 },
      640: { peek: 40 },
      400: { peek: 30 }
    }
    // autoplay: 4000
  }).mount();
});

onBeforeUnmount(() => {
  clearNuxtState("preview-array");
});
</script>

<template>
  <div class="glide">
    <div class="glide__track rounded" data-glide-el="track">
      <ul class="glide__slides">
        <li v-for="(site, i) of filteredSites" :key="i" class="glide__slide">
          <SiteCard :site="site" img-class="h-[180px] sm:h-[280px] md:h-[300px] lg:h-[340px] xl:h-[350px]" />
        </li>
      </ul>
    </div>
    <div class="glide__arrows" data-glide-el="controls">
      <span class="glide__arrow glide__arrow--left absolute left-0 md:left-[5%] lg:left-[10%] top-[45%]" role="button" data-glide-dir="<">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
        </svg>
      </span>
      <span class="glide__arrow glide__arrow--right absolute right-0 md:right-[5%] lg:right-[10%] top-[45%]" role="button" data-glide-dir=">">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
        </svg>
      </span>
    </div>
  </div>
</template>

<style scoped>
.glide__slide {
  transition: transform 0.2s ease-in-out;
}

.glide__slide:not(.glide__slide--active) {
  opacity: 0.5;
  transform: scale(0.9);
  pointer-events: none;
}
</style>
