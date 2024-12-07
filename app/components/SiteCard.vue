<script setup lang="ts">
defineProps<{
  site: VueTrackerResponse;
}>();
</script>

<template>
  <div class="flex flex-col bg-gray-200 dark:bg-gray-900 rounded overflow-hidden">
    <div class="relative h-[100px] sm:h-[160px] md:h-[140px] lg:h-[140px] xl:h-[180px]">
      <img v-if="site.ogImage" :src="site.ogImage" class="absolute object-cover h-full w-full" :title="site.title || normalizeSITE(site.url)">
      <div v-else class="absolute flex items-center justify-center h-full w-full bg-gray-300 dark:bg-gray-800" title="No OG Image">
        <Icon name="ph:image" size="2em" />
      </div>
    </div>
    <div class="flex flex-wrap gap-2 items-center justify-between p-2">
      <NuxtLink :to="`/${normalizeSITE(site.url)}`" class="hover:underline truncate">
        <div class="flex gap-1 items-center">
          <img v-if="site.icons?.length" :src="site.icons[0]?.url" class="max-w-4 max-h-4 min-w-4 min-h-4">
          <h4 class="text-xs xl:text-sm font-semibold truncate">/{{ normalizeSITE(site.url) }}</h4>
        </div>
      </NuxtLink>
      <div class="flex gap-1 items-center">
        <ClientOnly>
          <UTooltip v-if="!site.technologies.some(el => el.type === 'framework')" :text="vue.name" :popper="{ placement: 'top', arrow: true }">
            <span :title="vue.name">
              <Icon :name="'vuetracker:vue'" width="1.2em" height="1.2em" />
            </span>
          </UTooltip>
          <template v-for="(tech, j) of toRaw(site.technologies)" :key="j">
            <UTooltip v-if="getTechnologyMetas(tech.type, tech.slug)?.icon" :text="getTechnologyMetas(tech.type, tech.slug)?.name" :popper="{ placement: 'top', arrow: true }">
              <span :title="getTechnologyMetas(tech.type, tech.slug)?.name">
                <Icon :name="'vuetracker:' + getTechnologyMetas(tech.type, tech.slug)?.icon" width="1.2em" height="1.2em" />
              </span>
            </UTooltip>
          </template>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>
