<script setup lang="ts">
const colorMode = useColorMode();
const dark = computed({
  get: () => colorMode.value === "dark",
  set: () => colorMode.preference = colorMode.value === "dark" ? "light" : "dark"
});

const icons = { sun: "ph:sun-duotone", moon: "ph:moon-duotone" };

const nav = ref<{ label: string, to?: string, target?: string, icon?: string, click?: () => void }[][]>([[], [
  { label: "", icon: "ph:circle-dashed-thin", click: () => dark.value = !dark.value }
]]);

onMounted(() => {
  watch(dark, (val) => {
    if (nav.value.length)
      nav.value[1]![0]!.icon = val ? icons.moon : icons.sun;
  }, { immediate: true });
});
</script>

<template>
  <UHorizontalNavigation :links="nav" class="container mx-auto px-2 pt-2 dark:border-gray-600" />
  <div id="layout" class="xl:container mx-auto text-center px-2 py-5 overflow-hidden">
    <slot />
  </div>
</template>
