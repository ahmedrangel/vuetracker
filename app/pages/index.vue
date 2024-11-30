<script setup lang="ts">
const input = ref("");
const result = ref<VueTrackerResponse>();
const siteInfo = ref<{ title?: string, value?: string, img?: string }[]>();
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

watch(input, () => {
  if (input.value.startsWith("https://")) {
    input.value = input.value.replace("https://", "");
  }
});

const getTechnologyIcon = (type: VueTrackerTechnology["type"], slug?: string) => {
  if (!slug) return undefined;
  const technology = [frameworks, modules, plugins, uis];
  const types = ["framework", "module", "plugin", "ui"] as const;
  const index = types.indexOf(type);
  const technologyType = technology[index];
  if (!technologyType) return undefined;
  const map = Object.fromEntries(Object.entries(technologyType).map(([key, { metas }]) => [metas.slug, { key, metas }]));
  return map[slug]?.metas?.imgPath ? `/icons${map[slug].metas.imgPath}` : undefined;
};

const lookup = async () => {
  if (input.value) {
    result.value = await $fetch<VueTrackerResponse>("/api/lookup", { retry: 0, query: { url: `https://${input.value}` } });
    computedSiteModules.value = result.value.technologies;
    computedSitePlugins.value = result.value.technologies;
    const framework = computed(() => result.value?.technologies.find(el => el.type === "framework"));
    const ui = computed(() => result.value?.technologies.find(el => el.type === "ui"));
    if (result.value) {
      siteInfo.value = [{
        title: "Vue Version",
        value: result.value?.vueVersion,
        img: "/icons/vue.svg"
      },
      {
        title: framework.value?.version ? framework.value.name : "Framework",
        value: framework.value?.version ? framework.value.version : framework.value?.name,
        img: getTechnologyIcon("framework", framework.value?.slug)
      },
      {
        title: "UI Framework",
        value: ui.value?.name,
        img: getTechnologyIcon("ui", ui.value?.slug)
      },
      {
        title: "Rendering",
        value: result.value.hasSSR && !result.value.isStatic ? "Universal" : "Client-side"
      },
      {
        title: "Deployment",
        value: result.value.hasSSR && result.value.isStatic ? "Static" : result.value.hasSSR && !result.value.isStatic ? "Server" : undefined
      }];
    }
  }
};
</script>

<template>
  <main>
    <div class="py-5 sm:py-12 md:py-16 relative md:pb-24">
      <h1 class="text-4xl font-bold tracking-tight md:text-5xl text-balance mb-10"><span class="text-primary-600 dark:text-primary-400">Vue</span>Tracker</h1>
      <div class="2xl:w-1/2 xl:w-3/5 lg:w-3/4 flex flex-col mx-auto gap-10">
        <form @submit.prevent="lookup">
          <UButtonGroup size="xl" orientation="horizontal" class="w-full">
            <UInput v-model="input" class="w-full" :ui="{ leading: { padding: { xl: 'ps-[4.2rem] py-4' } } }">
              <template #leading>
                <span class="text-md text-gray-400">
                  https://
                </span>
              </template>
            </UInput>
            <UButton label="Lookup" class="md:px-10" type="submit" />
          </UButtonGroup>
        </form>
        <div v-if="result?.vueVersion" class="flex flex-col gap-5">
          <div class="flex flex-col gap-5">
            <div class="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold tracking-tight">
              <Icon name="fa6-solid:circle-info" size="2rem" />
              <p>INFO</p>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <template v-for="(info, i) of siteInfo" :key="i">
                <div v-if="info.value" class="flex flex-col w-full bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-800 rounded-xl overflow-hidden">
                  <h6 class="self-start bg-gray-300 dark:bg-gray-800 px-3 py-1 rounded-br-xl rounded-bl-none rounded-tr-none text-xs tracking-tight uppercase leading-sm font-bold">{{ info.title }}</h6>
                  <div class="flex justify-center items-center p-2 gap-1">
                    <img v-if="info.img" class="w-6 h-6" :src="info.img">
                    <p class="text-md font-bold tracking-tight">{{ info.value }}</p>
                  </div>
                </div>
              </template>
            </div>
            <div v-if="computedSitePlugins?.length" class="flex flex-col gap-5">
              <div class="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold tracking-tight">
                <Icon name="fa6-solid:plug" size="2rem" />
                <p>PLUGINS</p>
              </div>
              <div class="flex gap-4">
                <template v-for="(plugin, i) of computedSitePlugins" :key="i">
                  <div class="bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-800 rounded-xl overflow-hidden px-4 py-2">
                    <p class="text-md font-bold tracking-tight">{{ plugin.name }}</p>
                  </div>
                </template>
              </div>
            </div>
            <div v-if="computedSiteModules?.length" class="flex flex-col gap-5">
              <div class="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold tracking-tight">
                <Icon name="fa6-solid:cubes" size="2rem" />
                <p>NUXT MODULES</p>
              </div>
              <div class="flex gap-4">
                <template v-for="(module, i) of computedSiteModules" :key="i">
                  <div class="bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-800 rounded-xl overflow-hidden px-4 py-2">
                    <p class="text-md font-bold tracking-tight">{{ module.name }}</p>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
