<script setup lang="ts">
const route = useRoute();
const colorMode = useColorMode();
const dark = computed({
  get: () => colorMode.value === "dark",
  set: () => colorMode.preference = colorMode.value === "dark" ? "light" : "dark"
});

const icons = { sun: "ph:sun-duotone", moon: "ph:moon-duotone" };
const modeIcon = ref("ph:circle-dashed-thin");
const menuOpen = ref(false);

onMounted(() => {
  watch(dark, (val) => {
    modeIcon.value = val ? icons.moon : icons.sun;
  }, { immediate: true });
});

const rightItems = [
  { label: "Explore", to: "/explore", type: "link" }
];

const iconItems = computed(() => [
  { icon: modeIcon.value, type: "button", action: () => dark.value = !dark.value },
  { icon: "ph:github-logo-duotone", to: "https://github.com/ahmedrangel/vuetracker", type: "link", target: "_blank" }
]);
</script>

<template>
  <nav class="text-neutral-900 dark:text-neutral-50 text-base tracking-tight sm:bg-neutral-200 sm:dark:bg-neutral-900">
    <div class="mx-auto sm:px-6 lg:px-8 px-2 bg-neutral-200 dark:bg-neutral-900 z-20 relative" :class="route.path !== '/explore' ? 'max-w-7xl' : ''">
      <div class="relative flex h-14 items-center justify-between">
        <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
          <!-- Mobile menu button -->
          <button v-ripple type="button" class="relative inline-flex items-center justify-center rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-neutral-400 dark:focus:ring-neutral-700" aria-controls="mobile-menu" aria-expanded="false" @click="menuOpen = !menuOpen">
            <span class="absolute -inset-0.5" />
            <span class="sr-only">Open main menu</span>
            <Icon v-if="!menuOpen" name="ph:list" size="1.5em" />
            <Icon v-else name="ph:x" size="1.5em" />
          </button>
        </div>
        <div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
          <NuxtLink v-if="route.path !== '/'" :class="`${['/explore'].includes(route.path) ? 'block md:hidden' : ''}`" to="/">
            <h1 class="font-bold tracking-tight"><span class="text-primary-600 dark:text-primary-400">Vue</span>Tracker</h1>
          </NuxtLink>
        </div>
        <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 gap-2">
          <div class="hidden sm:ml-6 sm:block">
            <div class="nav-tabs flex space-x-1">
              <template v-for="(it, i) of rightItems" :key="i">
                <NuxtLink v-if="it.type === 'link'" v-ripple :to="it.to" class="rounded-md px-2 py-1 font-semibold hover:bg-neutral-100 hover:dark:bg-neutral-800">{{ it.label }}</NuxtLink>
              </template>
            </div>
          </div>
          <div class="nav-tabs flex space-x-1">
            <template v-for="(it, i) of iconItems" :key="i">
              <button v-if="it.type === 'button'" v-ripple type="button" class="rounded-md px-1 py-1 hover:bg-neutral-100 hover:dark:bg-neutral-800" @click="it.action">
                <Icon :name="it.icon" size="1.4em" />
              </button>
              <NuxtLink v-else-if="it.type === 'link'" v-ripple :to="it.to" :target="it.target" class="rounded-md px-2 py-1 hover:bg-neutral-100 hover:dark:bg-neutral-800">
                <Icon :name="it.icon" size="1.4em" />
              </NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="slide-menu">
      <div v-if="menuOpen" id="mobile-menu" class="sm:hidden bg-neutral-300 dark:bg-neutral-900 z-10 absolute w-full">
        <div class="nav-tabs space-y-1 px-2 pb-3 pt-2">
          <template v-for="(it, i) of rightItems" :key="i">
            <NuxtLink v-if="it.type === 'link'" v-ripple :to="it.to" class="block rounded-md px-3 py-2 font-semibold hover:bg-neutral-200 hover:dark:bg-neutral-800" @click="menuOpen = false">{{ it.label }}</NuxtLink>
          </template>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
.dark .nav-tabs .router-link-exact-active {
  background-color: var(--color-neutral-950);
}

.light .nav-tabs .router-link-exact-active {
  background-color: var(--color-neutral-50);
}
</style>
