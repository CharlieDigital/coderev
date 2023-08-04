<template>
  <div>
    <QCard
      class="rounded-borders cursor-pointer"
      :class="
        selectedComment?.uid === comment.uid
          ? dark
            ? 'bg-purple-10'
            : 'bg-purple-10 text-white'
          : undefined
      "
      :bordered="dark"
      @click="showComment(comment)"
    >
      <QCardSection
        class="q-pt-none"
        :class="[commentStates[comment.uid] ? 'q-pb-none' : undefined]"
      >
        <QItem class="q-pa-none">
          <QItemSection class="text-caption">
            <QItemLabel lines="1">
              <span class="text-bold"
                >{{ resolveSourceName(comment.contextUid) }}
              </span>
            </QItemLabel>
            <QItemLabel>
              <span class="text-italic">
                {{ renderSourceRange(comment.sourceRange) }}</span
              >
            </QItemLabel>
          </QItemSection>
          <QItemSection v-if="profile.uid === comment.author.uid" side>
            <QBtn size="sm" :icon="tabDots" @click.stop rounded flat dense>
              <QMenu anchor="top right" self="top right" auto-close>
                <QList>
                  <QItem v-close-popup clickable>
                    <QItemSection avatar>
                      <QAvatar :icon="tabX" size="md" font-size="0.8em" />
                    </QItemSection>
                    <QItemSection> Cancel </QItemSection>
                  </QItem>

                  <QItem @click="editComment(comment)" clickable>
                    <QItemSection avatar>
                      <QAvatar :icon="tabPencil" size="md" font-size="0.8em" />
                    </QItemSection>
                    <QItemSection> Edit </QItemSection>
                  </QItem>

                  <QItem @click="deleteComment(comment)" clickable>
                    <QItemSection avatar>
                      <QAvatar :icon="tabTrash" size="md" font-size="0.8em" />
                    </QItemSection>
                    <QItemSection> Delete </QItemSection>
                  </QItem>
                </QList>
              </QMenu>
            </QBtn>
          </QItemSection>
          <QItemSection side style="padding-left: 4px !important">
            <QBtn
              size="sm"
              :icon="
              commentStates[comment.uid] ? tabChevronDown : tabChevronUp
              "
              @click.stop="handleToggleCollapse"
              rounded
              flat
              dense
            />
          </QItemSection>
        </QItem>
        <!-- Text portion that can be hidden -->
        <QSlideTransition>
          <div v-show="!commentStates[comment.uid]">
            <template v-if="editCommentUid === comment.uid">
              <QInput
                v-model="editCommentText"
                color="purple-4"
                :bg-color="dark ? 'grey-10' : 'white'"
                autogrow
                outlined
              />
              <div class="text-right q-my-xs">
                <QBtn
                  :icon="tabX"
                  @click.stop="editCommentUid = ''"
                  rounded
                  dense
                  flat
                />
                <QBtn
                  :icon="tabDeviceFloppy"
                  :disable="
                    editCommentText.trim().length === 0 ||
                    editCommentText === comment.text
                  "
                  @click.stop="saveCommentEdits"
                  rounded
                  dense
                  flat
                />
              </div>
            </template>
            <QItemLabel v-else class="q-mb-md comment-body">
              <VueMarkdown :source="comment.text"></VueMarkdown>
            </QItemLabel>
            <QItemLabel class="text-caption">
              <span class="text-bold">{{ comment.author.name }}</span>
              &mdash;
              <span>{{ $dayjs.utc(comment.author.addedUtc).fromNow() }}</span>
            </QItemLabel>
          </div>
        </QSlideTransition>
      </QCardSection>
    </QCard>
  </div>
</template>

<script setup lang="ts">
import {
  tabChevronDown,
  tabChevronUp,
  tabDeviceFloppy,
  tabDots,
  tabPencil,
  tabTrash,
  tabX,
} from "quasar-extras-svg-icons/tabler-icons";
import VueMarkdown from "vue-markdown-render";
import { deleteField } from 'firebase/firestore';
import { ReviewComment } from '../../../shared/domainModels';

const props = defineProps<{
  comment: ReviewComment,
  commentStates: Record<string, boolean>
}>()

const emits = defineEmits<{
  collapse: [],
  expand: []
}>()

const { dark, profile } = storeToRefs(useAppStore());

const workspaceStore = useWorkspaceStore();

const { candidate, selection, selectedComment } = storeToRefs(workspaceStore);

const editCommentText = ref("")

const editCommentUid = ref("")

/**
 * Renders a source range.
 * @param range The array of line numbers
 */
 function renderSourceRange(range?: number[]) {
  if (!range || range.length === 0) {
    return "";
  }

  if (range.length === 1 || range[0] === range[1]) {
    return `Line ${range[0]}`;
  }

  return `Lines ${range[0]} - ${range[1]}`;
}

/**
 * Resolves the name of the source file based on the UID.
 * @param uid The UID of the context of the comment.
 */
function resolveSourceName(uid: string) {
  return candidate.value.sources[uid]?.title ?? "";
}

/**
 * Handles the event when the user clicks to toggle the state of the comment.
 */
function handleToggleCollapse() {
  if (props.commentStates[props.comment.uid]) {
    emits("expand")
  } else {
    emits("collapse")
  }
}

/**
 * Shows the file and line selection represented by the comment in the source files.
 * @param comment The comment to show in the source files.
 */
 function showComment(comment: ReviewComment) {
  selectedComment.value = comment;

  emits("expand")

  if (!comment.sourceRange || comment.sourceRange.length === 0) {
    return;
  }

  selection.value = {
    sourceUid: comment.contextUid,
    sourceName: resolveSourceName(comment.contextUid),
    from: 0,
    to: 0,
    fromLine: comment.sourceRange[0],
    toLine:
      comment.sourceRange.length === 2
        ? comment.sourceRange[1]
        : comment.sourceRange[0],
  };
}

/**
 * Edits the selected comment.
 * @param comment Prepares the comment for editing.
 */
 async function editComment(comment: ReviewComment) {
  editCommentUid.value = comment.uid
  editCommentText.value = comment.text
}

/**
 * Saves the comment edits.
 */
async function saveCommentEdits() {
  if (editCommentText.value.trim().length === 0
    || editCommentUid.value.length === 0) {
      return
    }

  await candidateReviewRepository.updateFields(
    candidate.value.uid, {
      [`comments.${editCommentUid.value}.text`]: editCommentText.value
    })

  editCommentUid.value = ""
  editCommentText.value = ""
}

/**
 * Deletes the selected comment.
 * @param comment The comment to delete.
 */
async function deleteComment(comment: ReviewComment) {
  if (!candidate.value || candidate.value.uid === defaultCandidate.uid) {
    return
  }

  await candidateReviewRepository.updateFields(
    candidate.value.uid, {
      [`comments.${comment.uid}`]: deleteField()
    })
}
</script>

<style scoped></style>
