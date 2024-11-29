<script setup lang="ts">
const { params } = useRoute("site");
const { site } = params;
</script>

<template>
  <main>
    {{ site }}
  </main>
</template>
