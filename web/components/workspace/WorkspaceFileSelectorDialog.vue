<template>
  <QDialog
    v-model="visible"
    transition-show="jump-down"
    transition-hide="jump-up"
    transition-duration="150"
  >
    <QCard style="min-width: 440px">
      <QCardSection class="q-pa-md">
        <QSelect
          v-model="selectedFile"
          placeholder="Jump to file"
          hint="↓ Down arrow to see file list; ESC to close"
          :option-value="(opt) => opt.item"
          input-debounce="0"
          popup-content-style=""
          :menu-offset="[0, 38]"
          :options="fuseFileResults"
          @filter="handleFilterResults"
          map-options
          emit-value
          autofocus
          use-input
          hide-selected
          hide-dropdown-icon
          options-dense
          borderless
          dense
        >
          <template #no-option>
            <QItem>
              <QItemSection>
                <QItemLabel class="text-italic text-grey-6">No match</QItemLabel>
              </QItemSection>
            </QItem>
          </template>

          <template #option="{ itemProps, opt, selected, toggleOption }">
            <QItem v-bind="itemProps" dense>
              <QItemSection>
                <QItemLabel
                  ><QIcon :name="tabFile" size="sm" color="grey-6" class="q-mr-md">
                    <QBadge
                      v-if="opt.item.commentCount && opt.item.commentCount > 0"
                      color="accent"
                      :label="opt.item.commentCount"
                      floating
                      transparent /></QIcon
                  >{{ opt.item.name }}</QItemLabel
                >
              </QItemSection>
            </QItem>
          </template>
        </QSelect>
      </QCardSection>
    </QCard>
  </QDialog>
</template>

<script setup lang="ts">
import { tabFile } from "quasar-extras-svg-icons/tabler-icons-v2";
import { useFuse } from "@vueuse/integrations/useFuse";

const visible = defineModel<boolean>({ required: true });

const props = defineProps<{
  files: SourceFile[];
}>();

const emits = defineEmits<{
  fileSelected: [fileId: string];
}>();

const selectedFile = ref<SourceFile>();

const inputSearchTerm = ref("");

watch(
  selectedFile,
  (file) => {
    if (!file) {
      return;
    }

    visible.value = false;

    emits("fileSelected", file.hash ?? file.name);
  },
  { flush: "post" }
);

const reactiveFiles = computed(() => props.files);

const { results: fuseFileResults } = useFuse(inputSearchTerm, reactiveFiles, {
  fuseOptions: {
    isCaseSensitive: false,
    minMatchCharLength: 1,
    threshold: 0.4,
    useExtendedSearch: false,
    keys: ["name"],
  },
  resultLimit: 6,
  matchAllWhenSearchEmpty: true,
});

function handleFilterResults(val: string, update: (callback: () => void) => void) {
  if (val === "") {
    update(() => {
      inputSearchTerm.value = "";
      update(() => {});
      return;
    });
  }

  inputSearchTerm.value = val;

  update(() => {});
}
</script>

<style scoped></style>
