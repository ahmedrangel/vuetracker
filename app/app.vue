<script setup lang="ts">
setScrollBehavior();
</script>

<template>
  <div>
    <NuxtLoadingIndicator :throttle="0" />
    <NavBar />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style lang="postcss">
.light {
  @apply bg-gray-100 text-gray-900;
}
.dark {
  @apply bg-gray-950 text-gray-50;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
