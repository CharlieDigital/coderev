<template>
  <SideDialogShell
    position="right"
    title="Add candidate"
    :icon="tabUserCode"
    :visible="visible"
    @close="visible = false"
  >
    <!-- Tabs -->
    <QTabs
      v-model="tab"
      :active-color="dark ? undefined : 'accent'"
      dense
      narrow-indicator
      no-caps
    >
      <QTab
        name="viaEmail"
        label="Require email"
        class="rounded-borders"
        :icon="tabUserCheck"
      />
      <QTab
        name="viaGen"
        label="Use generated"
        class="rounded-borders"
        :icon="tabUserCog"
      />
    </QTabs>

    <!-- Panels -->
    <QTabPanels v-model="tab" keep-alive animated>
      <!--
        Requires email
      -->
      <QTabPanel name="viaEmail" class="q-px-none">
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
              :icon="tabUserPlus"
              :disable="candidateEmail.trim().length === 0"
              :loading="adding"
              @click="addCandidate"
              unelevated
            />
          </template>
        </QInput>

        <p class="q-mt-md">Add candidates by their email address.</p>

        <ul>
          <li>
            The email address should match their Google account, the email they used to
            sign up for GitHub, or an email they'll use to create an account.
          </li>
          <li>
            Candidates can use a generated email to create an account first and then you
            can use the generated email instead.
          </li>
          <li>
            Candidates <strong>must</strong> create a named account using this email to
            access their workspace.
          </li>
        </ul>
      </QTabPanel>

      <!--
        Allow Anonymous
      -->
      <QTabPanel name="viaGen" class="q-px-none">
        <QInput
          v-model="generatedEmail"
          label="Generated login"
          class="q-mb-sm"
          :color="dark ? 'purple-3' : 'accent'"
          readonly
          outlined
        />
        <QInput
          v-model="generatedPassword"
          label="Generated password"
          class="q-mb-sm"
          :color="dark ? 'purple-3' : 'accent'"
          readonly
          outlined
        />
        <QInput
          v-model="candidateName"
          label="Candidate name or label"
          :color="dark ? 'purple-3' : 'accent'"
          @keyup.enter="addCandidate"
          autofocus
          outlined
        >
          <template #append>
            <QBtn
              :class="{ 'q-mr-xs': copiedGenerated }"
              :color="copied ? 'green' : copiedGenerated ? undefined : 'accent'"
              :icon="
                copied ? tabCheck : copiedGenerated ? tabClipboardCheck : tabClipboard
              "
              :disable="candidateName.trim().length === 0 || adding"
              @click="copyGeneratedContent"
              :flat="copied"
              unelevated
            >
              <LazyQTooltip>
                Copy the generated user's information to the clipboard</LazyQTooltip
              >
            </QBtn>
            <QBtn
              v-if="copiedGenerated"
              color="accent"
              :icon="tabUserPlus"
              :disable="candidateName.trim().length === 0"
              :loading="adding"
              @click="addCandidate"
              unelevated
            >
              <LazyQTooltip> Provision the candidate's workspace. </LazyQTooltip>
            </QBtn>
          </template>
        </QInput>

        <p class="q-mt-md">
          Create a pre-generated account for the candidate (anonymous to CodeRev) .
        </p>

        <ul>
          <li>Pre-generate an account for the user so they do not have to register.</li>
          <li>The username and password will be provided.</li>
          <li>
            The candidate name input is for your own records; use any value that let's you
            track which candidate this is.
          </li>
          <li>
            <strong>Be sure to copy out the credentials</strong> before creating the
            workspace. This happens automatically before creating the account. The
            credentials are not exposed again.
          </li>
        </ul>
      </QTabPanel>
    </QTabPanels>

    <QBanner class="q-mt-none" :class="[dark ? 'bg-grey-9' : 'bg-grey-4']" rounded>
      <template #avatar>
        <QIcon :name="tabInfoCircle" size="md" style="vertical-align: top" />
      </template>

      <strong>CodeRev does not automatically send emails</strong>
      (for security and anti-spam reasons). After creating the workspace, copy the
      candidate workspace URL and send it to them in an email or chat message.
    </QBanner>
  </SideDialogShell>
</template>

<script setup lang="ts">
import { tabCheck, tabClipboardCheck, tabInfoCircle, tabUserCheck, tabUserCode, tabUserCog, tabUserOff, tabUserPlus } from "quasar-extras-svg-icons/tabler-icons-v2";
import { type MediaRef } from "../../../shared/models";
import { tabClipboard } from "quasar-extras-svg-icons/tabler-icons";
import { LazyQTooltip } from "#components";

const visible = defineModel<boolean>({ required: true })

const emits = defineEmits<{
  generatedUser: [label: string, details: string]
}>()

const tab = ref<'viaEmail'|'viaGen'>('viaEmail')

const appStore = useAppStore();

const { dark } = storeToRefs(appStore);

const { workspace } = storeToRefs(useWorkspaceStore());

const { copy, copied, text } = useClipboard();

const candidateEmail = ref("");

const generatedEmail = ref("");

const generatedPassword = ref("");

const candidateName = ref("");

const adding = ref(false)

const copiedGenerated = ref(false)

const candidateWorkspaceId = ref("")

watch (visible, (showing) => {
  if (showing) {
    const candidateId = nanoid(16)
    candidateWorkspaceId.value = candidateId
    generatedEmail.value = `c_${candidateId.toLowerCase()}@coderev.app`
    generatedPassword.value = `${nanoid(4)}-${nanoid(4)}-${nanoid(4)}`.toLowerCase()
    copiedGenerated.value = false
  }
}, { immediate: true })

async function addCandidate() {
  if ((candidateEmail.value.trim().length === 0
    && candidateName.value.trim().length === 0)
    || !workspace.value) {
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

  try {
    adding.value = true;

    const generate = tab.value === 'viaGen'

    if (generate) {
      // Create a generated account for the user.
      await firebaseConnector.provisionGeneratedAccountViaFn(
        workspace.value.uid,
        generatedEmail.value,
        generatedPassword.value,
        candidateName.value,
        appStore.getCurrentUserRef()
      )
    }

    // Add the candidate review entry
    await candidateReviewRepository.create({
      uid: candidateWorkspaceId.value,
      workspaceUid: workspace.value.uid,
      workspaceName: workspace.value.name,
      email: generate ? generatedEmail.value.toLowerCase() : candidateEmail.value.trim(),
      label: generate ? candidateName.value.trim() : candidateEmail.value.trim(),
      sources: sources,
      comments: {},
      name: `${candidateEmail.value.trim().length === 0 ? candidateName.value.trim() : candidateEmail.value.trim()}`,
    });

    candidateEmail.value = "";
    candidateName.value = "";

    visible.value = false
  } finally {
    adding.value = false;
  }
}

/**
 * Copies all generated content to the clipboard.
 */
function copyGeneratedContent() {
  const text = `Name: ${candidateName.value}
Generated email: ${generatedEmail.value}
Generated password: ${generatedPassword.value}
Workspace URL: ${baseUrl}/review/${candidateWorkspaceId.value}
`
  copy(text)

  emits('generatedUser', candidateName.value, text)

  copiedGenerated.value = true
}
</script>

<style scoped>
ul {
  padding-left: 24px;
}

ul {
  list-style-type: square;
}

ul li {
  margin-bottom: 8px;
}
</style>
