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
</script>

<template>
  <nav class="text-gray-900 dark:text-gray-50 text-base tracking-tight sm:bg-gray-200 sm:dark:bg-gray-900">
    <div class="mx-auto sm:px-6 lg:px-8 px-2 bg-gray-200 dark:bg-gray-900 z-20 relative" :class="route.path !== '/explore' ? 'max-w-7xl' : ''">
      <div class="relative flex h-14 items-center justify-between">
        <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
          <!-- Mobile menu button -->
          <button v-ripple type="button" class="relative inline-flex items-center justify-center rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-400 dark:focus:ring-gray-700" aria-controls="mobile-menu" aria-expanded="false" @click="menuOpen = !menuOpen">
            <span class="absolute -inset-0.5" />
            <span class="sr-only">Open main menu</span>
            <Icon v-if="!menuOpen" name="ph:list" size="1.5em" />
            <Icon v-else name="ph:x" size="1.5em" />
          </button>
        </div>
        <div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
          <NuxtLink v-if="!['/', '/explore'].includes(route.path)" to="/">
            <h1 class="font-bold tracking-tight"><span class="text-primary-600 dark:text-primary-400">Vue</span>Tracker</h1>
          </NuxtLink>
        </div>
        <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 gap-2">
          <div class="hidden sm:ml-6 sm:block">
            <div class="nav-tabs flex space-x-2">
              <NuxtLink v-ripple to="/explore" class="rounded-md px-2 py-1 font-semibold hover:bg-gray-100 hover:dark:bg-gray-800">Explore</NuxtLink>
            </div>
          </div>
          <div class="nav-tabs flex space-x-2">
            <button v-ripple type="button" class="rounded-md px-2 py-1 hover:bg-gray-100 hover:dark:bg-gray-800" @click="dark = !dark">
              <Icon :name="modeIcon" size="1.4em" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="slide-menu">
      <div v-if="menuOpen" id="mobile-menu" class="sm:hidden bg-gray-300 dark:bg-gray-900 z-10 relative">
        <div class="nav-tabs space-y-1 px-2 pb-3 pt-2">
          <NuxtLink to="/explore" class="block rounded-md px-3 py-2 font-semibold hover:bg-gray-200 hover:dark:bg-gray-800">Explore</NuxtLink>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<style scoped lang="postcss">
.dark .nav-tabs .router-link-exact-active {
  @apply bg-gray-950;
}

.light .nav-tabs .router-link-exact-active {
  @apply bg-gray-50;
}

.slide-menu-enter-active,
.slide-menu-leave-active {
  transition: all 0.2s;
}
.slide-menu-enter-from {
  transform: translate(0, -100px);
}
.slide-menu-leave-to {
  transform: translate(0, -100px);
}
</style>
