<script setup lang="ts">
definePageMeta({ layout: "explore" });
const { framework, ui, sort, page } = useRoute().query as Record<string, string>;
const path = useRoute().path;

const { data: results } = await useCachedFetch<VueTrackerResponse[]>("/api/explore", {
  key: "explore"
});

const frameworksOptions = computed(() => Object.entries({ ...frameworks, vue: { metas: vue } }).map(([_key, value]) => ({
  label: value.metas.name,
  value: value.metas.slug
})).toSorted((a, b) => a.label.localeCompare(b.label)));

const uiOptions = computed(() => Object.entries(uis).map(([_key, value]) => ({
  label: value.metas.name,
  value: value.metas.slug
})).toSorted((a, b) => a.label.localeCompare(b.label)));

const filters = [{
  label: "Date added",
  value: "added"
}, {
  label: "Date updated",
  value: "updated"
}];

const inputQuery = ref("");
const sortType = ref(sort || "added");
const selectedFramework = ref(framework || undefined);
const selectedUI = ref(ui || undefined);
const openSideBar = ref(false);
const pageSize = 32;
const currentPage = ref(Number(page) || 1);
const filteredResults = computed(() => {
  return results.value?.filter((result) => {
    const techs = result.technologies;
    const isVue = selectedFramework.value === "vue";
    const isSelectedFramework = techs.some(tech => tech.slug === selectedFramework.value);
    const hasTypeFramework = techs.some(tech => tech.type === "framework");
    const isSelectedUI = techs.some(tech => tech.slug === selectedUI.value);
    if (selectedFramework.value && selectedUI.value) return isVue ? !hasTypeFramework && isSelectedUI : isSelectedFramework && isSelectedUI;
    if (selectedFramework.value) return isVue ? !hasTypeFramework : isSelectedFramework;
    if (selectedUI.value) return isSelectedUI;
    return true;
  })?.filter((result) => {
    const searchQuery = inputQuery.value.trim().toLowerCase();
    const siteURL = normalizeSITE(result.url).toLowerCase().replace(/[^a-zA-Z0-9]/g, "");
    if (!searchQuery) return true;
    return siteURL.includes(searchQuery.replace(/[^a-zA-Z0-9]/g, ""));
  }).sort((a, b) => {
    return sortType.value === "added" ? b.createdAt - a.createdAt : b.updatedAt - a.updatedAt;
  });
});

const slicedResults = computed(() => {
  return filteredResults.value?.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize) || [];
});

const totalResults = computed(() => filteredResults.value?.length || 0);
const generalWatch = computed(() => {
  return {
    selectedFramework: selectedFramework.value,
    selectedUI: selectedUI.value,
    inputQuery: inputQuery.value,
    sortType: sortType.value
  };
});

watch(generalWatch, () => {
  currentPage.value = 1;
  const newPath = withQuery(path, {
    framework: selectedFramework.value,
    ui: selectedUI.value,
    q: inputQuery.value ? inputQuery.value : undefined,
    sort: sortType.value === "added" ? undefined : sortType.value,
    page: currentPage.value === 1 ? undefined : currentPage.value.toString()
  });
  window.history.replaceState({}, "", newPath);
}, { deep: true });

watch(openSideBar, () => {
  if (openSideBar.value) document.body.classList.add("overflow-hidden");
  else document.body.classList.remove("overflow-hidden");
});

onMounted(async () => {
  addEventListener("resize", () => {
    openSideBar.value = false;
  });
});

useSeoMeta({
  title: "Explore | VueTracker",
  ogTitle: "Explore | VueTracker",
  description: SITE.description,
  ogDescription: SITE.description,
  ogImage: `${SITE.url}${SITE.ogImage}`,
  twitterImage: `${SITE.url}${SITE.ogImage}`,
  twitterCard: "summary_large_image",
  twitterTitle: "Explore | VueTracker",
  twitterDescription: SITE.description
});

useHead({
  link: [
    { rel: "canonical", href: `${SITE.url}/explore` }
  ]
});

const filteredFrameworksOptions = computed(() => {
  return [...frameworksOptions.value.filter(el => results.value?.some(f => f.technologies.some(tech => tech.slug === el.value))), { label: "Vue", value: "vue" }];
});
const filteredUIOptions = computed(() => {
  return uiOptions.value.filter(el => results.value?.some(f => f.technologies.some(tech => tech.slug === el.value)));
});

const radioGroups = computed<{
  name: string;
  options: { label: string, value: string }[];
  type: "framework" | "ui";
  vModel: Ref<string | undefined>;
}[]>(() => [
  { name: "Frameworks", options: filteredFrameworksOptions.value, type: "framework" as const, vModel: selectedFramework },
  { name: "UI Frameworks", options: filteredUIOptions.value, type: "ui" as const, vModel: selectedUI }
]);
</script>

<template>
  <main>
    <button data-drawer-target="default-sidebar" data-drawer-toggle="default-sidebar" aria-controls="default-sidebar" type="button" class="inline-flex items-center p-2 mb-5 text-sm text-neutral-500 rounded-lg md:hidden hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:focus:ring-neutral-600" @click="openSideBar = !openSideBar">
      <span class="sr-only">Open sidebar</span>
      <Icon name="ph:sliders-horizontal-bold" size="1.8em" />
    </button>

    <aside id="default-sidebar" class="fixed top-0 left-0 z-40 w-full md:w-64 h-screen transition-transform md:translate-x-0" aria-label="Sidebar" :class="{ '-translate-x-full': !openSideBar, 'translate-x-0': openSideBar }">
      <div class="text-start h-full px-3 py-4 overflow-y-auto bg-neutral-200 dark:bg-neutral-900 flex flex-col gap-4">
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
        <UInput v-model="inputQuery" icon="ph:magnifying-glass" placeholder="Search a website" />
        <div class="flex flex-col gap-4">
          <template v-for="(radio, i) of radioGroups" :key="i">
            <div class="space-y-1">
              <div class="flex gap-2 justify-between">
                <h3 class="text-lg font-semibold text-primary-600 dark:text-primary-400">{{ radio.name }}</h3>
                <button v-if="radio.vModel.value" class="text-xs border px-2 rounded bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 hover:bg-rose-500 hover:text-neutral-100 hover:dark:bg-rose-700" @click="radio.vModel.value = undefined">Clear</button>
              </div>
              <URadioGroup v-model="radio.vModel.value" :name="radio.name" :items="radio.options" :ui="{ fieldset: 'gap-1', wrapper: 'ms-1' }">
                <template #label="{ item }">
                  <div class="flex gap-1 items-center text-base">
                    <Icon :name="'vuetracker:' + (item.value !== 'vue' ? getTechnologyMetas(radio.type, item.value)?.icon! : vue.icon)" width="1.2em" height="1.2em" />
                    <span class="text-neutral-950 dark:text-neutral-50">{{ item.label }}</span>
                  </div>
                </template>
              </URadioGroup>
            </div>
          </template>
        </div>
      </div>
    </aside>

    <div class="md:px-2 md:ml-64">
      <div class="flex gap-2 flex-wrap justify-between items-end">
        <h3 class="text-lg tracking-tight"><b>{{ totalResults }}</b> websites found</h3>
        <div class="flex gap-1 items-center">
          <USelect v-model="sortType" :items="filters" class="bg-neutral-50 dark:bg-neutral-900" />
        </div>
      </div>
      <div v-if="selectedFramework || selectedUI" class="flex items-center justify-start pt-2 gap-1">
        <template v-for="(tech, i) of [selectedFramework === 'vue' ? { name: 'Vue', type: 'framework' } : { name: getTechnologyMetas('framework', selectedFramework)?.name, type: 'framework' }, { name: getTechnologyMetas('ui', selectedUI)?.name, type: 'ui' }]" :key="i">
          <UButton v-if="tech.name" variant="solid" class="flex gap-1 select-none" @click="tech.type === 'framework' ? selectedFramework = undefined : selectedUI = undefined">
            <span>{{ tech.name }}</span>
            <Icon name="ph:x" />
          </UButton>
        </template>
      </div>
      <div class="relative py-4">
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
          <TransitionGroup name="list">
            <div v-for="site in slicedResults" :key="site.slug">
              <SiteCard :site="site" />
            </div>
          </TransitionGroup>
        </div>
        <UPagination v-if="filteredResults?.length" v-model:page="currentPage" class="mt-10 justify-center" size="md" :items-per-page="pageSize" :total="filteredResults?.length || 0" />
      </div>
    </div>
  </main>
</template>
