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
</template>

<script setup lang="ts">
import { defaultCandidate } from "../../../../stores/composables/candidates";
const route = useRoute();

const { profile } = storeToRefs(useAppStore());

const workspaceStore = useWorkspaceStore();

const { candidate, selection, selectedComment } = storeToRefs(workspaceStore);

const split = ref(75);

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
</script>

<style scoped>
:deep(.q-splitter__panel) {
  height: 100vh;
}
</style>
