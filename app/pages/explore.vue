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
const { data: results } = await useFetch<VueTrackerResponse[]>("/api/explore");

watchEffect(async () => {
  results.value = await $fetch<VueTrackerResponse[]>("/api/explore", {
    query: {
      ...selectedFramework.value ? selectedFramework.value !== "vue" ? { framework: selectedFramework.value } : { vueOnly: 1 } : {},
      ...selectedUI.value ? { ui: selectedUI.value } : {},
      sort: filter.value,
      order: sortDesc.value ? "desc" : "asc"
    }
  }).catch(() => []);
});

const toggleSort = () => {
  sortDesc.value = !sortDesc.value;
  sortIcon.value = sortDesc.value ? "ph:arrow-down-bold" : "ph:arrow-up-bold";
};
</script>

<template>
  <main>
    <button data-drawer-target="default-sidebar" data-drawer-toggle="default-sidebar" aria-controls="default-sidebar" type="button" class="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
      <span class="sr-only">Open sidebar</span>
      <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z" />
      </svg>
    </button>

    <aside id="default-sidebar" class="fixed top-0 left-0 z-40 md:w-64 h-screen transition-transform -translate-x-full md:translate-x-0" aria-label="Sidebar">
      <div class="text-start h-full px-3 py-4 overflow-y-auto bg-gray-200 dark:bg-gray-900 flex flex-col gap-4">
        <NuxtLink class="text-center" to="/">
          <h1 class="font-bold tracking-tight"><span class="text-primary-600 dark:text-primary-400">Vue</span>Tracker</h1>
        </NuxtLink>
        <UInput icon="ph:magnifying-glass" placeholder="Search a website" />
        <div class="flex flex-col gap-4">
          <div class="space-y-1">
            <div class="flex gap-2 justify-between">
              <h3 class="text-lg font-semibold text-primary-600 dark:text-primary-400">Framework</h3>
              <button v-if="selectedFramework" class="text-xs border px-2 rounded bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-rose-500 hover:text-gray-100 hover:dark:bg-rose-700" @click="selectedFramework = undefined">Clear</button>
            </div>
            <URadioGroup v-model="selectedFramework" :options="frameworksOptions" :ui="{ fieldset: 'space-y-1' }" :ui-radio="{ inner: 'ms-1' }">
              <template #label="{ option }">
                <div class="flex gap-1 items-center">
                  <Icon :name="'vuetracker:' + (option.value !== 'vue' ? getTechnologyMetas('framework', option.value)?.icon! : vue.icon)" size="1.2em" />
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
                <div class="flex gap-1 items-center">
                  <Icon :name="'vuetracker:' + getTechnologyMetas('ui', option.value)?.icon!" size="1.2em" />
                  <span class="text-gray-950 dark:text-gray-50">{{ option.label }}</span>
                </div>
              </template>
            </URadioGroup>
          </div>
        </div>
      </div>
    </aside>

    <div class="md:px-2 md:ml-64">
      <div class="flex gap-2 justify-between items-end mb-4">
        <h3 class="text-lg tracking-tight"><b>{{ results?.length }}</b> websites found</h3>
        <div class="flex gap-1 items-center">
          <USelect v-model="filter" :options="filters" option-attribute="name" />
          <UButton :icon="sortIcon" @click="toggleSort" />
        </div>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <template v-for="(r, i) of results" :key="i">
          <div class="flex flex-col bg-gray-200 dark:bg-gray-900 rounded overflow-hidden">
            <div class="relative h-[100px] sm:h-[160px] md:h-[140px] lg:h-[140px] xl:h-[180px]">
              <img v-if="r.ogImage" :src="r.ogImage" class="absolute object-cover h-full w-full" :title="r.title || r.hostname">
              <div v-else class="absolute flex items-center justify-center h-full w-full bg-gray-300 dark:bg-gray-800" title="No OG Image">
                <Icon name="ph:image" size="2em" />
              </div>
            </div>
            <div class="flex gap-2 items-center justify-between p-2">
              <NuxtLink :to="`/${r.hostname}`" class="hover:underline">
                <div class="flex gap-1 items-center">
                  <img v-if="r.icons?.length" :src="r.icons[0]?.url" class="min-w-6 max-w-6 min-h-6 max-h-6">
                  <h4 class="text-xs xl:text-sm font-semibold">/{{ r.hostname }}</h4>
                </div>
              </NuxtLink>
              <div class="flex gap-1 items-center">
                <span v-if="!r.technologies.some(el => el.type === 'framework')" :title="vue.name">
                  <Icon :name="'vuetracker:vue'" size="1.5em" />
                </span>
                <template v-for="(tech, j) of r.technologies" :key="j">
                  <span v-if="getTechnologyMetas(tech.type, tech.slug)?.icon" :title="getTechnologyMetas(tech.type, tech.slug)?.name">
                    <Icon :name="'vuetracker:' + getTechnologyMetas(tech.type, tech.slug)?.icon" size="1.5em" />
                  </span>
                </template>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </main>
</template>
