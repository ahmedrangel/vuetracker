<script setup lang="ts">
const { data: preview } = await useFetch<VueTrackerResponse[]>("/api/explore", {
  key: "explore",
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key]
});

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

    if (!result.value?.slug && !error.value) {
      result.value = undefined;
      error.value = "An error ocurred";
      loading.value = false;
      return;
    }

    computedSiteModules.value = result.value?.technologies;
    computedSitePlugins.value = result.value?.technologies;
    const framework = computed(() => result.value?.technologies.find(el => el.type === "framework"));
    const ui = computed(() => result.value?.technologies.find(el => el.type === "ui"));
    if (result.value) {
      if (preview.value && !preview.value.some(el => el.hostname === result.value?.hostname)) {
        const newPreview = [...preview.value, result.value];
        preview.value = newPreview;
        useNuxtApp().payload.data["explore"] = newPreview;
      }
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
        value: result.value.hasSSR ? "Universal" : "Client-side"
      },
      {
        title: "Deployment",
        value: result.value.isStatic ? "Static" : result.value.hasSSR && !result.value.isStatic && result.value.isStatic != undefined ? "Server" : undefined
      }];
    }
  }
  loading.value = false;
};

useSeoMeta({
  title: `${SITE.name} | ${SITE.shortDescription}`,
  ogTitle: `${SITE.name} | ${SITE.shortDescription}`,
  description: SITE.description,
  ogDescription: SITE.description,
  ogImage: `${SITE.url}${SITE.ogImage}`,
  twitterImage: `${SITE.url}${SITE.ogImage}`,
  twitterCard: "summary_large_image",
  twitterTitle: `${SITE.name} | ${SITE.shortDescription}`,
  twitterDescription: SITE.description
});

useHead({
  link: [
    { rel: "canonical", href: SITE.url }
  ],
  script: [{
    type: "application/ld+json",
    innerHTML: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": SITE.name,
      "url": SITE.url
    })
  }]
});

const faviconErrored = ref(false);
const ogImageErrored = ref(false);
const faviconFallbackErrored = ref(false);

const fixInput = (payload: string | number) => {
  const inputLookup = document.getElementById("input-lookup") as HTMLInputElement;
  inputLookup.value = String(payload).replace("https://", "");
};
</script>

<template>
  <main>
    <div class="py-2 sm:py-3 md:py-4 relative">
      <h1 class="text-4xl font-bold tracking-tight md:text-5xl text-balance mb-4 md:mb-8">
        <span class="text-primary-600 dark:text-primary-400">Vue</span>Tracker
      </h1>
      <h5 class="text-md md:text-lg text-neutral-500 dark:text-neutral-400 text-balance mb-4 md:mb-8">{{ SITE.description }}</h5>
      <div class="2xl:w-1/2 xl:w-3/5 lg:w-3/4 flex flex-col mx-auto gap-6">
        <form @submit.prevent="lookup">
          <UButtonGroup size="xl" orientation="horizontal" class="w-full">
            <UInput id="input-lookup" v-model="input" class="w-full" :ui="{ base: 'ps-[4.0rem] py-4 bg-neutral-50 dark:bg-neutral-900' }" required @update:model-value="fixInput">
              <template #leading>
                <span class="text-base text-neutral-400">https://</span>
              </template>
            </UInput>
            <UButton class="m-0 p-0 relative" type="submit" :disabled="loading">
              <div v-ripple class="md:px-10 w-20 sm:w-32 flex justify-center cursor-pointer absolute h-full items-center">
                <div v-if="!loading">
                  <span class="hidden sm:block font-bold">Lookup</span>
                  <Icon name="ph:magnifying-glass-duotone" class="sm:hidden block text-2xl" />
                </div>
                <LoadingSpinner v-else />
              </div>
            </UButton>
          </UButtonGroup>
        </form>
        <div id="results" class="relative">
          <TransitionGroup name="fade">
            <template v-if="result && !error && !loading">
              <div class="flex flex-col gap-6">
                <div class="flex gap-2 items-center justify-between">
                  <div class="flex flex-col gap-1 text-start">
                    <NuxtLink :to="`/${normalizeSITE(result.url)}`" class="hover:underline w-fit">
                      <div class="flex gap-2 items-center justify-start">
                        <img v-if="!faviconErrored" :src="findFavicon(result.icons) || `https://${result.hostname}/favicon.ico`" class="min-w-6 max-w-6 min-h-6 max-h-6" loading="lazy" @error="faviconErrored = true" @load="faviconErrored = false">
                        <img v-else-if="faviconErrored && !faviconFallbackErrored" :src="`https://${result.hostname}/favicon.ico`" class="min-w-6 max-w-6 min-h-6 max-h-6" loading="lazy" @error="faviconFallbackErrored = true" @load="faviconFallbackErrored = false">
                        <img v-else-if="faviconFallbackErrored" :src="`https://www.google.com/s2/favicons?domain=${result.hostname}`" class="min-w-6 max-w-6 min-h-6 max-h-6" loading="lazy">
                        <h2 class="text-xl font-semibold">/{{ normalizeSITE(result.url) }}</h2>
                      </div>
                    </NuxtLink>
                    <h4 class="text-base">{{ result.title }}</h4>
                    <NuxtLink target="_blank" :to="result.url" class="hover:underline w-fit">
                      <h6 class="text-sm">{{ result.url }}</h6>
                    </NuxtLink>
                  </div>
                  <img v-if="result.ogImage && !ogImageErrored" :src="fixOgImage(result.hostname, result.ogImage)" class="rounded-xl w-auto h-[70px] border-2 border-neutral-300 dark:border-neutral-700" :title="result.title || normalizeSITE(result.url)" :alt="result.title || normalizeSITE(result.url)" loading="lazy" @error="ogImageErrored = true" @load="ogImageErrored = false">
                </div>
                <TrackerDetails :result="result" :site-info="siteInfo" :site-plugins="computedSitePlugins" :site-modules="computedSiteModules" />
              </div>
            </template>
            <div v-else-if="!result && !error && loading" class="flex flex-col gap-6">
              <div class="flex flex-col gap-2 text-start">
                <div class="flex gap-2 items-center justify-start">
                  <USkeleton class="h-6 w-6 bg-neutral-200 dark:bg-neutral-800" />
                  <USkeleton class="h-6 w-36 bg-neutral-200 dark:bg-neutral-800" />
                </div>
                <USkeleton class="h-5 w-72 bg-neutral-200 dark:bg-neutral-800" />
                <USkeleton class="h-5 w-36 bg-neutral-200 dark:bg-neutral-800" />
              </div>
              <SkeletonTrackerDetails />
            </div>
            <div v-else-if="!result && error && !loading" class="text-rose-600 dark:text-rose-400">{{ error }}</div>
          </TransitionGroup>
        </div>
      </div>
      <div id="preview" class="mt-6">
        <h5 class="text-md md:text-lg text-neutral-500 dark:text-neutral-400 text-balance mb-4 md:mb-8">
          <NuxtLink to="/explore" class="text-primary-600 dark:text-primary-400 hover:underline font-semibold">Explore</NuxtLink> our database of {{ preview?.length }} websites
        </h5>
        <SiteGlide v-if="preview" :sites="preview" />
      </div>
    </div>
  </main>
</template>

<style scoped>
#results .fade-leave-active {
  position: absolute;
  width: 100%;
}
</style>
