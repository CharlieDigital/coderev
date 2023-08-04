<template>
  <QLayout view="lHh lpr lFf" container>
    <QHeader>
      <QToolbar :class="[dark ? 'bg-dark text-white' : 'bg-white text-black']">
        <QToolbarTitle>
          {{ selectedSourceFile ? selectedSourceFile.name : "Select a file" }}
        </QToolbarTitle>
      </QToolbar>
    </QHeader>
    <QPageContainer>
      <QPage>
        <Codemirror
          ref="editor"
          v-model="code"
          :extensions="extensions"
          :selection="editorSelection"
          :tab-size="2"
          :style="editorStyle"
          :disabled="!editable"
          @ready="handleEditorReady"
          @update:model-value="handleUpdateCode"
          @update="handleUpdate"
        />
        <QInnerLoading :showing="loadingCode" />
      </QPage>
    </QPageContainer>
  </QLayout>
</template>

<script setup lang="ts">
import { Codemirror } from "vue-codemirror";
import { ViewUpdate } from "@codemirror/view";
import { EditorState, EditorSelection } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { csharp } from "@replit/codemirror-lang-csharp";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { sql } from "@codemirror/lang-sql";
import { php } from "@codemirror/lang-php";
import { rust } from "@codemirror/lang-rust";
import { html } from "@codemirror/lang-html";
import { java } from "@codemirror/lang-java";
import { vue } from "@codemirror/lang-vue";
import { sass } from "@codemirror/lang-sass";
import { css } from "@codemirror/lang-css";
import { xml } from "@codemirror/lang-xml";
import { EditorView } from "codemirror";
import { StreamLanguage } from '@codemirror/language';
import { go } from '@codemirror/legacy-modes/mode/go';
import { clike } from '@codemirror/legacy-modes/mode/clike'
import { julia } from '@codemirror/legacy-modes/mode/julia'
import { swift } from '@codemirror/legacy-modes/mode/swift'
import { dracula, tomorrow } from "thememirror";
import { SourceFile, SourceSelection } from "../../../shared/viewModels";

const props = defineProps<{
  editable: boolean;
  selectedSourceFile?: SourceFile;
}>();

const emits = defineEmits<{
  editSourceFile: [];
}>();

const $q = useQuasar();

const defaultText = `This is the instruction file.

You can edit this file to provide instructions to your candidate.

Drag and drop source files to add them on the left.

The following file extensions are supported: ${ALLOWED_CODE_FILE_EXTENSIONS.join(", ")}`;

const { dark } = storeToRefs(useAppStore());

const { selectedComment, selection } = storeToRefs(useWorkspaceStore());

const code = ref(defaultText);

const editorSelection = ref<EditorSelection>();

const selectedLineRange = ref<{ start: number; end: number } | undefined>();

const loadingCode = ref(false);

const editorView = shallowRef<EditorView>();

const editorState = shallowRef<EditorState>();

const language = computed(() => {
  if (!props.selectedSourceFile) {
    return undefined;
  }

  const ext = props.selectedSourceFile.ext;

  switch (ext) {
    case ".cs":
      return csharp();
    case ".c":
    case ".cpp":
      return cpp();
    case ".java":
      return java();
    case ".html":
      return html();
    case ".sql":
      return sql();
    case ".py":
      return python();
    case ".rs":
      return rust();
    case ".php":
      return php();
    case ".md":
      return markdown();
    case ".ts":
    case ".tsx":
    case ".jsx":
    case ".js":
      return javascript();
    case ".json":
      return json();
    case ".vue":
      return vue();
    case ".css":
    case ".scss":
      return css();
    case ".sass":
      return sass();
    case ".xml":
    case ".xhtml":
    case ".xsl":
    case ".xslt":
      return xml();
    case ".scala":
      return StreamLanguage.define(clike({ name: "scala"}))
    case ".kt":
      return StreamLanguage.define(clike({ name: "kotlin"}))
    case ".dart":
      return StreamLanguage.define(clike({ name: "dart"}))
    case ".jl":
      return StreamLanguage.define(julia)
    case ".swift":
      return StreamLanguage.define(swift)
    case ".go":
      return StreamLanguage.define(go)
  }

  return undefined;
});

// Codemirror extensions
const extensions = computed(() => {
  const ext = [
    //EditorView.lineWrapping,
    //EditorView.editable.of(false),
    $q.dark.isActive ? dracula : tomorrow,
  ];

  if (!!language.value) {
    ext.push(language.value);
  }

  return ext;
});

const editorStyle = computed(() => {
  return {
    fontSize: ".8rem",
    // borderWidth: '1px',
    // borderStyle: 'solid',
    // borderColor: $q.dark.isActive ? '#666' : '#ddd',
  };
});

/**
 * When the selected source file changes, we will load the text from the source
 * file into the editor by updating the code ref.
 */
watch(
  () => props.selectedSourceFile,
  async (f) => {
    if (!f) {
      return;
    }

    if (f.text === "" && f.ref && f.ref.path) {
      // Load the text from the ref.
      loadingCode.value = true;

      const text = await sourceStorage.readText(f.ref.path);

      code.value = text;

      loadingCode.value = false;
    } else if (f.text !== "") {
      code.value = f.text;
    } else {
      code.value = defaultText;
    }
  }
);

/**
 * Watches for changes in the selected line range and highlights the lines.
 */
watch(selectedComment, (comment) => {
  if (!comment || !comment.sourceRange || comment.sourceRange.length < 1) {
    selectedLineRange.value = undefined;

    return;
  }

  const range = {
    start: comment.sourceRange[0],
    end: comment.sourceRange.length < 2 ? comment.sourceRange[0] : comment.sourceRange[1],
  };

  // Capture the line range; the change in the code editor will trigger the
  // update of the selection.
  selectedLineRange.value = range;
});

/**
 * Grab a handle to the view and state for manipulating the editor.
 */
function handleEditorReady({ view, state }: { view: EditorView; state: EditorState }) {
  editorView.value = view;
  editorState.value = state;
}

/**
 * Triggered when the code is updated in the editor by the user typing.
 */
function handleUpdateCode() {
  if (!props.selectedSourceFile || !props.editable) {
    return;
  }

  props.selectedSourceFile.text = code.value;

  emits("editSourceFile");
}

/**
 * Handles the view update event which includes changes in line selection.
 *
 * See: https://discuss.codemirror.net/t/how-to-get-selected-content-in-v6/4888
 * @param e The view update event.
 */
function handleUpdate(e: ViewUpdate) {
  // We want to handle explicit selection change.
  if (e.selectionSet) {
    const { from, to } = e.state.selection.main;

    editorView.value = e.view;
    editorState.value = e.state;

    const fromLine = e.view.state.doc.lineAt(from).number;
    const toLine = e.view.state.doc.lineAt(to).number;

    if (
      fromLine !== selectedLineRange.value?.start &&
      toLine !== selectedLineRange.value?.end
    ) {
      selectedComment.value = undefined;
    }

    debouncedSourceSelect({
      sourceUid: props.selectedSourceFile?.ref?.uid ?? "Unknown",
      sourceName: props.selectedSourceFile?.ref?.title ?? "Unknown",
      from: from,
      to: to,
      fromLine: fromLine,
      toLine: toLine,
    });
  } else {
    if (!selectedLineRange.value) {
      return;
    }

    try {
      const f = e.state.doc.line(selectedLineRange.value.start).from ?? 0;
      const t = e.state.doc.line(selectedLineRange.value.end).to ?? 0;

      console.log("Dispatching selection on source update");

      // Dispatch the selection of the lines
      e.view.dispatch({
        selection: EditorSelection.create([EditorSelection.range(0, 0)]),
        scrollIntoView: true,
      }, {
        selection: EditorSelection.create([EditorSelection.range(f, t)]),
        scrollIntoView: true,
      });
    } catch (e) {
      // If the source update hasn't occurred yet, this may cause a line
      // misalignment error.
      // console.warn(e)
    }
  }
}

/**
 * Trigger the update to the store at a debounced interval.
 */
const debouncedSourceSelect = useDebounceFn((s: SourceSelection) => {
  selection.value = s;
}, 250);
</script>

<style scoped>
:deep(.cm-content) {
  font-family: Menlo, Monaco, Lucida Console, monospace
}
</style>
