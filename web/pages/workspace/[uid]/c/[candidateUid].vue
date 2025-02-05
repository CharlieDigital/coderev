<template>
  <QSplitter v-model="split">
    <template #before>
      <WorkspaceFilesPanel
        v-if="candidate.uid !== defaultCandidate.uid"
        :source-refs="sources"
      />
    </template>
    <template #after>
      <WorkspaceComments />
    </template>
  </QSplitter>

  <WorkspaceRatingDialog
    :saving="savingRating"
    :existing-rating="existingRating"
    @save-rating="handleSaveRating"
  />
</template>

<script setup lang="ts">
import { defaultCandidate } from "../../../../stores/composables/candidates";
const route = useRoute();

const appStore = useAppStore();

const { profile } = storeToRefs(appStore);

const workspaceStore = useWorkspaceStore();

const { candidate, selection, selectedComment, workspace } = storeToRefs(workspaceStore);

const split = ref(75);

const savingRating = ref(false);

onBeforeMount(async () => {
  const workspaceUid = route.params.uid as string;
  const candidateUid = route.params.candidateUid as string;

  await workspaceStore.ensureWorkspace(workspaceUid);
  await workspaceStore.ensureCandidate(candidateUid);

  await workspaceStore.loadCandidates();
});

const sources = computed(() => {
  return Object.values(candidate.value.sources).sort((a, b) => {
    if ((a.title ?? "") > (b.title ?? "")) {
      return 1;
    } else if ((a.title ?? "") < (b.title ?? "")) {
      return -1;
    } else {
      return 0;
    }
  });
});

/**
 * Compute the existing rating for this candidate and current user
 */
const existingRating = computed(() => {
  const key = `${candidate.value.uid}__${profile.value.uid}`;

  return workspace.value.ratings?.[key];
});

watchEffect(async () => {
  if (!profile.value || profile.value.uid === defaultProfile.uid) {
    return;
  }

  // If the candidate loads this URL, they can see a limited workspace that doesn't
  // work correctly.  So if the user is candidate, we'll just redirect to the
  // review
  if (profile.value.email === candidate.value.email) {
    const target = `/review/${candidate.value.uid}`;
    console.log(`Navigating user to: ${target}`);
    await navigateTo(target);
  }
});

onMounted(() => {
  // Reset the selections
  selection.value = undefined;
  selectedComment.value = undefined;
});

/**
 * Handles saving the rating for the candidate.
 * @param rating The rating that the user assigned.
 */
async function handleSaveRating(rating: Partial<Rating>) {
  const author = appStore.getCurrentUserRef();

  rating.author = author;

  try {
    savingRating.value = true;

    if (typeof rating.clarity === "undefined") delete rating.clarity;
    if (typeof rating.thoroughness === "undefined") delete rating.thoroughness;
    if (typeof rating.depth === "undefined") delete rating.depth;

    await workspaceRepository.updateFields(workspace.value.uid, {
      [`ratings.${candidate.value.uid}__${author.uid}`]: rating,
    });
  } finally {
    savingRating.value = false;
  }
}
</script>

<style scoped>
:deep(.q-splitter__panel) {
  height: 100vh;
}
</style>
