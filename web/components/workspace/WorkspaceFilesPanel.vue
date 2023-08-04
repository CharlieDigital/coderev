<template>
  <QSplitter v-model="split" class="split-container" :limits="[15, 30]">
    <template #before>
      <div class="fit" ref="dropZone">
        <QLayout view="lHh lpr lFf" container>
          <QHeader>
            <QToolbar
              :class="[dark ? 'bg-dark text-white' : 'bg-white text-black']"
            >
              <QToolbarTitle>Files</QToolbarTitle>

              <QBtnDropdown
                :icon="tabFilePlus"
                :color="dark ? 'deep-purple-4' : 'accent'"
                auto-close
                flat dense>
                <QList>
                  <QItem v-for="ext in fileExtensions"
                    @click="promptNewFile(ext)"
                    clickable>
                    <QItemSection>{{ ext }}</QItemSection>
                  </QItem>
                </QList>
              </QBtnDropdown>

              <QBtn
                v-show="isEditable  && !isReview"
                :color="dark ? 'deep-purple-4' : 'accent'"
                :icon="tabFileUpload"
                @click="() => open({ accept: ALLOWED_CODE_FILE_EXTENSIONS.join(',') })"
                flat
                dense
              />

              <QBtn
                v-show="hasUnsavedChanges && !isReview"
                class="q-ml-sm"
                :color="dark ? 'deep-purple-4' : 'accent'"
                :icon="tabDeviceFloppy"
                :loading="saving"
                @click="saveFiles"
                flat
                dense
              >
              </QBtn>
            </QToolbar>
          </QHeader>

          <QPageContainer>
            <QPage class="column">
              <QList class="col">
                <QItem
                  v-for="file in sourceFiles"
                  class="q-ma-sm q-px-none rounded-borders"
                  :focused="file.name === selectedSourceFile?.name"
                  :key="file.name"
                  @click="handleClickSourceFile(file)"
                  manual-focus
                  clickable
                  dense
                >
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
                  <QItemSection>
                    <QItemLabel lines="1">{{ file.name }}</QItemLabel>
                  </QItemSection>
                  <QItemSection
                    v-if="
                      !file.ref &&
                      file.name !== readmeName &&
                      file.name === selectedSourceFile?.name
                    "
                    side
                  >
                    <QBtn
                      v-if="!Object.values(sourceRefs).some(r => r.title === file.name)"
                      color="red-8"
                      :icon="tabTrash"
                      @click="handleRemoveSourceFile"
                      dense
                      flat
                    />
                  </QItemSection>
                </QItem>

                <!-- Control for adding a new file -->
                <QItem
                  v-if="newFileExt !== ''"
                  class="q-ma-sm q-px-none">
                  <QItemSection>
                    <QInput
                      ref="newFileInput"
                      v-model="newFileName"
                      :label="`${newFileName}${newFileExt}`"
                      :color="dark ? 'deep-purple-4' : 'accent'"
                      @keyup.escape="cancelNewFile"
                      @keyup.enter="confirmNewFile"
                      stack-label
                      outlined
                      dense>
                      <template #after>
                        <QBtn
                          :icon="tabX"
                          @click="cancelNewFile"
                          dense/>
                      </template>

                      <template #append>
                        <QBtn
                          :icon="tabFileCheck"
                          :disable="newFileName.trim().length === 0"
                          @click="confirmNewFile"
                          dense/>
                      </template>
                    </QInput>
                  </QItemSection>
                </QItem>
              </QList>

              <QBanner
                v-if="Object.keys(sourceRefs).length === 0 && isEditable && !isReview"
                class="col-shrink q-ma-sm"
                :class="[dark ? 'bg-grey-9' : 'bg-grey-3']"
                rounded
              >
                <template #avatar>
                  <QAvatar>
                    <QIcon :name="tabDragDrop" />
                  </QAvatar>
                </template>
                Drag and drop source files here to add them to your workspace.
              </QBanner>
              <QBanner
                v-if="isEditable && !isReview"
                class="col-shrink q-ma-sm"
                :class="[dark ? 'bg-grey-9' : 'bg-grey-3']"
                rounded
              >
                <template #avatar>
                  <QAvatar>
                    <QIcon :name="tabBulb" />
                  </QAvatar>
                </template>
                Editing and saving a file will only affect new candidate workspaces.
                Existing candidate workspaces reference the original file when it
                was created.
              </QBanner>
              <!-- Save button -->
              <QItem class="col-shrink q-px-sm" v-if="hasUnsavedChanges">
                <QBtn
                  v-bind="btnProps"
                  label="Save unsaved changes"
                  class="full-width"
                  color="accent"
                  :icon="tabDeviceFloppy"
                  @click="saveFiles"
                  unelevated
                />
              </QItem>
            </QPage>
          </QPageContainer>
        </QLayout>

        <QInnerLoading :showing="isOverDropZone && isEditable">
          <template #default>
            <QIcon :name="tabFileUpload" size="xl" />
            <p class="text-h6">Drop files</p>
          </template>
        </QInnerLoading>
      </div>
    </template>

    <template #after>
      <WorkspaceCodeEditor
        :selected-source-file="selectedSourceFile"
        :editable="isEditable"
        @edit-source-file="handleEditSourceFile"
      />
    </template>
  </QSplitter>
</template>

<script setup lang="ts">
import {
  tabBulb,
  tabDeviceFloppy,
  tabDragDrop,
  tabFileCheck,
  tabFileUpload,
tabX,
} from "quasar-extras-svg-icons/tabler-icons";
import { FieldValue } from "firebase/firestore";
import { SourceFile } from "../../../shared/viewModels";
import { Workspace } from "../../../shared/domainModels";
import { MediaRef } from "../../../shared/models";
import { tabFilePlus, tabTrash } from "quasar-extras-svg-icons/tabler-icons-v2";
import { QInput } from "quasar";

const props = defineProps<{
  sourceRefs: MediaRef[];
}>();

const newFileInput = ref<QInput>()

const defaultText = `This is the instruction file.

You can edit this file to provide instructions to your candidate.

Drag and drop source files to add them on the left.

The following file types are supported: ${ALLOWED_CODE_FILE_EXTENSIONS.join(", ")}`;

const readmeName = ".README.md";

const route = useRoute();

const split = ref(25);

const $q = useQuasar();

const dayjs = useDayjs();

const { dark } = storeToRefs(useAppStore());

const { workspace, candidate, selectedComment, selection } = storeToRefs(
  useWorkspaceStore()
);

const saving = ref(false);

// When this value is set, the user is adding a new file.
const newFileExt = ref("")

const newFileName = ref("")

const selectedSourceFile = ref<SourceFile>();

// Tracks the unsaved file contents.
const unsavedSourceFiles = ref<SourceFile[]>([]);

// Tracks the modified file UIDs.
const modifiedFileUids = ref<string[]>([]);

const dropZone = ref();

const { isOverDropZone } = useDropZone(dropZone, handleDrop);

const { open, onChange } = useFileDialog();

onMounted(() => {});

/**
 * Not editable if we are viewing it in the candidate view.
 * TODO: maybe want to allow different candidates to have different files?
 */
const isEditable = computed(() => !route.fullPath.includes("/c/"));

/**
 * In review mode; a candidate is reviewing the code and providing feedback.
 */
const isReview = computed(() => route.fullPath.includes('/review/'))

/**
 * A computed map of the source files from the media refs for this candidate review.
 */
const sourceFiles = computed(() => {
  const sources: SourceFile[] = [];

  // For each reference to a storage file, we'll create a source file which is a
  // view model projection of the actual file in storage.
  for (const entry of Object.entries(props.sourceRefs ?? {})) {
    const mediaRef = entry[1];

    if (
      modifiedFileUids.value.includes(mediaRef.uid) ||
      !!mediaRef.markAsRemovedUtc
    ) {
      continue; // This file has been modified so we're not going to show it.
    }

    sources.push({
      ext: mediaRef.ext,
      name: mediaRef.title ?? "Unknown",
      text: "", // Lazy load the text
      hash: mediaRef.uid, // UID is a SHA-1 hash.
      ref: mediaRef,
    });
  }

  const result = [...sources, ...unsavedSourceFiles.value];

  // Sort alphabetically.
  result.sort((a, b) => {
    if (a.name > b.name) {
      return 1;
    } else if (a.name > b.name) {
      return -1;
    } else {
      return 0;
    }
  });

  // Select the first file by default
  if (result.length > 0 && !selectedSourceFile.value) {
    selectedSourceFile.value = result[0];
  }

  // Combine the saved sources with the unsaved sources.
  return result;
});

const fileExtensions = computed(() => {
  return ALLOWED_CODE_FILE_EXTENSIONS
    .filter((ext) => ext.trim().length > 0)
    .sort();
});

/**
 * This returns true when there is at least one file that has not been saved.
 */
const hasUnsavedChanges = computed(() => {
  return unsavedSourceFiles.value.length > 0;
});

/**
 * Reacts the change in the files.
 */
onChange((files) => {
  handleDrop(Array.from(files ?? []));
});

/**
 * Watch changes on the refs; if there are no files, we'll add the default README
 */
watch(() => props.sourceRefs, (refs) => {
  console.log(`Workspace UID: ${workspace.value.uid}`)

  if (workspace.value.uid === defaultWorkspace.uid) {
    return
  }

  if (refs && refs.length === 0 && unsavedSourceFiles.value.length === 0) {
    console.log("Source refs changed; adding README.md to empty workspace.")
    unsavedSourceFiles.value.push({
      ext: ".md",
      name: readmeName,
      text: defaultText
    })
  }
}, {
  flush: 'sync', // We want this to execute synchronously
  immediate: true // If we don't add immediate, hot reload may not trigger this.
})

/**
 * When the selected comment changes, we may need to update the selected file. If
 * the file changes, the handleUpdate function will react to the change in the
 * editor and select the lines.  If the file does not change, we will manually
 * change the selection of the lines directly.
 */
watch(selectedComment, (comment) => {
  if (!comment) {
    return;
  }

  // Select the file based on the reference from the comment.
  const file = sourceFiles.value.find((f) => f.ref?.uid === comment.contextUid);

  if (!file) {
    return;
  }

  selectedSourceFile.value = file;
});

/**
 * When the candidate is loaded, we'll want to select the first file.
 */
watch(candidate, (c) => {
  if (sourceFiles.value.length > 0) {
    selectedSourceFile.value = sourceFiles.value[0];
  }
});

/**
 * Prompts the user for input name for a new file.
 */
function promptNewFile(ext: string) {
  newFileExt.value = ext

  window.setTimeout(
    () => newFileInput.value?.focus(),
    25
  )
}

/**
 * User cancels adding a new file
 */
function cancelNewFile() {
  newFileExt.value = ""
  newFileName.value = ""
}

/**
 * User confirms adding a new file.
 */
function confirmNewFile() {
  if (newFileName.value.trim().length === 0) {
    return;
  }

  const file: SourceFile = {
    name: newFileName.value,
    ext: newFileExt.value,
    text: newFileName.value,
  };

  unsavedSourceFiles.value.push(file);

  selectedSourceFile.value = file

  cancelNewFile()
}

/**
 * Handles the drop of the files.
 * @param files The files which were dropped
 */
function handleDrop(files: File[] | null) {
  if (!files || !isEditable.value) {
    return;
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (file.name.lastIndexOf(".") === -1) {
      warn(`The file "${file.name}" does not have an extension.`);
      continue;
    }

    if (unsavedSourceFiles.value.some((sf) => sf.name === file.name)) {
      continue;
    }

    const ext = file.name.substring(file.name.lastIndexOf("."));

    if (!ALLOWED_CODE_FILE_EXTENSIONS.includes(ext)) {
      warn(`The file extension "${ext}" isn't supported.`);
      continue;
    }

    // Read the contents of the file.
    const reader = new FileReader();

    reader.addEventListener("load", (event) => {
      const f = addSourceFile(
        file.name,
        (event.target?.result as string) ?? ""
      );

      if (i === files.length - 1) {
        selectedSourceFile.value = f;
      }
    });

    reader.readAsText(file);
  }
}

/**
 * Handles the click event on a source file on the left column.
 * @param file The user selected source file.
 */
function handleClickSourceFile(file: SourceFile) {
  selection.value = {
    sourceUid: file.ref?.uid ?? "Unknown",
    sourceName: file.ref?.title ?? "Unknown",
    from: 0,
    to: 0,
    fromLine: 1,
    toLine: 1,
  };

  console.log(`Selected source file: ${selection.value.sourceUid} ${selection.value.sourceName}`)

  selectedSourceFile.value = file;
  selectedComment.value = undefined;
}

/**
 * Adds a source file to the view.
 * @param name The name of the file.
 * @param text The text contents of the file.
 */
function addSourceFile(name: string, text: string) {
  if (!isEditable.value) {
    return;
  }

  const ext = name.substring(name.lastIndexOf("."));

  const file: SourceFile = {
    name: name,
    ext: ext,
    text: text,
  };

  unsavedSourceFiles.value.push(file);

  return file;
}

/**
 * When the user edits a file, this handler is responsible for moving the file from
 * saved to unsaved.
 */
function handleEditSourceFile() {
  if (!selectedSourceFile.value || !selectedSourceFile.value.ref) {
    console.log("  ⮑ Source file doesn't have a ref")
    return;
  }

  // The file is already unsaved.
  if (
    unsavedSourceFiles.value.some(
      (f) => f.name === selectedSourceFile.value?.name
    )
  ) {
    console.log("  ⮑ Source file is in the unsaved files")
    return;
  }

  // We need to remove the file from the workspace sources record since
  // sourceFiles is a computed projection from that record.
  const entry = Object.entries(workspace.value.sources).find(
    (e) => e[1].title === selectedSourceFile.value?.name
      && !e[1].markAsRemovedUtc
  );

  if (!entry) {
    console.log(`  ⮑ There's no source file with the name: ${selectedSourceFile.value.name}`)
    return;
  }

  const file = { ...selectedSourceFile.value };

  delete file.ref;
  modifiedFileUids.value.push(entry[0]);

  selectedSourceFile.value = file;
  unsavedSourceFiles.value.push(file);
}

/**
 * Removes a source file from the workspace.
 * @param file The file to remove
 */
function handleRemoveSourceFile() {
  const index = unsavedSourceFiles.value.findIndex(
    (sf) => sf.name === selectedSourceFile.value?.name
  );

  if (index < 0) {
    return;
  }

  unsavedSourceFiles.value.splice(index, 1);
  selectedSourceFile.value =
    sourceFiles.value.length > 0
      ? sourceFiles.value[sourceFiles.value.length - 1]
      : undefined;
}

/**
 * Saves the new and changed files.  First to storage and then to the workspace
 * model.
 */
async function saveFiles() {
  if (!workspace.value) {
    return;
  }

  const changeset: { [P in keyof Workspace]?: Workspace[P] | FieldValue } = {
    sources: {},
  };

  saving.value = true;

  try {
    for (const file of unsavedSourceFiles.value) {
      if (file.ref) {
        continue;
      }

      // TODO: Check for hash changes as well
      const f = new File([file.text], file.name, {
        type: "text/plain",
      });

      // Upload to storage; the resultant UID is a hash of the file contents.
      const result = await sourceStorage.addSourceFile(workspace.value.uid, f);

      const sourceRef: MediaRef = {
        uid: result.uid,
        title: file.name,
        rank: "",
        ext: file.name.substring(file.name.lastIndexOf(".")),
        url: result.url,
        path: result.path,
        type: "document",
        addedUtc: dayjs.utc().toISOString(),
      };

      changeset.sources = {
        ...changeset.sources,
        ...{
          [`${result.uid}`]: sourceRef,
        },
      };

      file.ref = sourceRef;
      file.hash = sourceRef.uid;
    }

    if (Object.keys(changeset.sources ?? {}).length > 0) {
      // Mark the workspace sources as deleted on save.  Don't delete the backing
      // file since there may be references to it.  (TODO: optimize this)
      console.log("Modified: " + JSON.stringify(modifiedFileUids.value, null, 2))

      for (const modified of modifiedFileUids.value) {
        if (workspace.value.sources[modified]) {
          workspace.value.sources[modified].markAsRemovedUtc = dayjs
            .utc()
            .toISOString();

          console.log(`❌ Marked file ${modified} as removed.`)
        }
      }

      changeset.sources = {
        ...workspace.value.sources,
        ...changeset.sources,
      };

      unsavedSourceFiles.value
        .splice(0, unsavedSourceFiles.value.length)
        .filter((s) => !!s.ref)
        .map((s) => s.ref as MediaRef)
        .reduce((acc, ref) => {
          acc[`${ref.uid}`] = ref;
          return acc;
        }, workspace.value.sources);

      await workspaceRepository.updateFields(workspace.value.uid, {
        sources: changeset.sources,
      });
    }
  } catch (e) {
    console.error(e);
    warn("Failed to save your changes.");
  } finally {
    saving.value = false;
  }
}

function warn(message: string) {
  $q.notify({
    type: "warning",
    caption: message,
    timeout: 3000,
    position: "bottom-right",
  });
}
</script>

<style scoped>
.split-container {
  height: 100vh;
}
</style>
