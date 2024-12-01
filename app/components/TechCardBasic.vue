<script setup lang="ts">
defineProps<{
  value: string;
}>();
</script>

<template>
  <div class="bg-gray-200 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden px-4 py-2 transition">
    <p class="text-md font-bold tracking-tight">{{ value }}</p>
  </div>
</template>
