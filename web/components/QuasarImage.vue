<template>
  <figure class="q-py-md">
    <QImg
      :src
      :style="{ maxHeight: maxHeight ? maxHeight + 'px' : undefined }"
      fit="scale-down"
    />
    <figcaption class="text-caption text-center text-italic text-grey-6">
      <slot />
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
defineProps<{
  src: string;
  maxHeight?: number;
}>();
</script>

<style scoped></style>
