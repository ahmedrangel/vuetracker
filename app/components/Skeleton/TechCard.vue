<template>
  <div class="flex flex-col w-full border-2 animate-pulse bg-neutral-200 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 rounded-xl overflow-hidden transition">
    <USkeleton class="self-start bg-neutral-300 dark:bg-neutral-700 px-3 py-1 rounded-br-xl rounded-bl-none rounded-tr-none text-xs tracking-tight uppercase leading-sm font-bold h-6 w-24" />
    <div class="flex justify-center items-center px-2 py-3 gap-1">
      <USkeleton class="h-7 w-7 dark:bg-neutral-700" />
      <USkeleton class="w-16 h-4 dark:bg-neutral-700" />
    </div>
  </div>
</template>
