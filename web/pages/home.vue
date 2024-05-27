<template>
  <div>
    <QPage class="row" padding>
      <div class="offset-md-2 col-md-8 col-sm-12">
        <!-- List of the user's owned or collaborative workspaces -->
        <QList
          class="rounded-borders"
          :class="[dark ? 'bg-grey-10' : 'bg-grey-1']"
          bordered
        >
          <QItem>
            <QItemSection class="text-h5 text-bold"> Workspaces </QItemSection>
            <QItemSection side>
              <QBtn
                v-bind="btnProps"
                label="New"
                color="accent"
                :icon="tabPlus"
                @click="showNewWorkspaceDialog = true"
                unelevated
              />
            </QItemSection>
          </QItem>

          <template v-for="w in workspaces">
            <QSeparator />
            <QItem @click="navigateTo(`/workspace/${w.uid}`)" clickable>
              <QItemSection>
                <QItemLabel class="text-h6">{{ w.name }}</QItemLabel>
                <QItemLabel class="text-body1">{{ w.description }}</QItemLabel>
              </QItemSection>
              <QItemSection side>
                <DeleteConfirmButton
                  message="Are you sure you want to delete this workspace and all artifacts?"
                  @delete="
                    workspaceStore.deleteWorkspace(
                      w.uid,
                      Object.values(w.sources)
                    )
                  "
                  dense
                />
              </QItemSection>
            </QItem>
          </template>
        </QList>

        <!-- List of the workspaces where the user has submitted a review or is a candidate -->
        <QList
          v-show="candidateWorkspaces.length > 0"
          class="rounded-borders q-mt-md"
          :class="[dark ? 'bg-grey-10' : 'bg-grey-1']"
          bordered
        >
          <QItem>
            <QItemSection class="text-h5 text-bold"> As Candidate </QItemSection>
          </QItem>

          <template v-for="w in candidateWorkspaces">
            <QSeparator />
            <QItem @click="navigateTo(`/review/${w.uid}`)" clickable>
              <QItemSection>
                <QItemLabel class="text-h6">{{ w.workspaceName }}</QItemLabel>
              </QItemSection>
              <QItemSection side>
                <QItemLabel class="text-bold">
                  {{ Object.keys(w.comments).length }} comment(s)
                </QItemLabel>
                <QItemLabel
                  v-if="Object.keys(w.comments).length > 0"
                  caption>
                  {{
                    dayjs(Object.values(w.comments)
                      .sort((a, b) => {
                        if (a.author.addedUtc > b.author.addedUtc) return -1
                        else if (b.author.addedUtc > a.author.addedUtc) return 1
                        return 0
                      })[0].author.addedUtc).utc().fromNow()
                  }}
                 </QItemLabel>
              </QItemSection>
            </QItem>
          </template>
        </QList>

        <!-- Feedback banner -->
        <QBanner
          class="q-mt-md"
          :dark="dark"
          inline-actions
          rounded>
          Have feedback, ideas, or ran into an issue?
          <template #action>
            <QBtn
              v-bind="btnProps"
              label="Feedback"
              color="accent"
              :icon="tabBrandGithub"
              @click="navigateTo('https://github.com/CharlieDigital/coderev/issues', {
                external: true,
                open: {
                  target: '_blank'
                }
              })"
              unelevated/>
          </template>
        </QBanner>
      </div>

      <NewWorkspaceDialog
        :visible="showNewWorkspaceDialog"
        @close="showNewWorkspaceDialog = false"
      />

      <PreferencesDialog
        :visible="showPreferencesDialog"
        @close="showPreferencesDialog = false"
      />
    </QPage>
  </div>
</template>

<script setup lang="ts">
import { tabPlus } from "quasar-extras-svg-icons/tabler-icons";
import { tabBrandGithub } from "quasar-extras-svg-icons/tabler-icons-v2";

definePageMeta({
  layout: "app-layout",
  middleware: ["auth"],
});

useHeadSafe({
  title: "CodeRev.app | Workspaces",
});

const dayjs = useDayjs();

const showNewWorkspaceDialog = ref(false);

const workspaceStore = useWorkspaceStore();

const { workspaces, candidateWorkspaces } = storeToRefs(workspaceStore);

const {
  profile,
  showLeftDrawer,
  showPreferencesDialog,
  dark
} = storeToRefs(
  useAppStore()
);

onMounted(async () => {
  showLeftDrawer.value = false;

  if (profile.value) {
    await Promise.all([
      workspaceStore.loadWorkspaces(),
      workspaceStore.loadCandidateWorkspaces(profile.value.email)
    ])
  } else {
    await workspaceStore.loadWorkspaces();
  }
});

watch(profile, async (p) => {
  if (p.uid === defaultProfile.uid) {
    return;
  }

  if (profile.value && typeof profile.value.receiveEmails === 'undefined') {
    showPreferencesDialog.value = true
  }

  console.log(`Loading workspaces for profile: ${p.email}`);

  await Promise.all([
    workspaceStore.loadWorkspaces(),
    workspaceStore.loadCandidateWorkspaces(profile.value.email)
  ]);
});
</script>

<style scoped></style>
