<template>
  <QItem
    v-if="!editing"
    class="q-ma-sm q-px-none rounded-borders"
    :focused="selected"
    @click="emits('selected')"
    manual-focus
    clickable
    dense
  >
    <!-- Left icon for a file -->
    <QItemSection class="q-pr-sm" side>
      <QAvatar
        :icon="file.ref ? tabFileCheck : tabFileUpload"
        :color="
          dark
            ? file.ref
              ? 'deep-purple-4'
              : 'grey-4'
            : file.ref
            ? 'deep-purple-2'
            : 'grey-2'
        "
        :text-color="
          dark
            ? file.ref
              ? 'deep-purple-8'
              : 'grey-8'
            : file.ref
            ? 'deep-purple-6'
            : 'grey-6'
        "
        font-size="0.7em"
        rounded
        size="md"
      />
    </QItemSection>
    <!-- The file display name or actual name -->
    <QItemSection>
      <QItemLabel lines="1">{{ file.name }}</QItemLabel>
    </QItemSection>
    <!-- Right side buttons -->
    <QItemSection side>
      <div>
        <!-- Button to delete file -->
        <QBtn
          v-show="
            !file.ref &&
            file.name !== readmeName &&
            selected &&
            unsaved
          "
          color="red-8"
          :icon="tabTrash"
          @click="emits('remove')"
          dense
          flat
        />
        <!-- Button to edit file name -->
        <QBtn
          v-show="selected && allowEdit"
          color="deep-purple-4"
          :icon="tabPencil"
          @click="handleStartEditing"
          dense
          flat
          />
      </div>
    </QItemSection>
  </QItem>

  <!-- Control for editing a file name -->
  <QItem
    v-else
    class="q-ma-sm q-px-none">
    <QItemSection>
      <QInput
        ref="existingFileName"
        v-model="editedFileName"
        :label="`${editedFileName}${file.ext}`"
        :color="dark ? 'deep-purple-4' : 'accent'"
        @keyup.escape="handleCancelEdit"
        @keyup.enter="handleConfirmEditFileName"
        stack-label
        outlined
        autofocus
        dense>
        <template #after>
          <QBtn
            :icon="tabX"
            @click="handleCancelEdit"
            flat
            dense/>
        </template>

        <template #append>
          <QBtn
            :icon="tabFileCheck"
            :disable="(editedFileName?.trim().length ?? 0) === 0"
            @click="handleConfirmEditFileName"
            flat
            dense/>
        </template>
      </QInput>
    </QItemSection>
  </QItem>

</template>

<script setup lang="ts">
import type { SourceFile } from '../../../shared/viewModels';

import {
  tabPencil,
  tabFileCheck,
  tabFileUpload,
  tabTrash,
  tabX
} from "quasar-extras-svg-icons/tabler-icons";

const props = defineProps<{
  file: SourceFile,
  allowEdit: boolean,
  selected?: boolean,
  unsaved?: boolean
}>()

const emits = defineEmits<{
  selected: [],
  remove: [],
  changeName: [string]
}>()

const readmeName = ".README.md";

const { dark } = storeToRefs(useAppStore());

const editedFileName = ref<string|undefined>()

const editing = ref(false)

/**
 * When the selected file changes, we cancel out any edits
 */
 watch(() => props.selected, (currentlySelected) => {
  if (!currentlySelected) {
    handleCancelEdit()
  }
})

/**
 * Start editing by copying over the name of the file as default.
 */
function handleStartEditing() {
  editedFileName.value = props.file.name.substring(0, props.file.name.lastIndexOf('.'))
  editing.value = true
}

/**
 * User confirms the name change so we verify that the name is valid.  Need a method
 * here to handle name change on ENTER key press.
 */
async function handleConfirmEditFileName() {
  if (!editedFileName.value || (editedFileName.value?.length ?? 0) === 0) {
    return
  }

  await emits('changeName', editedFileName.value)

  handleCancelEdit()
}

/**
 * User cancels the edit or changes the selected item.
 */
function handleCancelEdit() {
  editing.value = false
  editedFileName.value = ''
}
</script>
