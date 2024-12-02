<script setup lang="ts">
import { format } from "date-fns";

const { params } = useRoute("site");
const { site } = params;

const { data: result, error } = await useFetch<VueTrackerResponse>(`/api/site/${site}`);
if (error.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Site not found"
  });
}

const sitePlugins = ref<VueTrackerResponse["technologies"]>();
const siteModules = ref<VueTrackerResponse["technologies"]>();

const computedSitePlugins = computed({
  get: () => result.value?.technologies.filter(el => el.type === "plugin"),
  set: value => sitePlugins.value = value?.filter(el => el.type === "plugin")
});
const computedSiteModules = computed({
  get: () => result.value?.technologies.filter(el => el.type === "module"),
  set: value => siteModules.value = value?.filter(el => el.type === "module")
});

const getTechnologyMetas = (type: VueTrackerTechnology["type"], slug?: string) => {
  if (!slug) return undefined;
  const technology = [frameworks, modules, plugins, uis];
  const types = ["framework", "module", "plugin", "ui"] as const;
  const index = types.indexOf(type);
  const technologyType = technology[index];
  if (!technologyType) return undefined;
  const map = Object.fromEntries(Object.entries(technologyType).map(([key, { metas }]) => [metas.slug, { key, metas }]));
  return map[slug]?.metas || undefined;
};

const framework = computed(() => result.value?.technologies.find(el => el.type === "framework"));
const ui = computed(() => result.value?.technologies.find(el => el.type === "ui"));
const siteInfo = ref([{
  title: "Vue Version",
  value: result.value?.vueVersion,
  img: vue.imgPath,
  url: vue.url
},
{
  title: framework.value?.version ? framework.value.name : "Framework",
  value: framework.value?.version ? framework.value.version : framework.value?.name,
  img: getTechnologyMetas("framework", framework.value?.slug)?.imgPath,
  url: getTechnologyMetas("framework", framework.value?.slug)?.url

},
{
  title: "UI Framework",
  value: ui.value?.name,
  img: getTechnologyMetas("ui", ui.value?.slug)?.imgPath,
  url: getTechnologyMetas("ui", ui.value?.slug)?.url
},
{
  title: "Rendering",
  value: result.value?.hasSSR && !result.value.isStatic ? "Universal" : "Client-side"
},
{
  title: "Deployment",
  value: result.value?.hasSSR && result.value.isStatic ? "Static" : result.value?.hasSSR && !result.value.isStatic ? "Server" : undefined
}]);

useSeoMeta({
  title: `${site} | VueTracker`,
  ogTitle: `${site} | VueTracker`,
  description: result.value?.description,
  ogDescription: result.value?.description
});

useHead({
  link: [
    { rel: "canonical", href: `${SITE.url}${site}` }
  ]
});
</script>

<template>
  <main>
    <div v-if="result" class="flex flex-col gap-6 2xl:w-1/2 xl:w-3/5 lg:w-3/4 mx-auto py-2 sm:py-3 md:py-4">
      <div class="tracking-tight flex flex-col gap-1">
        <div class="flex gap-2 items-center justify-center">
          <img v-if="result.icons?.length" :src="result.icons[0]?.url" class="min-w-6 max-w-6 min-h-6 max-h-6">
          <NuxtLink target="_blank" :to="result.url">
            <h2 class="text-xl font-semibold hover:underline">{{ site }}</h2>
          </NuxtLink>
        </div>
        <h4 class="text-md">{{ result.title }}</h4>
      </div>
      <img v-if="result.ogImage" :src="result.ogImage" class="rounded-xl">
      <div class="tracking-tight flex gap-3 items-center rounded-xl transition">
        <div class="text-left flex flex-col gap-1">
          <h2 v-if="result.description" class="text-xl text-start">{{ result.siteName }}</h2>
          <h5 v-if="result.description" class="text-sm text-start">{{ result.description }}</h5>
        </div>
      </div>
      <div class="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold tracking-tight">
        <Icon name="fa6-solid:circle-info" size="2rem" />
        <p>INFO</p>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <template v-for="(info, i) of siteInfo" :key="i">
          <template v-if="info.value">
            <NuxtLink v-if="info.url" target="_blank" :to="info.url">
              <TechCard v-ripple :title="info.title" :img="info.img" :value="info.value" class="hover:bg-gray-100 hover:dark:bg-gray-900" />
            </NuxtLink>
            <TechCard v-else :title="info.title" :img="info.img" :value="info.value" />
          </template>
        </template>
      </div>
      <div v-if="computedSitePlugins?.length" class="flex flex-col gap-5">
        <div class="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold tracking-tight">
          <Icon name="fa6-solid:plug" size="2rem" />
          <p>PLUGINS</p>
        </div>
        <div class="flex flex-wrap items-start gap-2">
          <template v-for="(tech, i) of computedSitePlugins" :key="i">
            <NuxtLink v-if="getTechnologyMetas('plugin', tech.slug)?.url" target="_blank" :to="getTechnologyMetas('plugin', tech.slug)?.url">
              <TechCardBasic v-ripple :value="tech.name" class="hover:bg-gray-100 hover:dark:bg-gray-900" />
            </NuxtLink>
            <TechCardBasic v-else :value="tech.name" />
          </template>
        </div>
      </div>
      <div v-if="computedSiteModules?.length" class="flex flex-col gap-5">
        <div class="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold tracking-tight">
          <Icon name="fa6-solid:cubes" size="2rem" />
          <p>NUXT MODULES</p>
        </div>
        <div class="flex flex-wrap items-start gap-2">
          <template v-for="(tech, i) of computedSiteModules" :key="i">
            <NuxtLink v-if="getTechnologyMetas('module', tech.slug)?.url" target="_blank" :to="getTechnologyMetas('module', tech.slug)?.url">
              <TechCardBasic v-ripple :value="tech.name" class="hover:bg-gray-100 hover:dark:bg-gray-900" />
            </NuxtLink>
            <TechCardBasic v-else :value="tech.name" />
          </template>
        </div>
      </div>
      <h5 class="text-sm text-start text-gray-500 dark:text-gray-400">Last updated: {{ format(result.updatedAt, "Pp") }}</h5>
    </div>
  </main>
</template>
