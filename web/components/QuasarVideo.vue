<template>
  <figure class="q-py-md" :class="[$q.screen.lt.sm ? 'q-mx-sm' : undefined]">
    <QVideo
      :ratio="ratio ? Number.parseFloat(ratio) : 16 / 9"
      :src
      :style="{ maxHeight: maxHeight }"
      fit="scale-down"
      class="rounded-borders"
    />
    <figcaption class="text-caption text-center text-italic text-grey-6 q-mt-sm">
      <slot />
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
defineProps<{
  src: string;
  maxHeight?: string;
  ratio?: string;
}>();

const $q = useQuasar();
</script>

<style scoped></style>
