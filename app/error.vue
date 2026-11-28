<script setup lang="ts">
import type { NuxtError } from "#app";

defineProps<{ error: NuxtError }>();
</script>

<template>
  <div class="flex items-center justify-center h-screen bg-default">
    <div class="rounded-0 bg-elevated p-10 shadow-lg border border-primary/30">
      <h1 class="text-5xl font-bold tracking-wider">Error <span class="text-primary">{{ error.status }}</span></h1>
      <p class="text-xl">An error occurred. {{ error.message || error.statusText || "error" }}</p>
      <p>Back: <NuxtLink to="/" class="underline hover:text-primary">{{ SITE.domain }}</NuxtLink></p>
    </div>
  </div>
</template>
