<script setup lang="ts">
import type { HTMLAttributes } from "vue";

const props = defineProps<{
  site: VueTrackerResponse;
  imgClass?: HTMLAttributes["class"];
}>();

const order = ["framework", "ui", "plugin", "module"];
const sortedTechnologies = computed(() => props.site.technologies.toSorted((a, b) => {
  return order.indexOf(a.type) - order.indexOf(b.type);
}));
</script>

<template>
  <div class="flex flex-col bg-neutral-200 dark:bg-neutral-900 rounded overflow-hidden">
    <div class="relative" :class="`${imgClass ? imgClass : 'h-[100px] sm:h-[160px] md:h-[140px] lg:h-[140px] xl:h-[180px]'}`">
      <!-- eslint-disable vue/no-mutating-props -->
      <img v-if="site.ogImage && !site.ogImageLoadError" :src="site.ogImage.startsWith('/') ? `https://${site.hostname}${site.ogImage}` : site.ogImage" class="absolute object-cover h-full w-full" :title="site.title || normalizeSITE(site.url)" :alt="site.title || normalizeSITE(site.url)" loading="lazy" @error="site.ogImageLoadError = true" @load="site.ogImageLoadError = false">
      <div v-else class="absolute flex items-center justify-center h-full w-full bg-neutral-300 dark:bg-neutral-800" title="No OG Image">
        <Icon name="ph:image" size="2em" />
      </div>
    </div>
    <div class="flex flex-wrap gap-2 items-center justify-between p-2">
      <NuxtLink :to="`/${normalizeSITE(site.url)}`" class="hover:underline truncate">
        <div class="flex gap-1 items-center">
          <!-- eslint-disable vue/no-mutating-props -->
          <img v-if="!site.faviconLoadError" :src="findFavicon(site.icons) || `https://${site.hostname}/favicon.ico`" class="max-w-4 max-h-4 min-w-4 min-h-4" loading="lazy" @error="site.faviconLoadError = true" @load="site.faviconLoadError = false">
          <h4 class="text-xs xl:text-sm font-semibold truncate">/{{ normalizeSITE(site.url) }}</h4>
        </div>
      </NuxtLink>
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
</template>
