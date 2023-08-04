<template>
  <SideDialogShell
    position="right"
    title="Preferences"
    :icon="tabSettings2"
    :visible="visible"
    @close="handleClose"
  >
    <QItem
      class="rounded-borders"
      :class="[dark ? 'bg-grey-10' : 'bg-grey-3']">
      <QItemSection avatar>
        <QIcon :name="tabUser" />
      </QItemSection>
      <QItemSection>
        <QItemLabel class="text-body1 text-bold">{{ profile.displayName ?? profile.name }}</QItemLabel>
        <QItemLabel class="text-caption">{{ profile.email }}</QItemLabel>
      </QItemSection>
    </QItem>

    <QInput
      v-model="displayName"
      label="Display name"
      class="q-mt-md"
      @blur="updateDisplayName"
      outlined/>

    <p class="text-bold q-mt-lg q-mb-sm">Notification options</p>
    <p>Let us know if we can reach out to you!</p>

    <QCheckbox
      v-model="receiveEmails"
      color="accent"
      label="It's OK to occasionally notify me via email with the latest updates for CodeRev.app."
    />

    <QCheckbox
      v-model="receiveFeedbackRequests"
      color="accent"
      label="It's OK to occasionally contact me via email for my feedback for CodeRev.app."
      class="q-mt-md"
    />

    <QBtn
      label="Update"
      color="accent"
      class="q-mt-lg full-width"
      :icon="tabDeviceFloppy"
      :disable="profile.name.length < 2"
      @click="updateProfile"
      unelevated
      no-caps
    />
  </SideDialogShell>
</template>

<script setup lang="ts">
import {
  tabDeviceFloppy,
  tabSettings2,
  tabUser,
} from "quasar-extras-svg-icons/tabler-icons";

defineProps<{
  visible: boolean;
}>();

const emits = defineEmits<{
  close: [];
}>();

const { profile, dark } = storeToRefs(useAppStore());

const { receiveEmails, receiveFeedbackRequests, updateNotificationOptions } =
  useProfileOptions(profile);

const displayName = computed({
  get() {
    return profile.value.displayName ?? profile.value.name
  },
  set(val) {
    profile.value.displayName = val
  }
})

let originalProfileName = "";

watch(profile, (p) => {
  if (p.uid === defaultProfile.uid) {
    return
  }

  originalProfileName = p.displayName ?? p.name
})

/**
 * Performs the update of the profile properties.
 */
async function updateProfile() {
  await updateNotificationOptions();
  emits("close");
}

/**
 * Explicitly handle the close.  If the user profile doesn't have notifications
 * preferences set, we force a default of false.
 */
async function handleClose() {
  if (!profile.value.receiveEmails) {
    await updateNotificationOptions();
  }

  emits("close");
}

/**
 * Updates the user's display name on blur.
 */
async function updateDisplayName() {
  if (displayName.value.trim() === originalProfileName.trim()) {
    return // Didn't change.
  }

  await profileRepository.updateFields(profile.value.uid, {
    displayName: displayName.value
  })
}
</script>

<style scoped></style>
