<script setup lang="ts">
const { params } = useRoute("siteParts");
const { siteParts } = params;
const site = siteParts?.join("/");
const { data: result, error } = await useFetch<VueTrackerResponse>(`/api/site/${site}`);

if (error.value || !result.value) {
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
  value: result.value?.hasSSR ? "Universal" : "Client-side"
},
{
  title: "Deployment",
  value: result.value.isStatic ? "Static" : result.value?.hasSSR && !result.value.isStatic && result.value.isStatic != undefined ? "Server" : undefined
}]);

useSeoMeta({
  title: `${site} | VueTracker`,
  ogTitle: `${site} | VueTracker`,
  description: result.value?.description || result.value?.title,
  ogDescription: result.value?.description || result.value?.title,
  ogImage: fixOgImage(result.value?.hostname, result.value?.ogImage),
  twitterCard: "summary_large_image",
  twitterImage: fixOgImage(result.value?.hostname, result.value?.ogImage),
  twitterTitle: `${site} | VueTracker`,
  twitterDescription: result.value?.description || result.value?.title
});

useHead({
  link: [
    { rel: "canonical", href: `${SITE.url}/${site}` }
  ]
});

const ogImageErrored = ref(false);
const ogImage = ref<string | undefined>(fixOgImage(result.value.hostname, result.value.ogImage));
const faviconErrored = ref(false);
const favicon = ref<string>(findFavicon(result.value?.icons) || `https://${result.value.hostname}/favicon.ico`);
const faviconFallbackErrored = ref(false);
const faviconFallback = ref<string>(`https://${result.value.hostname}/favicon.ico`);
onBeforeMount(() => {
  const ogImg = new Image();
  const faviconImg = new Image();
  const faviconFallbackImg = new Image();
  faviconImg.src = favicon.value;
  if (ogImage.value) {
    ogImg.src = ogImage.value;
    ogImg.onerror = () => {
      ogImageErrored.value = true;
    };
  }
  faviconImg.onerror = () => {
    faviconErrored.value = true;
    faviconFallbackImg.src = faviconFallback.value;
  };
  faviconFallbackImg.onerror = () => {
    faviconFallbackErrored.value = true;
    faviconFallback.value = `https://www.google.com/s2/favicons?domain=${result.value?.hostname}`;
  };
});
</script>

<template>
  <main>
    <div v-if="result" class="flex flex-col gap-6 2xl:w-1/2 xl:w-3/5 lg:w-3/4 mx-auto py-2 sm:py-3 md:py-4">
      <div class="tracking-tight flex flex-col gap-1">
        <div class="flex gap-2 items-center justify-center">
          <img v-if="!faviconErrored" :src="favicon" class="min-w-6 max-w-6 min-h-6 max-h-6" loading="lazy">
          <img v-if="faviconErrored" :src="faviconFallback" class="min-w-6 max-w-6 min-h-6 max-h-6" loading="lazy">
          <NuxtLink target="_blank" :to="result.url" class="hover:underline flex gap-2 text-xl items-center">
            <h2>{{ site }}</h2>
            <Icon name="fa6-solid:arrow-up-right-from-square" size=".9rem" />
          </NuxtLink>
        </div>
        <h4 class="text-base">{{ result.title }}</h4>
      </div>
      <img v-if="result.ogImage && !ogImageErrored" :src="ogImage" class="rounded-xl" :title="result.title || normalizeSITE(result.url)" :alt="result.title || normalizeSITE(result.url)" loading="lazy">
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
