<script setup lang="ts">
definePageMeta({ layout: "explore" });

const frameworksOptions = computed(() => Object.entries({ ...frameworks, vue: { metas: vue } }).map(([_key, value]) => ({
  label: value.metas.name,
  value: value.metas.slug
})).sort((a, b) => a.label.localeCompare(b.label)));

const uiOptions = computed(() => Object.entries(uis).map(([_key, value]) => ({
  label: value.metas.name,
  value: value.metas.slug
})).sort((a, b) => a.label.localeCompare(b.label)));

const filters = [{
  name: "Date added",
  value: "created"
}, {
  name: "Date updated",
  value: "updated"
}];

const filter = ref("created");
const sortIcon = ref("ph:arrow-down-bold");
const sortDesc = ref(true);
const selectedFramework = ref(undefined);
const selectedUI = ref(undefined);
const loading = ref(false);
const results = ref<VueTrackerResponse[]>([]);
const totalResults = ref(0);
const openSideBar = ref(false);
const count = ref(1);
const hasNextPage = ref(false);
const nexted = ref(false);
const lastSite = useTemplateRef<HTMLElement[]>("lastSite");

const getData = async () => {
  return (await $fetch<{ pageInfo: PageInfo, data: VueTrackerResponse[] }>("/api/explore", {
    query: {
      ...selectedFramework.value ? selectedFramework.value !== "vue" ? { framework: selectedFramework.value } : { vueOnly: 1 } : {},
      ...selectedUI.value ? { ui: selectedUI.value } : {},
      sort: filter.value,
      order: sortDesc.value ? "desc" : "asc",
      page: count.value
    }
  }).catch(() => null) || { pageInfo: { totalRecords: 0, hasNextPage: false, currentPage: 1 }, data: [] });
};

const fetchNewFilter = async () => {
  loading.value = true;
  results.value = [];
  count.value = 1;
  nexted.value = false;
  hasNextPage.value = false;
  const { pageInfo, data } = await getData();
  totalResults.value = pageInfo.totalRecords;
  hasNextPage.value = pageInfo.hasNextPage;
  results.value = data;
  loading.value = false;
};

watch(selectedFramework, async () => await fetchNewFilter());
watch(selectedUI, async () => await fetchNewFilter());
watch(filter, async () => await fetchNewFilter());
watch(sortDesc, async () => await fetchNewFilter());

const toggleSort = () => {
  sortDesc.value = !sortDesc.value;
  sortIcon.value = sortDesc.value ? "ph:arrow-down-bold" : "ph:arrow-up-bold";
};

const getNextData = async () => {
  nexted.value = true;
  const { pageInfo, data } = await getData();
  results.value?.push(...data);
  if (count.value === 1) totalResults.value = pageInfo.totalRecords;
  hasNextPage.value = pageInfo.hasNextPage;
  count.value = pageInfo.currentPage + 1;
  nexted.value = false;
};

const scrollHandler = async () => {
  if (lastSite.value?.length && onScreen(lastSite.value[0]!) && !nexted.value && count.value && hasNextPage.value) {
    await getNextData();
  }
};

onMounted(async () => {
  addEventListener("resize", () => {
    openSideBar.value = false;
  });
  loading.value = true;
  await getNextData();
  loading.value = false;
  addEventListener("scroll", scrollHandler);
});

useSeoMeta({
  title: "Explore | VueTracker",
  ogTitle: "Explore | VueTracker"
});

useHead({
  link: [
    { rel: "canonical", href: `${SITE.url}/explore` }
  ]
});
</script>

<template>
  <main>
    <button data-drawer-target="default-sidebar" data-drawer-toggle="default-sidebar" aria-controls="default-sidebar" type="button" class="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" @click="openSideBar = !openSideBar">
      <span class="sr-only">Open sidebar</span>
      <Icon name="ph:sliders-horizontal-bold" size="1.8em" />
    </button>

    <aside id="default-sidebar" class="fixed top-0 left-0 z-40 w-full md:w-64 h-screen transition-transform md:translate-x-0" aria-label="Sidebar" :class="{ '-translate-x-full': !openSideBar, 'translate-x-0': openSideBar }">
      <div class="text-start h-full px-3 py-4 overflow-y-auto bg-gray-200 dark:bg-gray-900 flex flex-col gap-4">
        <NuxtLink v-if="!openSideBar" class="text-center" to="/">
          <h1 class="font-bold tracking-tight"><span class="text-primary-600 dark:text-primary-400">Vue</span>Tracker</h1>
        </NuxtLink>
        <div v-else class="flex justify-between gap-2">
          <NuxtLink class="text-center" to="/">
            <h1 class="font-bold tracking-tight"><span class="text-primary-600 dark:text-primary-400">Vue</span>Tracker</h1>
          </NuxtLink>
          <button class="text-center" @click="openSideBar = !openSideBar">
            <Icon name="ph:x-bold" size="1.5em" />
          </button>
        </div>
        <UInput icon="ph:magnifying-glass" placeholder="Search a website" />
        <div class="flex flex-col gap-4">
          <div class="space-y-1">
            <div class="flex gap-2 justify-between">
              <h3 class="text-lg font-semibold text-primary-600 dark:text-primary-400">Framework</h3>
              <button v-if="selectedFramework" class="text-xs border px-2 rounded bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-rose-500 hover:text-gray-100 hover:dark:bg-rose-700" @click="selectedFramework = undefined">Clear</button>
            </div>
            <URadioGroup v-model="selectedFramework" :options="frameworksOptions" :ui="{ fieldset: 'space-y-1' }" :ui-radio="{ inner: 'ms-1' }">
              <template #label="{ option }">
                <div class="flex gap-1 items-center text-base">
                  <Icon :name="'vuetracker:' + (option.value !== 'vue' ? getTechnologyMetas('framework', option.value)?.icon! : vue.icon)" width="1.2em" height="1.2em" />
                  <span class="text-gray-950 dark:text-gray-50">{{ option.label }}</span>
                </div>
              </template>
            </URadioGroup>
          </div>
          <div class="space-y-1">
            <div class="flex gap-2 justify-between">
              <h3 class="text-lg font-semibold text-primary-600 dark:text-primary-400">UI Framework</h3>
              <button v-if="selectedUI" class="text-xs border px-2 rounded bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-rose-500 hover:text-gray-100 hover:dark:bg-rose-700" @click="selectedUI = undefined">Clear</button>
            </div>
            <URadioGroup v-model="selectedUI" :options="uiOptions" :ui="{ fieldset: 'space-y-1' }" :ui-radio="{ inner: 'ms-1' }">
              <template #label="{ option }">
                <div class="flex gap-1 items-center text-base">
                  <Icon :name="'vuetracker:' + getTechnologyMetas('ui', option.value)?.icon!" width="1.2em" height="1.2em" />
                  <span class="text-gray-950 dark:text-gray-50">{{ option.label }}</span>
                </div>
              </template>
            </URadioGroup>
          </div>
        </div>
      </div>
    </aside>

    <div class="md:px-2 md:ml-64">
      <div class="flex gap-2 flex-wrap justify-between items-end">
        <h3 class="text-lg tracking-tight"><b>{{ totalResults }}</b> websites found</h3>
        <div class="flex gap-1 items-center">
          <USelect v-model="filter" :options="filters" option-attribute="name" />
          <UButton :icon="sortIcon" @click="toggleSort" />
        </div>
      </div>
      <div class="flex items-center justify-start pt-2 gap-1">
        <template v-for="(tech, i) of [selectedFramework === 'vue' ? { name: 'Vue', type: 'framework' } : { name: getTechnologyMetas('framework', selectedFramework)?.name, type: 'framework' }, { name: getTechnologyMetas('ui', selectedUI)?.name, type: 'ui' }]" :key="i">
          <UBadge v-if="tech.name" role="button" size="lg" variant="solid" class="flex gap-1 select-none" @click="tech.type === 'framework' ? selectedFramework = undefined : selectedUI = undefined">
            <span>{{ tech.name }}</span>
            <Icon name="ph:x" />
          </UBadge>
        </template>
      </div>
      <div class="relative py-4">
        <TransitionGroup name="fade">
          <div v-if="!loading && results" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
            <template v-for="(r, i) of results" :key="i">
              <div class="flex flex-col bg-gray-200 dark:bg-gray-900 rounded overflow-hidden">
                <div class="relative h-[100px] sm:h-[160px] md:h-[140px] lg:h-[140px] xl:h-[180px]">
                  <img v-if="r.ogImage" :src="r.ogImage" class="absolute object-cover h-full w-full" :title="r.title || r.hostname">
                  <div v-else class="absolute flex items-center justify-center h-full w-full bg-gray-300 dark:bg-gray-800" title="No OG Image">
                    <Icon name="ph:image" size="2em" />
                  </div>
                </div>
                <div class="flex flex-wrap gap-2 items-center justify-between p-2">
                  <NuxtLink :to="`/${r.hostname}`" class="hover:underline truncate">
                    <div class="flex gap-1 items-center">
                      <img v-if="r.icons?.length" :src="r.icons[0]?.url" class="max-w-4 max-h-4 min-w-4 min-h-4">
                      <h4 class="text-xs xl:text-sm font-semibold truncate">/{{ r.hostname }}</h4>
                    </div>
                  </NuxtLink>
                  <div class="flex gap-1 items-center">
                    <span v-if="!r.technologies.some(el => el.type === 'framework')" :title="vue.name">
                      <Icon :name="'vuetracker:vue'" width="1.3em" height="1.3em" />
                    </span>
                    <template v-for="(tech, j) of r.technologies" :key="j">
                      <span v-if="getTechnologyMetas(tech.type, tech.slug)?.icon" :title="getTechnologyMetas(tech.type, tech.slug)?.name">
                        <Icon :name="'vuetracker:' + getTechnologyMetas(tech.type, tech.slug)?.icon" width="1.3em" height="1.3em" />
                      </span>
                    </template>
                  </div>
                </div>
              </div>
              <span v-if="i === results?.length - 1" ref="lastSite" class="m-0 p-0" />
            </template>
          </div>
          <LoadingDots v-else-if="loading" class="absolute w-full top-0 mt-8" />
        </TransitionGroup>
      </div>
    </div>
  </main>
</template>
