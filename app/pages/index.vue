<script setup lang="ts">
const input = ref("");
const result = ref<VueTrackerResponse>();
const siteInfo = ref<{ title: string, value?: string, img?: string | null, url?: string }[]>();
const sitePlugins = ref<VueTrackerResponse["technologies"]>();
const siteModules = ref<VueTrackerResponse["technologies"]>();
const loading = ref(false);
const error = ref<string>();

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

const lookup = async () => {
  if (input.value) {
    loading.value = true;
    error.value = undefined;
    result.value = undefined;
    result.value = await $fetch<VueTrackerResponse>("/api/lookup", {
      retry: 0,
      query: { url: `https://${input.value}` }
    }).catch((e) => {
      error.value = e.data?.message || e.message;
      loading.value = false;
      return undefined;
    });

    if (!result.value) return;

    computedSiteModules.value = result.value.technologies;
    computedSitePlugins.value = result.value.technologies;
    const framework = computed(() => result.value?.technologies.find(el => el.type === "framework"));
    const ui = computed(() => result.value?.technologies.find(el => el.type === "ui"));
    if (result.value) {
      siteInfo.value = [{
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
        value: result.value.hasSSR && !result.value.isStatic ? "Universal" : "Client-side"
      },
      {
        title: "Deployment",
        value: result.value.hasSSR && result.value.isStatic ? "Static" : result.value.hasSSR && !result.value.isStatic ? "Server" : undefined
      }];
    }
  }
  loading.value = false;
};
</script>

<template>
  <main>
    <div class="pt-5 sm:pt-8 md:pt-8 relative">
      <h1 class="text-4xl font-bold tracking-tight md:text-5xl text-balance mb-10"><span class="text-primary-600 dark:text-primary-400">Vue</span>Tracker</h1>
      <div class="2xl:w-1/2 xl:w-3/5 lg:w-3/4 flex flex-col mx-auto gap-5">
        <form @submit.prevent="lookup">
          <UButtonGroup size="xl" orientation="horizontal" class="w-full">
            <UInput v-model="input" class="w-full" :ui="{ leading: { padding: { xl: 'ps-[4.2rem] py-4' } } }">
              <template #leading>
                <span class="text-md text-gray-400">https://</span>
              </template>
            </UInput>
            <UButton v-ripple class="md:px-10 w-20 sm:w-36 relative justify-center" type="submit" :disabled="loading">
              <div v-if="!loading" class="absolute">
                <span class="hidden sm:block">Lookup</span>
                <Icon name="ph:magnifying-glass-duotone" class="sm:hidden block text-2xl" />
              </div>
              <LoadingSpinner v-else class="absolute" />
            </UButton>
          </UButtonGroup>
        </form>
        <div id="results" class="relative">
          <TransitionGroup name="fadeel">
            <div v-if="result && !error && !loading" class="flex flex-col gap-5">
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
            <div v-else-if="!result && error && !loading" class="text-rose-600 dark:text-rose-400">{{ error }}</div>
            <LoadingDots v-else-if="!result && !error && loading" />
          </TransitionGroup>
        </div>
      </div>
    </div>
  </main>
</template>
