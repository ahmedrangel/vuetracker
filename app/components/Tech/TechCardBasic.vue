<script setup lang="ts">
defineProps<{
  value: string;
}>();
</script>

<template>
  <div class="bg-neutral-200 dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 rounded-xl overflow-hidden px-4 py-2 transition">
    <p class="text-base font-bold tracking-tight">{{ value }}</p>
  </div>
</template>
