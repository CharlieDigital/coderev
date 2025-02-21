<template>
  <div style="padding-left: 2px; padding-right: 2px">
    <QCard
      class="rounded-borders cursor-pointer"
      :style="{
        border: `1px solid ${borderColor}`,
      }"
      :bordered="dark || !!selectedComment"
      @click="showComment(comment.rootComment)"
    >
      <QCardSection
        class="q-pt-none relative"
        :class="[commentStates[comment.rootComment.uid] ? 'q-pb-none' : undefined]"
      >
        <div
          v-show="isSelectedComment"
          class="absolute"
          style="top: 8px; left: 6px; width: 5px; height: 16px; border-radius: 4px"
          :style="{ background: borderColor }"
        ></div>
        <QItem class="q-pa-none">
          <QItemSection class="text-caption">
            <QItemLabel lines="1">
              <span class="text-bold"
                >{{ resolveSourceName(comment.rootComment.contextUid) }}
              </span>
            </QItemLabel>
            <QItemLabel>
              <span class="text-italic">
                {{ renderSourceRange(comment.rootComment.sourceRange) }}</span
              >
            </QItemLabel>
          </QItemSection>
          <QItemSection side>
            <QBtn
              size="sm"
              :icon="tabCornerDownRight"
              @click.stop="startingReply = true"
              rounded
              flat
              dense
            />
          </QItemSection>
          <QItemSection
            v-if="profile.uid === comment.rootComment.author.uid"
            style="padding-left: 4px !important"
            side
          >
            <QBtn size="sm" :icon="tabDots" @click.stop rounded flat dense>
              <QMenu anchor="top right" self="top right" auto-close>
                <QList>
                  <QItem v-close-popup clickable>
                    <QItemSection avatar>
                      <QAvatar :icon="tabX" size="md" font-size="0.8em" />
                    </QItemSection>
                    <QItemSection> Cancel </QItemSection>
                  </QItem>

                  <QItem @click="editComment(comment.rootComment)" clickable>
                    <QItemSection avatar>
                      <QAvatar :icon="tabPencil" size="md" font-size="0.8em" />
                    </QItemSection>
                    <QItemSection> Edit </QItemSection>
                  </QItem>

                  <QItem @click="deleteComment(comment.rootComment)" clickable>
                    <QItemSection avatar>
                      <QAvatar :icon="tabTrash" size="md" font-size="0.8em" />
                    </QItemSection>
                    <QItemSection> Delete </QItemSection>
                  </QItem>
                </QList>
              </QMenu>
            </QBtn>
          </QItemSection>
          <QItemSection style="padding-left: 4px !important" side>
            <QBtn
              size="sm"
              :icon="
                commentStates[comment.rootComment.uid] ? tabChevronDown : tabChevronUp
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
          <div v-show="!commentStates[comment.rootComment.uid]">
            <template v-if="editCommentUid === comment.rootComment.uid">
              <QInput
                v-model="editCommentText"
                color="purple-4"
                :bg-color="dark ? 'grey-10' : 'white'"
                autogrow
                outlined
              />
              <div class="text-right q-my-xs">
                <QBtn :icon="tabX" @click.stop="editCommentUid = ''" rounded dense flat />
                <QBtn
                  :icon="tabDeviceFloppy"
                  :disable="
                    editCommentText.trim().length === 0 ||
                    editCommentText === comment.rootComment.text
                  "
                  @click.stop="saveCommentEdits"
                  rounded
                  dense
                  flat
                />
              </div>
            </template>
            <QItemLabel v-else class="q-mb-md comment-body">
              <!-- The markdown editor for the comment -->
              <VueMarkdown :source="comment.rootComment.text"></VueMarkdown>
            </QItemLabel>
            <QItemLabel class="text-caption">
              <span class="text-bold">{{ comment.rootComment.author.name }}</span>
              &mdash;
              <span>{{
                $dayjs(comment.rootComment.author.addedUtc).utc().fromNow()
              }}</span>
            </QItemLabel>
          </div>
        </QSlideTransition>
      </QCardSection>

      <!-- User is adding a reply -->
      <template v-if="startingReply">
        <QSeparator />
        <QItem dense>
          <QItemSection>
            <QItemLabel class="text-caption">Add reply</QItemLabel>
          </QItemSection>
        </QItem>
        <QItem dense>
          <QInput
            v-model="replyText"
            color="purple-4"
            class="full-width"
            :bg-color="dark ? 'grey-10' : 'white'"
            autogrow
            outlined
          />
        </QItem>
        <div class="q-mr-md">
          <div class="text-right q-my-xs">
            <QBtn :icon="tabX" @click.stop="startingReply = false" rounded dense flat />
            <QBtn
              :icon="tabDeviceFloppy"
              :disable="replyText.trim().length === 0"
              @click.stop="addCommentReply"
              rounded
              dense
              flat
            />
          </div>
        </div>
      </template>

      <!-- Replies -->
      <template v-if="collapsed && comment.replyComments.length > 0">
        <QItem dense>
          <QItemSection side>
            <QIcon :name="tabCornerDownRight" />
          </QItemSection>
          <QItemSection>
            <QItemLabel class="comment-body">
              {{ comment.replyComments.length }}
              {{ comment.replyComments.length === 1 ? "reply" : "replies" }}
            </QItemLabel>
          </QItemSection>
        </QItem>
      </template>
      <template v-else v-for="reply in comment.replyComments">
        <QSeparator />
        <QItem>
          <QItemSection side>
            <QIcon :name="tabCornerDownRight" />
          </QItemSection>
          <QItemSection>
            <QItemLabel class="comment-body">
              <VueMarkdown :source="reply.text"></VueMarkdown>
            </QItemLabel>
            <QItemLabel class="text-caption">
              <span class="text-bold">{{ reply.author.name }}</span>
              &mdash;
              <span>{{ $dayjs(reply.author.addedUtc).utc().fromNow() }}</span>
            </QItemLabel>
          </QItemSection>
        </QItem>
      </template>
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
import { deleteField } from "firebase/firestore";
import type { ReviewComment } from "../../../shared/domainModels";
import type { CommentChain } from "../../../shared/viewModels";
import { tabCornerDownRight } from "quasar-extras-svg-icons/tabler-icons-v2";

const props = defineProps<{
  comment: CommentChain;
  commentStates: Record<string, boolean>;
}>();

const emits = defineEmits<{
  collapse: [];
  expand: [];
}>();

const collapsed = computed(() => {
  return props.commentStates[props.comment.rootComment.uid];
});

const appStore = useAppStore();

const { dark, profile } = storeToRefs(appStore);

const workspaceStore = useWorkspaceStore();

const { candidate, selection, selectedComment, selectedSourceFile } = storeToRefs(
  workspaceStore
);

const editCommentText = ref("");

const editCommentUid = ref("");

const startingReply = ref(false);

const replyText = ref("");

const isSelectedComment = computed(
  () => selectedComment.value?.uid === props.comment.rootComment.uid
);

const fromSelectedSourceFile = computed(
  () => selectedSourceFile.value?.ref?.uid === props.comment.rootComment.contextUid
);

const borderColor = computed(() => {
  if (fromSelectedSourceFile.value) {
    return "#7e57c2";
  }

  return dark.value ? "#494949" : "#ffffff";
});

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
  if (props.commentStates[props.comment.rootComment.uid]) {
    emits("expand");
  } else {
    emits("collapse");
  }
}

/**
 * Shows the file and line selection represented by the comment in the source files.
 * @param comment The comment to show in the source files.
 */
function showComment(comment: ReviewComment) {
  selectedComment.value = comment;

  emits("expand");

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
      comment.sourceRange.length === 2 ? comment.sourceRange[1] : comment.sourceRange[0],
  };
}

/**
 * Edits the selected comment.
 * @param comment Prepares the comment for editing.
 */
async function editComment(comment: ReviewComment) {
  editCommentUid.value = comment.uid;
  editCommentText.value = comment.text;
}

/**
 * Saves the comment edits.
 */
async function saveCommentEdits() {
  if (editCommentText.value.trim().length === 0 || editCommentUid.value.length === 0) {
    return;
  }

  await candidateReviewRepository.updateFields(candidate.value.uid, {
    [`comments.${editCommentUid.value}.text`]: editCommentText.value,
  });

  editCommentUid.value = "";
  editCommentText.value = "";
}

/**
 * Deletes the selected comment.
 * @param comment The comment to delete.
 */
async function deleteComment(comment: ReviewComment) {
  if (!candidate.value || candidate.value.uid === defaultCandidate.uid) {
    return;
  }

  await candidateReviewRepository.updateFields(candidate.value.uid, {
    [`comments.${comment.uid}`]: deleteField(),
  });
}

/**
 * Adds a comment reply to the current comment chain.
 */
async function addCommentReply() {
  const reply: ReviewComment = {
    uid: nanoid(6),
    text: replyText.value,
    contextType: "comment",
    contextUid: props.comment.rootComment.uid,
    author: appStore.getCurrentUserRef(),
  };

  await candidateReviewRepository.updateFields(candidate.value.uid, {
    [`comments.${reply.uid}`]: reply,
  });

  replyText.value = "";
  startingReply.value = false;
}
</script>

<style scoped></style>
