<template>
  <SideDialogShell
    position="right"
    title="Add candidate review"
    :icon="tabUserCode"
    :visible="visible"
    @close="$emit('close')"
  >
    <QInput
      v-model="candidateEmail"
      label="Candidate email"
      :color="dark ? 'purple-3' : 'accent'"
      @keyup.enter="addCandidate"
      autofocus
      outlined
    >
      <template #append>
        <QBtn
          color="accent"
          :icon="tabSend"
          :disable="candidateEmail.trim().length === 0"
          @click="addCandidate"
          unelevated
        />
      </template>
    </QInput>

    <p class="q-mt-md">
      Add candidates by their email address. The email address should match
      their Google account or the email they used to sign up for GitHub.
    </p>

    <p class="q-mt-md">
      <strong>CodeRev does not automatically send emails.</strong> After
      creating the workspace, copy the candidate workspace URL and send it to
      them in an email or message.
    </p>
  </SideDialogShell>
</template>

<script setup lang="ts">
import { tabSend, tabUserCode } from "quasar-extras-svg-icons/tabler-icons-v2";
import { type MediaRef } from "../../../shared/models";

defineProps<{
  visible: boolean;
}>();

const emits = defineEmits<{
  close: [];
}>();

const { dark } = storeToRefs(useAppStore());

const { workspace } = storeToRefs(useWorkspaceStore());

const candidateEmail = ref("");

async function addCandidate() {
  if (candidateEmail.value.trim().length === 0 || !workspace.value) {
    return;
  }

  // We only copy the sources not marked as removed.
  const sources: Record<string, MediaRef> = {};

  let sourceCount = 0;

  Object.values(workspace.value.sources)
    .reduce((acc, s) => {
      acc[s.uid] = s;
      sourceCount++;
      return acc;
    }, sources);

  if (sourceCount === 0) {
    console.error("There were no source files.");
    return;
  }

  // Add the candidate onto the
  await candidateReviewRepository.create({
    uid: `${nanoid(16)}`,
    workspaceUid: workspace.value.uid,
    workspaceName: workspace.value.name,
    email: candidateEmail.value.trim(),
    sources: sources,
    comments: {},
    name: `${candidateEmail.value}`,
  });

  candidateEmail.value = "";

  emits("close");
}
</script>

<style scoped></style>
