<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { fixOgImage } from "~/utils/helpers";

const props = defineProps<{
  site: VueTrackerResponse;
  imgClass?: HTMLAttributes["class"];
}>();

const order = ["framework", "ui", "plugin", "module"];
const sortedTechnologies = computed(() => props.site.technologies.toSorted((a, b) => {
  return order.indexOf(a.type) - order.indexOf(b.type);
}));

const ogImageErrored = ref(false);
const ogImage = ref<string | undefined>(fixOgImage(props.site?.hostname, props.site?.ogImage));
const faviconErrored = ref(false);
const favicon = ref<string>(findFavicon(props.site.icons) || `https://${props.site.hostname}/favicon.ico`);
const faviconFallbackErrored = ref(false);
const faviconFallback = ref<string>(`https://${props.site.hostname}/favicon.ico`);
onBeforeMount(() => {
  const ogImg = new Image();
  const faviconImg = new Image();
  const faviconFallbackImg = new Image();
  faviconImg.src = favicon.value;
  if (ogImage.value) {
    ogImg.src = ogImage.value;
    ogImg.onerror = () => {
      ogImageErrored.value = true;
    };
  }
  faviconImg.onerror = () => {
    faviconErrored.value = true;
    faviconFallbackImg.src = faviconFallback.value;
  };
  faviconFallbackImg.onerror = () => {
    faviconFallbackErrored.value = true;
    faviconFallback.value = `https://www.google.com/s2/favicons?domain=${props.site.hostname}`;
  };
});
</script>

<template>
  <NuxtLink :to="`/${normalizeSITE(site.url)}`">
    <div class="flex flex-col bg-neutral-200 dark:bg-neutral-900 rounded overflow-hidden">
      <div class="relative" :class="`${imgClass ? imgClass : 'h-[100px] sm:h-[160px] md:h-[140px] lg:h-[140px] xl:h-[180px]'}`">
        <!-- eslint-disable vue/no-mutating-props -->
        <img v-if="site.ogImage && !ogImageErrored" :src="ogImage" class="absolute object-cover h-full w-full" :title="site.title || normalizeSITE(site.url)" :alt="site.title || normalizeSITE(site.url)" loading="lazy">
        <div v-else class="absolute flex items-center justify-center h-full w-full bg-neutral-300 dark:bg-neutral-800 gap-2 px-2 md:px-4" :title="site.title || normalizeSITE(site.url)" :alt="site.title || normalizeSITE(site.url)">
          <img v-if="!faviconErrored" :src="favicon" class="max-w-4 max-h-4 min-w-4 min-h-4" loading="lazy">
          <img v-if="faviconErrored" :src="faviconFallback" class="max-w-4 max-h-4 min-w-4 min-h-4" loading="lazy">
          <small class="truncate">{{ site.title || normalizeSITE(site.url) }}</small>
        </div>
      </div>
      <div class="flex flex-wrap gap-2 items-center justify-between p-2">
        <div class="hover:underline truncate site-link">
          <div class="flex gap-1 items-center">
            <img v-if="!faviconErrored" :src="favicon" class="max-w-4 max-h-4 min-w-4 min-h-4" loading="lazy">
            <img v-if="faviconErrored" :src="faviconFallback" class="max-w-4 max-h-4 min-w-4 min-h-4" loading="lazy">
            <h4 class="text-xs xl:text-sm font-semibold truncate">/{{ normalizeSITE(site.url) }}</h4>
          </div>
        </div>
        <div class="flex gap-1 items-center">
          <UTooltip v-if="!site.technologies.some(el => el.type === 'framework')" :text="vue.name" :content="{ side: 'top' }" arrow>
            <span :title="vue.name">
              <Icon :name="'vuetracker:vue'" width="1.2em" height="1.2em" />
            </span>
          </UTooltip>
          <template v-for="(tech, j) of sortedTechnologies" :key="j">
            <UTooltip v-if="getTechnologyMetas(tech.type, tech.slug)?.icon" :text="getTechnologyMetas(tech.type, tech.slug)?.name" :content="{ side: 'top' }" arrow>
              <span :title="getTechnologyMetas(tech.type, tech.slug)?.name">
                <Icon :name="'vuetracker:' + getTechnologyMetas(tech.type, tech.slug)?.icon" width="1.2em" height="1.2em" />
              </span>
            </UTooltip>
          </template>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
a:hover .site-link {
  text-decoration: underline;
}
</style>
