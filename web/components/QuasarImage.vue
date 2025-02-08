<template>
  <figure class="q-py-md">
    <QImg :src :style="{ maxHeight: maxHeight }" fit="scale-down" />
    <figcaption class="text-caption text-center text-italic text-grey-6">
      <slot />
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
defineProps<{
  src: string;
  maxHeight?: string;
}>();
</script>

<style scoped></style>
