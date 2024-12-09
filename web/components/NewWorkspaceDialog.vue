<template>
  <SideDialogShell
    position="right"
    title="Create workspace"
    :icon="tabHexagon"
    :visible="visible"
    @close="$emit('close')"
  >
    <div class="q-gutter-y-md">
      <QInput
        v-model="workspaceName"
        label="Name"
        hint="Candidates WILL see this; provide a descriptive name"
        :color="dark ? 'deep-purple-2' : 'accent'"
        autofocus
        outlined
      />

      <QInput
        v-model="workspaceDescription"
        label="Description"
        hint="Candidates WILL NOT see this; only internal collaborators"
        :color="dark ? 'deep-purple-2' : 'accent'"
        type="textarea"
        outlined
      />

      <QBtn
        v-bind="btnProps"
        class="full-width"
        color="accent"
        label="Create"
        :icon="tabPlus"
        :disable="
          workspaceName.trim().length === 0 ||
          workspaceDescription.trim().length === 0
        "
        @click="createWorkspace"
        unelevated
      />

      <p>
        A workspace is where you can add files that you'd like your candidates
        to review.
      </p>

      <p>
        Use a descriptive name like
        <strong>Senior Backend Engineer (Java + SQL)</strong> or
        <strong>Fullstack Engineer - React, TypeScript, Mongo</strong>. The
        candidates will see the name but not the description.
      </p>

      <p>
        Use the description to provide details to your internal team and notes
        for review.
      </p>
    </div>
  </SideDialogShell>
</template>

<script setup lang="ts">
import { tabHexagon, tabPlus } from "quasar-extras-svg-icons/tabler-icons-v2";
import { btnProps } from "../utils/commonProps";

defineProps<{
  visible: boolean;
}>();

defineEmits<{
  close: [];
}>();

const workspaceName = ref("");

const workspaceDescription = ref("");

const appStore = useAppStore();

const { profile, dark } = storeToRefs(appStore);

async function createWorkspace() {
  const workspace: Workspace = {
    uid: nanoid(16),
    name: workspaceName.value,
    description: workspaceDescription.value,
    collaborators: {
      [`${profile.value.uid}`]: {
        ...appStore.getCurrentUserRef(),
        ...{
          pending: false,
          role: "owner",
        },
      },
    },
    sources: {},
  };

  await workspaceRepository.create(workspace);

  navigateTo(`/workspace/${workspace.uid}`);
}
</script>

<style scoped>
strong {
  font-weight: bold;
}
</style>
