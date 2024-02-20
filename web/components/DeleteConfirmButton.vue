<template>
  <QBtn
    :icon="tabTrash"
    :dense="dense"
    @click.stop
    flat>
    <QMenu
      auto-close
      :self="self ?? 'top right'"
      :anchor="anchor ?? 'top right'">
      <QCard>
        <QCardSection>
          {{ message }}
        </QCardSection>
        <QCardActions align="center">
          <QBtn
            v-bind="btnProps"
            label="Delete"
            color="red-8"
            :icon="tabTrash"
            @click="emits('delete')"
            flat
          />
          <QBtn
            v-bind="btnProps"
            v-close-popup
            label="Cancel"
            :icon="tabX"
            flat
          />
        </QCardActions>
      </QCard>
    </QMenu>
  </QBtn>
</template>

<script setup lang="ts">
import { tabTrash, tabX } from 'quasar-extras-svg-icons/tabler-icons'

const props = defineProps<{
  message: string,
  dense?: boolean,
  anchor?: MenuPosition,
  self?: MenuPosition
}>()

const emits = defineEmits<{
  delete: []
}>()
</script>

<style scoped></style>
