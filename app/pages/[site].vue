<script setup lang="ts">
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
</script>

<template>
  <main>
    <div v-if="result" class="flex flex-col gap-5 2xl:w-1/2 xl:w-3/5 lg:w-3/4 mx-auto">
      <img v-if="result.ogImage" :src="result.ogImage" class="rounded-xl">
      <div class="tracking-tight flex gap-3 items-center bg-gray-200 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 p-3 rounded-xl transition">
        <div v-if="result.icons?.length">
          <div class="min-w-14 max-w-14 min-h-14 max-h-14">
            <img :src="result.icons[0]?.url" class="min-w-14 max-w-14 min-h-14 max-h-14">
          </div>
        </div>
        <div class="text-left">
          <h5 v-if="result.title" class="text-sm"><b>Title:</b> {{ result.title }}</h5>
          <h5 v-if="result.description" class="text-sm"><b>Description:</b> {{ result.description }}</h5>
          <h5 class="text-sm">
            <b>SITE: </b>
            <NuxtLink target="_blank" class="underline" :to="result.url">{{ result.url }}</NuxtLink>
          </h5>
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
    </div>
  </main>
</template>
