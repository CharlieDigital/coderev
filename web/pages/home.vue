<template>
  <div>
    <QPage class="row" padding>
      <div class="offset-md-2 col-md-8 col-sm-12">
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

const showNewWorkspaceDialog = ref(false);

const workspaceStore = useWorkspaceStore();

const { workspaces } = storeToRefs(workspaceStore);

const { profile, showLeftDrawer, showPreferencesDialog, dark } = storeToRefs(
  useAppStore()
);

onMounted(async () => {
  showLeftDrawer.value = false;
  await workspaceStore.loadWorkspaces();
});

watch(profile, async (p) => {
  if (p.uid === defaultProfile.uid) {
    return;
  }

  if (profile.value && typeof profile.value.receiveEmails === 'undefined') {
    showPreferencesDialog.value = true
  }

  console.log(`Loading workspaces for profile: ${p.email}`);

  await workspaceStore.loadWorkspaces();
});
</script>

<style scoped></style>
