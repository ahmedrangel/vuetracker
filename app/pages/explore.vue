<script setup lang="ts">
definePageMeta({ layout: "explore" });
const router = useRouter();
const { framework, ui, sort, page } = useRoute().query as Record<string, string>;
const { data: results } = await useFetch<VueTrackerResponse[]>("/api/explore");

const frameworksOptions = computed(() => Object.entries({ ...frameworks, vue: { metas: vue } }).map(([_key, value]) => ({
  label: value.metas.name,
  value: value.metas.slug
})).toSorted((a, b) => a.label.localeCompare(b.label)));

const uiOptions = computed(() => Object.entries(uis).map(([_key, value]) => ({
  label: value.metas.name,
  value: value.metas.slug
})).toSorted((a, b) => a.label.localeCompare(b.label)));

const filters = [{
  name: "Date added",
  value: "added"
}, {
  name: "Date updated",
  value: "updated"
}];

const inputQuery = ref("");
const sortType = ref(sort || "added");
const selectedFramework = ref(framework || undefined);
const selectedUI = ref(ui || undefined);
const openSideBar = ref(false);
const totalResults = ref(results.value?.length || 0);
const pageSize = 32;
const currentPage = ref(Number(page) || 1);
const computedResults = ref<VueTrackerResponse[] | undefined>(results.value);
const filteredResults = computed({
  get: () => computedResults.value?.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize),
  set: (value) => {
    if (!value) return;
    if (selectedFramework.value) {
      value = value.filter(result => selectedFramework.value === "vue" ? !result.technologies.some(tech => tech.type === "framework") : result.technologies.some(tech => tech.slug === selectedFramework.value));
    }
    if (selectedUI.value)
      value = value.filter(result => result.technologies.some(tech => tech.slug === selectedUI.value));
    value = value.toSorted((a, b) => {
      if (sortType.value === "added")
        return (a.createdAt - b.createdAt) * -1;
      else
        return (a.updatedAt - b.updatedAt) * -1;
    });
    if (inputQuery.value)
      value = value.filter(value => normalizeSITE(value.url).toLowerCase().replace(/[^a-zA-Z0-9]/g, "").includes(inputQuery.value.toLowerCase().replace(/[^a-zA-Z0-9]/g, "")));
    router.push({
      query: {
        framework: selectedFramework.value,
        ui: selectedUI.value,
        q: inputQuery.value ? inputQuery.value : undefined,
        sort: sortType.value,
        page: currentPage.value.toString()
      }
    });
    totalResults.value = value.length;
    computedResults.value = value;
  }
});

filteredResults.value = results.value;
watch(selectedFramework, () => {
  currentPage.value = 1;
  filteredResults.value = results.value;
});
watch(selectedUI, () => {
  currentPage.value = 1;
  filteredResults.value = results.value;
});
watch(sortType, () => filteredResults.value = results.value);
watch(currentPage, () => filteredResults.value = results.value);
watch(inputQuery, () => {
  currentPage.value = 1;
  filteredResults.value = results.value;
});
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

const radioGroups = computed<{
  name: string;
  options: { label: string, value: string }[];
  type: "framework" | "ui";
  vModel: Ref<string | undefined>;
}[]>(() => [
  { name: "Frameworks", options: frameworksOptions.value, type: "framework" as const, vModel: selectedFramework },
  { name: "UI Framework", options: uiOptions.value, type: "ui" as const, vModel: selectedUI }
]);
</script>

<template>
  <main>
    <button data-drawer-target="default-sidebar" data-drawer-toggle="default-sidebar" aria-controls="default-sidebar" type="button" class="inline-flex items-center p-2 mb-5 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" @click="openSideBar = !openSideBar">
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
        <UInput v-model="inputQuery" icon="ph:magnifying-glass" placeholder="Search a website" />
        <div class="flex flex-col gap-4">
          <template v-for="(radio, i) of radioGroups" :key="i">
            <div class="space-y-1">
              <div class="flex gap-2 justify-between">
                <h3 class="text-lg font-semibold text-primary-600 dark:text-primary-400">{{ radio.name }}</h3>
                <button v-if="radio.vModel.value" class="text-xs border px-2 rounded bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-rose-500 hover:text-gray-100 hover:dark:bg-rose-700" @click="radio.vModel.value = undefined">Clear</button>
              </div>
              <URadioGroup v-model="radio.vModel.value" :name="radio.name" :options="radio.options" :ui="{ fieldset: 'space-y-1' }" :ui-radio="{ inner: 'ms-1' }">
                <template #label="{ option }">
                  <div class="flex gap-1 items-center text-base">
                    <Icon :name="'vuetracker:' + (option.value !== 'vue' ? getTechnologyMetas(radio.type, option.value)?.icon! : vue.icon)" width="1.2em" height="1.2em" />
                    <span class="text-gray-950 dark:text-gray-50">{{ option.label }}</span>
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
          <USelect v-model="sortType" :options="filters" option-attribute="name" />
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
          <TransitionGroup name="slide">
            <template v-for="(site, i) of filteredResults" :key="i">
              <SiteCard :site="site" />
            </template>
          </TransitionGroup>
        </div>
        <UPagination v-if="computedResults?.length" v-model="currentPage" class="mt-10 justify-center" size="md" :page-count="pageSize" :total="computedResults?.length || 0" show-last show-first />
      </div>
    </div>
  </main>
</template>
