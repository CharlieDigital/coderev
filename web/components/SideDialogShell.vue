<template>
  <QDialog
    v-model="model"
    :position="position"
    :maximized="$q.screen.lt.sm"
    :persistent="persistent"
    transition-duration="200"
    full-height>
    <QCard
      class="column full-height full-width no-wrap dialog-card"
      ref="dropZone"
      @paste="handlePaste"
      :style="
        $q.screen.lt.sm
          ? `min-width: ${$q.screen.width}px`
          : `min-width: ${widthPx ?? '480px'}`
      ">
      <QToolbar>
        <!-- Left side close button -->
        <QBtn
          :icon="tabX"
          @click="$emit('close')"
          flat
          dense/>
        <!-- The header text -->
        <QToolbarTitle>{{ title }}</QToolbarTitle>
        <QAvatar>
          <QIcon
            :name="icon"
            size="md" />
        </QAvatar>
      </QToolbar>
      <template v-if="fillHeight">
        <slot name="full-height-content"> </slot>
      </template>
      <QScrollArea
        v-else
        class="full-height">
        <QCardSection
          :class="noPadding ? 'q-px-none' : undefined"
          :style="{
            width: $q.screen.lt.sm
              ? `${$q.screen.width}px`
              : `${widthPx ?? '480px'}`,
          }">
          <slot>
            <!-- Contents Here -->
          </slot>

          <div
            class="full-width"
            :class="noPadding ? 'q-px-md' : undefined">
            <QBtn
              v-if="showClose"
              :icon="tabX"
              label="Close"
              class="full-width q-mt-md"
              @click="$emit('close')"
              flat
              no-caps />
          </div>
        </QCardSection>
      </QScrollArea>

      <QInnerLoading
        :showing="isOverDropZone">
        <template #default>
          <QIcon :name="tabFileUpload" size="xl"/>
          <p class="text-h6">Drop files</p>
        </template>
      </QInnerLoading>
    </QCard>
  </QDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { tabFileUpload, tabX } from 'quasar-extras-svg-icons/tabler-icons'

const props = withDefaults(
  defineProps<{
    title: string
    icon: string
    position?: 'left' | 'right'
    visible: boolean
    showClose?: boolean
    widthPx?: string
    fillHeight?: boolean
    helpUrl?: string
    noPadding?: boolean
    persistent?: boolean
  }>(),
  {
    position: 'right',
    showClose: true,
    persistent: false
  }
)

const emits = defineEmits<{
  close: [],
  attachFile: [file: File],
}>()

const appStore = useAppStore()

const dropZone = ref()

const { isOverDropZone } = useDropZone(dropZone, handleDrop)

const model = computed({
  get() {
    return props.visible
  },
  set() {
    emits('close')
  },
})

/**
 * Handles pasting of a file via the clipboard.
 * @param event The clipboard paste event.
 */
 function handlePaste(event: ClipboardEvent) {
  /* @ts-ignore */
  const clipboardData = event.clipboardData || window.clipboardData
  const items = clipboardData.items

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('application') !== -1) {
      const file = items[i].getAsFile()

      // Emit
      emits("attachFile", file)
    }
  }
}

/**
 * Handles the drop of the files.
 * @param files The files which were dropped
 */
function handleDrop(files: File[] | null) {
  if (!files) {
    return
  }

  for (let i = 0; i < files.length; i++) {
    if (files[i].type.indexOf('application') !== -1) {
      // Emit
      emits("attachFile", files[i])
    }
  }
}
</script>

<style scoped>
.dialog-card {
  box-shadow: 2px 2px 16px 8px rgba(0, 0, 0, 0.1);
}
</style>
