<script setup lang="ts">
import { format } from "date-fns";

defineProps<{
  result: VueTrackerResponse;
  siteInfo?: { title: string, value?: string, icon?: string | null, url?: string }[];
  sitePlugins?: VueTrackerTechnology[];
  siteModules?: VueTrackerTechnology[];
}>();
</script>

<template>
  <div class="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold tracking-tight">
    <Icon name="fa6-solid:circle-info" size="2rem" />
    <p>INFO</p>
  </div>
  <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
    <template v-for="(info, i) of siteInfo" :key="i">
      <template v-if="info.value">
        <NuxtLink v-if="info.url" target="_blank" :to="info.url">
          <TechCard v-ripple :title="info.title" :icon="info.icon" :value="info.value" class="hover:bg-gray-100 hover:dark:bg-gray-900" />
        </NuxtLink>
        <TechCard v-else :title="info.title" :icon="info.icon" :value="info.value" />
      </template>
    </template>
  </div>
  <div v-if="sitePlugins?.length" class="flex flex-col gap-5">
    <div class="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold tracking-tight">
      <Icon name="fa6-solid:plug" size="2rem" />
      <p>PLUGINS</p>
    </div>
    <div class="flex flex-wrap items-start gap-2">
      <template v-for="(tech, i) of sitePlugins" :key="i">
        <NuxtLink v-if="getTechnologyMetas('plugin', tech.slug)?.url" target="_blank" :to="getTechnologyMetas('plugin', tech.slug)?.url">
          <TechCardBasic v-ripple :value="tech.name" class="hover:bg-gray-100 hover:dark:bg-gray-900" />
        </NuxtLink>
        <TechCardBasic v-else :value="tech.name" />
      </template>
    </div>
  </div>
  <div v-if="siteModules?.length" class="flex flex-col gap-5">
    <div class="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold tracking-tight">
      <Icon name="fa6-solid:cubes" size="2rem" />
      <p>NUXT MODULES</p>
    </div>
    <div class="flex flex-wrap items-start gap-2">
      <template v-for="(tech, i) of siteModules" :key="i">
        <NuxtLink v-if="getTechnologyMetas('module', tech.slug)?.url" target="_blank" :to="getTechnologyMetas('module', tech.slug)?.url">
          <TechCardBasic v-ripple :value="tech.name" class="hover:bg-gray-100 hover:dark:bg-gray-900" />
        </NuxtLink>
        <TechCardBasic v-else :value="tech.name" />
      </template>
    </div>
  </div>
  <h5 class="text-sm text-start text-gray-500 dark:text-gray-400">Last updated: {{ format(result.updatedAt, "Pp") }}</h5>
</template>
