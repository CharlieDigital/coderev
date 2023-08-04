<template>
  <SideDialogShell
    position="right"
    title="Workspace team"
    :icon="tabUsersGroup"
    :visible="visible"
    @close="$emit('close')"
  >
    <h6>Active team</h6>

    <QList>
      <QItem
        v-for="collaborator of Object.values(workspace?.collaborators ?? {})"
      >
        <QItemSection>
          <QItemLabel class="text-body1 text-weight-bold">{{
            collaborator.name
          }}</QItemLabel>
          <QItemLabel>{{
            $dayjs.utc(collaborator.addedUtc).fromNow()
          }}</QItemLabel>
        </QItemSection>
        <!-- The role selection -->
        <QItemSection side>
          <QSelect
            v-model="collaborator.role"
            borderless
            :hide-dropdown-icon="!isOwnerRole"
            :disable="!isOwnerRole"
            :color="dark ? 'white' : 'accent'"
            :options="isOwnerRole ? ownerRoles : roles"
            @update:model-value="updateCollaboratorRole(collaborator)"
            dense
          >
          </QSelect>
        </QItemSection>
      </QItem>
    </QList>

    <h6>Add team member by email</h6>

    <QInput
      v-model="inviteEmail"
      label="Email address"
      :color="dark ? 'purple-3' : 'accent'"
      :error="errorMessage !== ''"
      :error-message="errorMessage"
      @keyup.enter="addCollaborator"
      outlined>
      <template #append>
        <QBtn
          color="accent"
          :icon="tabSend"
          :disable="inviteEmail.trim() === ''"
          @click="addCollaborator"
          unelevated/>
      </template>
    </QInput>
  </SideDialogShell>
</template>

<script setup lang="ts">
import { tabSend, tabUsersGroup } from "quasar-extras-svg-icons/tabler-icons-v2";
import { CollaboratorRef } from "../../../shared/domainModels";
import { where } from "firebase/firestore";

defineProps<{
  visible: boolean;
}>();

const dayjs = useDayjs()

const { dark, profile } = storeToRefs(useAppStore());

const { workspace } = storeToRefs(useWorkspaceStore());

const inviteEmail = ref("")

let lastEmail = ""

const errorMessage = ref("")

const ownerRoles = ["owner"];

const roles = ownerRoles.concat(["editor", "reviewer"]);

const currentCollaborator = computed(() => {
  if (!workspace) {
    return;
  }

  return Object.values(workspace.value?.collaborators ?? {}).find(
    (c) => c.uid === profile.value.uid
  );
});

const isOwnerRole = computed(() => {
  return ownerRoles.includes(currentCollaborator.value?.role ?? "");
});

watch(inviteEmail, (email) => {
  if (email !== lastEmail) {
    errorMessage.value = ""
  }
})

/**
 * Updates the collaborator ref and replaces it entirely.
 * @param collaborator The collaborator ref to update.
 */
async function updateCollaboratorRole(collaborator: CollaboratorRef) {
  if (!workspace.value) {
    return
  }

  await workspaceRepository.updateFields(workspace.value.uid, {
    [`collaborators.${collaborator.uid}`]: collaborator,
  });
}

/**
 * Adds a user by email address.  The user must already have a profile.
 */
 async function addCollaborator() {
  if (inviteEmail.value === "" || !workspace.value) {
    return
  }

  lastEmail = inviteEmail.value

  const collaborators = await profileRepository
    .findByFilter(where("email", "==", inviteEmail.value))

  if (collaborators.length === 0) {
    errorMessage.value = "There is no user profile with the email provided."
    return
  }

  const collaborator = collaborators[0]

  const collaboratorRef: CollaboratorRef = {
    uid: collaborator.uid,
    name: collaborator.name,
    role: 'editor',
    pending: false,
    entityType: 'user',
    addedUtc: dayjs.utc().toISOString()
  }

  await workspaceRepository.updateFields(workspace.value.uid, {
    [`collaborators.${collaborator.uid}`]: collaboratorRef
  })

  workspace.value.collaborators[collaborator.uid] = collaboratorRef

  errorMessage.value = ""
  inviteEmail.value = ""
}
</script>

<style scoped>
h6 {
  font-size: 1.1rem;
  margin-top: 8px;
  margin-bottom: 8px;
}
</style>
