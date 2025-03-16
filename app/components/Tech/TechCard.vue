<script setup lang="ts">
defineProps<{
  title: string;
  value?: string;
  icon?: string | null;
}>();
</script>

<template>
  <div class="flex flex-col w-full bg-neutral-200 dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 rounded-xl overflow-hidden transition">
    <h6 class="self-start bg-neutral-300 dark:bg-neutral-700 px-3 py-1 rounded-br-xl rounded-bl-none rounded-tr-none text-xs tracking-tight uppercase leading-sm font-bold">{{ title }}</h6>
    <div class="flex justify-center items-center px-2 py-3 gap-1">
      <Icon v-if="icon" :name="'vuetracker:' + icon" size="1.8rem" />
      <p class="text-base font-bold tracking-tight">{{ value }}</p>
    </div>
  </div>
</template>
