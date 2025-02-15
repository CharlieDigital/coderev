<template>
  <figure class="q-py-md">
    <QVideo
      :ratio="ratio ?? 16 / 9"
      :src
      :style="{ maxHeight: maxHeight }"
      fit="scale-down"
      class="rounded-borders"
    />
    <figcaption class="text-caption text-center text-italic text-grey-6">
      <slot />
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
defineProps<{
  src: string;
  maxHeight?: string;
  ratio?: number;
}>();
</script>

<style scoped></style>
