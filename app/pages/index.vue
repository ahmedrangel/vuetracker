<script setup lang="ts">
const input = ref("");
const result = ref<VueTrackerResponse>();
const siteInfo = ref<{ title?: string, value?: string, img?: string }[]>([]);

watch(input, () => {
  if (input.value.startsWith("https://")) {
    input.value = input.value.replace("https://", "");
  }
});

const lookup = async () => {
  if (input.value) {
    result.value = await $fetch<VueTrackerResponse>("/api/lookup", { query: { url: `https://${input.value}` } });
    if (result.value) {
      siteInfo.value.push({
        title: "Vue Version",
        value: result.value?.vueVersion,
        img: "/icons/vue.svg"
      },
      {
        title: result.value.framework?.version ? result.value.framework.name : "Framework",
        value: result.value.framework?.version ? result.value.framework.version : result.value.framework?.name,
        img: result.value?.framework?.imgPath ? `/icons${result.value.framework.imgPath}` : undefined
      },
      {
        title: "UI Framework",
        value: result.value?.ui?.name,
        img: result.value?.ui?.imgPath ? `/icons${result.value.ui.imgPath}` : undefined
      },
      {
        title: "Rendering",
        value: result.value.hasSSR && !result.value.isStatic ? "Universal" : "Client-side"
      },
      {
        title: "Deployment",
        value: result.value.isStatic ? "Static" : "Server"
      });
    }
  }
};
</script>

<template>
  <main>
    <div class="py-24 sm:py-32 md:py-40 relative md:pb-24">
      <h1 class="text-4xl font-bold tracking-tight md:text-5xl text-balance mb-10"><span class="text-primary-600">Vue</span>Tracker</h1>
      <div class="xl:w-1/2 flex flex-col mx-auto gap-10">
        <UButtonGroup size="xl" orientation="horizontal">
          <UInput v-model="input" class="w-full" :ui="{ leading: { padding: { xl: 'ps-[4.2rem] py-4' } } }">
            <template #leading>
              <span class="text-md text-gray-400">
                https://
              </span>
            </template>
          </UInput>
          <UButton label="Lookup" class="md:px-10" @click="lookup" />
        </UButtonGroup>
        <div v-if="result?.vueVersion" class="flex flex-col gap-5">
          <div class="flex flex-col gap-5">
            <div class="flex items-center gap-2 text-primary-600 font-bold tracking-tight">
              <Icon name="fa6-solid:circle-info" size="2rem" />
              <p>INFO</p>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <template v-for="(info, i) of siteInfo" :key="i">
                <div class="flex flex-col w-full bg-gray-200 border-2 border-gray-300 rounded-xl overflow-hidden">
                  <h6 class="self-start bg-gray-300 px-3 py-1 rounded-br-xl rounded-bl-none rounded-tr-none text-xs tracking-tight uppercase leading-sm font-bold">{{ info.title }}</h6>
                  <div class="flex justify-center items-center p-2 gap-1">
                    <img v-if="info.img" class="w-6 h-6" :src="info.img">
                    <p class="text-md font-bold tracking-tight">{{ info.value }}</p>
                  </div>
                </div>
              </template>
            </div>
            <div v-if="result?.plugins?.length" class="flex flex-col gap-5">
              <div class="flex items-center gap-2 text-primary-600 font-bold tracking-tight">
                <Icon name="fa6-solid:plug" size="2rem" />
                <p>PLUGINS</p>
              </div>
              <div class="flex gap-4">
                <template v-for="(plugin, i) of result.plugins" :key="i">
                  <div class="bg-gray-200 border-2 border-gray-300 rounded-xl overflow-hidden px-4 py-2">
                    <p class="text-md font-bold tracking-tight">{{ plugin.name }}</p>
                  </div>
                </template>
              </div>
            </div>
            <div v-if="result?.frameworkModules?.length" class="flex flex-col gap-5">
              <div class="flex items-center gap-2 text-primary-600 font-bold tracking-tight">
                <Icon name="fa6-solid:cubes" size="2rem" />
                <p>NUXT MODULES</p>
              </div>
              <div class="flex gap-4">
                <template v-for="(module, i) of result.frameworkModules" :key="i">
                  <div class="bg-gray-200 border-2 border-gray-300 rounded-xl overflow-hidden px-4 py-2">
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
