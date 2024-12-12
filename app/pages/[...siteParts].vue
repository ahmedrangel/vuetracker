<script setup lang="ts">
const { params } = useRoute("siteParts");
const { siteParts } = params;
const site = siteParts?.join("/");
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

const framework = computed(() => result.value?.technologies.find(el => el.type === "framework"));
const ui = computed(() => result.value?.technologies.find(el => el.type === "ui"));
const siteInfo = ref([{
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
  value: result.value?.hasSSR && !result.value.isStatic ? "Universal" : "Client-side"
},
{
  title: "Deployment",
  value: result.value?.hasSSR && result.value.isStatic ? "Static" : result.value?.hasSSR && !result.value.isStatic ? "Server" : undefined
}]);

useSeoMeta({
  title: `${site} | VueTracker`,
  ogTitle: `${site} | VueTracker`,
  description: result.value?.description || result.value?.title,
  ogDescription: result.value?.description || result.value?.title,
  ogImage: result.value?.ogImage,
  twitterCard: "summary_large_image",
  twitterImage: result.value?.ogImage,
  twitterTitle: `${site} | VueTracker`,
  twitterDescription: result.value?.description || result.value?.title
});

useHead({
  link: [
    { rel: "canonical", href: `${SITE.url}/${site}` }
  ]
});
</script>

<template>
  <main>
    <div v-if="result" class="flex flex-col gap-6 2xl:w-1/2 xl:w-3/5 lg:w-3/4 mx-auto py-2 sm:py-3 md:py-4">
      <div class="tracking-tight flex flex-col gap-1">
        <div class="flex gap-2 items-center justify-center">
          <img v-if="!result.faviconLoadError" :src="findFavicon(result.icons) || `https://${result.hostname}/favicon.ico`" class="min-w-6 max-w-6 min-h-6 max-h-6" loading="lazy" @error="result.faviconLoadError = true" @load="result.faviconLoadError = false">
          <NuxtLink target="_blank" :to="result.url" class="hover:underline flex gap-2 text-xl items-center">
            <h2>{{ site }}</h2>
            <Icon name="fa6-solid:arrow-up-right-from-square" size=".9rem" />
          </NuxtLink>
        </div>
        <h4 class="text-base">{{ result.title }}</h4>
      </div>
      <img v-if="result.ogImage && !result.ogImageLoadError" :src="result.ogImage.startsWith('/') ? `https://${result.hostname}${result.ogImage}` : result.ogImage" class="rounded-xl" loading="lazy" @error="result.ogImageLoadError = true" @load="result.ogImageLoadError = false">
      <div class="tracking-tight flex gap-3 items-center rounded-xl transition">
        <div class="text-left flex flex-col gap-1">
          <h2 v-if="result.description" class="text-xl text-start">{{ result.siteName }}</h2>
          <h5 v-if="result.description" class="text-sm text-start">{{ result.description }}</h5>
          <NuxtLink target="_blank" :to="result.url" class="hover:underline text-sm w-fit">
            <h5 v-if="result.url">{{ result.url }}</h5>
          </NuxtLink>
        </div>
      </div>
      <TrackerDetails :result="result" :site-info="siteInfo" :site-plugins="computedSitePlugins" :site-modules="computedSiteModules" />
    </div>
  </main>
</template>
