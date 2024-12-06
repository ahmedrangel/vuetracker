<script setup lang="ts">
const input = ref("");
const result = ref<VueTrackerResponse>();
const siteInfo = ref<{ title: string, value?: string, icon?: string | null, url?: string }[]>();
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
        icon: vue.icon,
        url: vue.url
      },
      {
        title: framework.value?.version ? framework.value.name : "Framework",
        value: framework.value?.version ? framework.value.version : framework.value?.name,
        icon: getTechnologyMetas("framework", framework.value?.slug)?.icon,
        url: getTechnologyMetas("framework", framework.value?.slug)?.url

      },
      {
        title: "UI Framework",
        value: ui.value?.name,
        icon: getTechnologyMetas("ui", ui.value?.slug)?.icon,
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

useSeoMeta({
  title: "VueTracker",
  ogTitle: "VueTracker",
  description: SITE.description,
  ogDescription: SITE.description,
  ogImage: `${SITE.url}${SITE.ogImage}`
});

useHead({
  link: [
    { rel: "canonical", href: SITE.url }
  ]
});
</script>

<template>
  <main>
    <div class="py-2 sm:py-3 md:py-4 relative">
      <h1 class="text-4xl font-bold tracking-tight md:text-5xl text-balance mb-8">
        <span class="text-primary-600 dark:text-primary-400">Vue</span>Tracker
      </h1>
      <h5 class="text-md md:text-lg text-gray-500 dark:text-gray-400 text-balance mb-8">{{ SITE.description }}</h5>
      <div class="2xl:w-1/2 xl:w-3/5 lg:w-3/4 flex flex-col mx-auto gap-6">
        <form @submit.prevent="lookup">
          <UButtonGroup size="xl" orientation="horizontal" class="w-full">
            <UInput v-model="input" class="w-full" :ui="{ leading: { padding: { xl: 'ps-[4.2rem] py-4' } } }" required>
              <template #leading>
                <span class="text-base text-gray-400">https://</span>
              </template>
            </UInput>
            <UButton v-ripple class="md:px-10 w-20 sm:w-32 relative justify-center" type="submit" :disabled="loading">
              <div v-if="!loading" class="absolute">
                <span class="hidden sm:block font-bold">Lookup</span>
                <Icon name="ph:magnifying-glass-duotone" class="sm:hidden block text-2xl" />
              </div>
              <LoadingSpinner v-else class="absolute" />
            </UButton>
          </UButtonGroup>
        </form>
        <div id="results" class="relative">
          <TransitionGroup name="fade">
            <template v-if="result && !error && !loading">
              <div class="flex flex-col gap-6">
                <div class="flex flex-col gap-1 text-start">
                  <NuxtLink :to="`/${result.hostname}`" class="hover:underline">
                    <div class="flex gap-2 items-center justify-start">
                      <img v-if="result.icons?.length" :src="result.icons[0]?.url" class="min-w-6 max-w-6 min-h-6 max-h-6">
                      <h2 class="text-xl font-semibold">/{{ result.hostname }}</h2>
                    </div>
                  </NuxtLink>
                  <h4 class="text-base">{{ result.title }}</h4>
                  <NuxtLink target="_blank" :to="result.url" class="hover:underline">
                    <h6 class="text-sm">{{ result.url }}</h6>
                  </NuxtLink>
                </div>
                <TrackerDetails :result="result" :site-info="siteInfo" :site-plugins="computedSitePlugins" :site-modules="computedSiteModules" />
              </div>
            </template>
            <div v-else-if="!result && error && !loading" class="text-rose-600 dark:text-rose-400">{{ error }}</div>
            <LoadingDots v-else-if="!result && !error && loading" class="absolute w-full top-0" />
          </TransitionGroup>
        </div>
      </div>
    </div>
  </main>
</template>
