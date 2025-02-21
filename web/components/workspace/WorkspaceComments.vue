<template>
  <div class="q-pa-sm column full-height">
    <!-- Top hint -->
    <div class="text-right col-shrink">
      <QChip
        class="text-caption"
        :icon="tabMarkdown"
        :label="`${$q.platform.is.mac ? 'CMD⌘+ENTER' : 'ALT+ENTER'} to save markdown`"
      />
    </div>

    <!-- Input for a new comment -->
    <div class="col-shrink">
      <QInput
        v-model="newComment"
        type="textarea"
        color="purple-4"
        :disable="!selection"
        :label="!selection ? 'Select a file and source lines to add comments' : undefined"
        :bg-color="dark ? 'grey-10' : 'purple-1'"
        @keydown.enter="addComment"
        outlined
      />
    </div>

    <!-- Displays the selected file and line number -->
    <QItem class="q-px-none col-shrink full-width">
      <QItemSection avatar>
        <QAvatar :icon="tabFileCode" />
      </QItemSection>
      <QItemSection>
        <QItemLabel class="text-bold" lines="1">
          {{ selection?.sourceName }}
        </QItemLabel>
        <QItemLabel v-if="selection?.fromLine !== selection?.toLine" class="text-caption">
          Active lines:
          <strong>{{ selection?.fromLine }} - {{ selection?.toLine }}</strong>
        </QItemLabel>
        <QItemLabel v-else class="text-caption">
          Active line: <strong>{{ selection?.fromLine ?? "1" }}</strong>
        </QItemLabel>
      </QItemSection>
      <QItemSection side>
        <QBtn
          color="accent"
          :icon="tabMessagePlus"
          :disable="newComment.trim().length === 0"
          @click="addComment()"
        />
      </QItemSection>
    </QItem>

    <!-- Toolbar in the middle; place actions for the comment listing here -->
    <QToolbar class="col-shrink q-px-none">
      <QToggle
        v-model="onlySelectedFile"
        :label="
          filteredComments.length === comments.length
            ? 'Showing all'
            : `Current file (${filteredComments.length}/${comments.length})`
        "
        class="q-ml-xs text-grey-6 text-caption"
        color="deep-purple-5"
        size="xs"
        dense
      />
      <QSpace />
      <QBtn :icon="tabChevronUp" @click="collapseComments(true)" flat dense />
      <QBtn :icon="tabChevronDown" @click="collapseComments(false)" flat dense />
    </QToolbar>

    <!-- Bottom scroll area which contains the comments -->
    <QScrollArea class="col">
      <QScrollObserver @scroll="handleScroll" debounce="25"> </QScrollObserver>

      <div
        class="q-gutter-md q-mt-sm"
        v-if="
          filteredComments.length !== comments.length ||
          (!onlySelectedFile && comments.length > 0)
        "
      >
        <WorkspaceCommentCard
          v-for="comment in filteredComments"
          :comment-states="commentCollapsed"
          :comment="comment"
          @expand="commentCollapsed[comment.rootComment.uid] = false"
          @collapse="commentCollapsed[comment.rootComment.uid] = true"
        />
      </div>
      <p class="q-pa-md text-grey-6" v-else-if="comments.length === 0">
        No comments yet; highlight lines in any file to add your comment.
      </p>
      <p v-else class="q-pa-md text-grey-6">No comments in the selected file.</p>

      <QBtn
        ref="topBtn"
        v-show="showBackToTop"
        :icon="tabArrowUp"
        v-bind="btnProps"
        class="full-width q-mt-md"
        label="Back to top"
        color="accent"
        @click="scrollToTop"
        unelevated
      />
    </QScrollArea>
  </div>
</template>

<script setup lang="ts">
import { tabMessagePlus } from "quasar-extras-svg-icons/tabler-icons-v2";
import type { ReviewComment } from "../../../shared/domainModels";
import type { CommentChain } from "../../../shared/viewModels";
import {
  tabArrowUp,
  tabChevronDown,
  tabChevronUp,
  tabFileCode,
  tabMarkdown,
} from "quasar-extras-svg-icons/tabler-icons";
import { QBtn, scroll } from "quasar";
import { btnProps } from "../../utils/commonProps";
import { modifier } from "~/composables/useCommandPalette";

const $q = useQuasar();

const { getScrollTarget, setVerticalScrollPosition } = scroll;

const topBtn = ref<QBtn>();

const dayjs = useDayjs();

const { dark, profile } = storeToRefs(useAppStore());

const workspaceStore = useWorkspaceStore();

const { candidate, selection, selectedSourceFile } = storeToRefs(workspaceStore);

const newComment = ref("");

const onlySelectedFile = ref(false);

const commentCollapsed = reactive<Record<string, boolean>>({});

const showBackToTop = ref(false);

const comments = computed<CommentChain[]>(() => {
  const replies: Record<string, ReviewComment[]> = {};

  Object.values(candidate.value.comments).reduce((acc, comment) => {
    if (comment.contextType === "source") {
      return acc; // This is a top level comment
    }

    if (!acc[comment.contextUid]) {
      acc[comment.contextUid] = [];
    }

    acc[comment.contextUid].push(comment); // Push a reply

    return acc;
  }, replies);

  return (
    Object.values(candidate.value.comments)
      // Only the source level comments and not a response comment.
      .filter((c) => c.contextType === "source")
      // Sort by the date added.
      .sort(sortComments)
      // Now get the reply comments for each top level comment
      .map((c) => {
        return {
          rootComment: c,
          replyComments: replies[c.uid]?.sort(sortComments) ?? [],
        };
      })
  );
});

const filteredComments = computed(() =>
  comments.value.filter((c) => {
    if (onlySelectedFile.value) {
      return c.rootComment.contextUid === selectedSourceFile.value?.ref?.uid;
    }
    return true;
  })
);

function sortComments(a: ReviewComment, b: ReviewComment) {
  if (a.author.addedUtc < b.author.addedUtc) {
    return -1;
  } else if (a.author.addedUtc > b.author.addedUtc) {
    return 1;
  } else {
    return 0;
  }
}

/**
 * Adds the currently entered comment for this candidate workspace.
 */
async function addComment(e?: KeyboardEvent) {
  if (e) {
    console.log("MODIFIER IS:" + e.getModifierState(modifier));
    if (!e.getModifierState(modifier)) {
      console.log("NO MODIFIER");
      return true;
    }

    e.preventDefault(); // User pressed enter while holding Meta/Ctrl
  }

  const comment: ReviewComment = {
    uid: nanoid(6),
    text: newComment.value,
    sourceRange: [selection.value?.fromLine ?? 0, selection.value?.toLine ?? 0],
    contextType: "source",
    contextUid: selection.value?.sourceUid ?? candidate.value.uid,
    author: {
      name: profile.value.displayName ?? profile.value.name,
      uid: profile.value.uid,
      addedUtc: dayjs().utc().toISOString(),
      entityType: "user",
    },
  };

  await candidateReviewRepository.updateFields(candidate.value.uid, {
    [`comments.${comment.uid}`]: comment,
  });

  newComment.value = "";

  if (topBtn.value) {
    setVerticalScrollPosition(
      getScrollTarget(topBtn.value.$el),
      (topBtn.value.$el as HTMLElement).offsetTop,
      250
    );
  }
}

/**
 * Toggles the state of the comment expand/collapse
 * @param state True when collapsed
 */
function collapseComments(state: boolean) {
  comments.value.reduce((acc, c) => {
    acc[c.rootComment.uid] = state;
    return acc;
  }, commentCollapsed);
}

/**
 * Scrolls to the top of the comments.
 */
function scrollToTop() {
  if (topBtn.value) {
    setVerticalScrollPosition(getScrollTarget(topBtn.value.$el), 0, 250);
  }
}

/**
 * If the scroll is greater than 0, that means we have a scroll bar.
 * @param details The details about the scroll event.
 */
function handleScroll(details: {
  position: {
    /**
     * Scroll offset from top (vertical)
     */
    top: number;
    /**
     * Scroll offset from left (horizontal)
     */
    left: number;
  };
}) {
  showBackToTop.value = details.position.top > 100;
}
</script>

<style scoped>
:deep(.comment-body) pre code {
  font-size: 0.8rem;
}

:deep(.comment-body) code {
  font-size: 0.9rem;
}

:deep(.comment-body) strong {
  font-weight: 600;
}
</style>
