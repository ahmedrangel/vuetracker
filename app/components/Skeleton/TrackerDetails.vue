<template>
  <div class="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold tracking-tight">
    <Icon name="fa6-solid:circle-info" size="2rem" />
    <p>INFO</p>
  </div>
  <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
    <SkeletonTechCard />
    <SkeletonTechCard />
    <SkeletonTechCard />
    <SkeletonTechCard />
    <SkeletonTechCard />
    <SkeletonTechCard />
  </div>
  <div class="flex flex-col gap-5">
    <div class="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold tracking-tight">
      <Icon name="fa6-solid:plug" size="2rem" />
      <p>PLUGINS</p>
    </div>
    <div class="flex flex-wrap items-start gap-2">
      <SkeletonTechCardBasic />
      <SkeletonTechCardBasic />
    </div>
  </div>
  <div class="flex flex-col gap-5">
    <div class="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold tracking-tight">
      <Icon name="fa6-solid:cubes" size="2rem" />
      <p>NUXT MODULES</p>
    </div>
    <div class="flex flex-wrap items-start gap-2">
      <SkeletonTechCardBasic />
      <SkeletonTechCardBasic />
      <SkeletonTechCardBasic />
    </div>
  </div>
</template>
