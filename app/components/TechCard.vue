<script setup lang="ts">
defineProps<{
  title: string;
  value?: string;
  img?: string | null;
}>();
</script>

<template>
  <div class="flex flex-col w-full bg-gray-200 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden transition">
    <h6 class="self-start bg-gray-300 dark:bg-gray-700 px-3 py-1 rounded-br-xl rounded-bl-none rounded-tr-none text-xs tracking-tight uppercase leading-sm font-bold">{{ title }}</h6>
    <div class="flex justify-center items-center px-2 py-3 gap-1">
      <img v-if="img" class="w-7 h-7" :src="img">
      <p class="text-md font-bold tracking-tight">{{ value }}</p>
    </div>
  </div>
</template>
