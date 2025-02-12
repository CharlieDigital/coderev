<template>
  <div>
    <QPage class="row" padding>
      <div class="offset-md-2 col-md-8 col-sm-12">
        <!-- List of the user's owned or collaborative workspaces -->
        <QList
          class="rounded-borders"
          :class="[dark ? 'bg-grey-10' : 'bg-grey-1']"
          bordered
          separator
        >
          <QItem>
            <QItemSection class="text-h5 text-bold"> Workspaces </QItemSection>
            <QItemSection side>
              <QBtn
                :icon="showArchived ? tabArchive : tabArchiveOff"
                @click="showArchived = !showArchived"
                flat
              >
                <QBadge
                  v-show="filteredWorkspaces.length !== workspaces.length"
                  color="accent"
                  :label="workspaces.length - filteredWorkspaces.length"
                  floating
                />
                <QTooltip>
                  {{ showArchived ? "Showing archived" : "Hiding archived" }}
                </QTooltip>
              </QBtn>
            </QItemSection>
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

          <!--
            List of workspaces (internal)
          -->
          <QItem
            v-for="w in filteredWorkspaces"
            @click="navigateTo(`/workspace/${w.uid}`)"
            clickable
          >
            <QItemSection
              :class="w.archivedAtUtc ? 'text-italic text-grey-6' : undefined"
            >
              <QItemLabel class="text-h6">{{ w.name }}</QItemLabel>
              <QItemLabel class="text-body1">{{ w.description }}</QItemLabel>
            </QItemSection>
            <QItemSection v-if="w.ratings" side>
              <QChip
                :icon="tabMessages"
                :label="Object.keys(w.ratings ?? {}).length"
                outline
              />
            </QItemSection>
            <QItemSection side>
              <QBtn
                :icon="!!w.archivedAtUtc ? tabArchiveOff : tabArchive"
                @click.stop="toggleWorkspaceArchive(!!w.archivedAtUtc, w.uid)"
                flat
                dense
              >
                <QTooltip>{{ !!w.archivedAtUtc ? "Unarchive" : "Archive" }}</QTooltip>
              </QBtn>
            </QItemSection>
            <QItemSection side>
              <DeleteConfirmButton
                message="Are you sure you want to delete this workspace and all artifacts?"
                @delete="workspaceStore.deleteWorkspace(w.uid, Object.values(w.sources))"
                dense
              />
            </QItemSection>
          </QItem>
        </QList>

        <!-- List of the workspaces where the user has submitted a review or is a candidate -->
        <QList
          v-show="candidateWorkspaces.length > 0"
          class="rounded-borders q-mt-md"
          :class="[dark ? 'bg-grey-10' : 'bg-grey-1']"
          bordered
          separator
        >
          <QItem>
            <QItemSection class="text-h5 text-bold"> As Candidate </QItemSection>
          </QItem>

          <QItem
            v-for="w in candidateWorkspaces"
            :key="w.uid"
            @click="navigateTo(`/review/${w.uid}`)"
            clickable
          >
            <QItemSection>
              <QItemLabel class="text-h6">{{ w.workspaceName }}</QItemLabel>
            </QItemSection>
            <QItemSection side>
              <QItemLabel class="text-bold">
                {{ Object.keys(w.comments).length }} comment(s)
              </QItemLabel>
              <QItemLabel v-if="Object.keys(w.comments).length > 0" caption>
                {{
                  dayjs(
                    Object.values(w.comments).sort((a, b) => {
                      if (a.author.addedUtc > b.author.addedUtc) return -1;
                      else if (b.author.addedUtc > a.author.addedUtc) return 1;
                      return 0;
                    })[0].author.addedUtc
                  )
                    .utc()
                    .fromNow()
                }}
              </QItemLabel>
            </QItemSection>
          </QItem>
        </QList>

        <div v-if="showVideo" class="q-mt-lg">
          <QItem class="q-pr-none">
            <QSpace />
            <QBtn
              v-bind="btnProps"
              label="Done"
              color="accent"
              :icon="tabCheck"
              @click="showVideo = !showVideo"
            />
          </QItem>
          <video
            preload="none"
            controls
            name="media"
            class="rounded-borders shadow-2"
            style="width: 100%"
            poster="https://storage.googleapis.com/media.coderev.app/code-rev-intro.webp"
            title="CodeRev.app 3 minute intro."
          >
            <source
              src="https://storage.googleapis.com/media.coderev.app/code-rev-intro-720p-hb-1000.mp4"
              type="video/mp4"
            />
          </video>
        </div>

        <!-- Feedback banner -->
        <QBanner class="q-mt-md" :dark="dark" inline-actions rounded>
          Have feedback, ideas, or ran into an issue?
          <template #action>
            <QBtn
              v-bind="btnProps"
              color="accent"
              class="q-mr-xs q-px-sm"
              :icon="showVideo ? tabCheck : tabPlayerPlay"
              @click="showVideo = !showVideo"
              unelevated
            />
            <QBtn
              v-bind="btnProps"
              label="Feedback"
              color="accent"
              :icon="tabBrandGithub"
              @click="
                navigateTo('https://github.com/CharlieDigital/coderev/issues', {
                  external: true,
                  open: {
                    target: '_blank',
                  },
                })
              "
              unelevated
            />
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
import { navigateTo } from "nuxt/app";
import { tabPlus } from "quasar-extras-svg-icons/tabler-icons";
import {
  tabBrandGithub,
  tabPlayerPlay,
  tabCheck,
  tabArchive,
  tabArchiveOff,
  tabMessages,
} from "quasar-extras-svg-icons/tabler-icons-v2";
import { btnProps } from "../utils/commonProps";
import { deleteField } from "firebase/firestore";

definePageMeta({
  layout: "app-layout",
  middleware: ["auth"],
});

useHeadSafe({
  title: "CodeRev.app | Workspaces",
});

const dayjs = useDayjs();

const showNewWorkspaceDialog = ref(false);

const showVideo = ref(false);

const showArchived = useLocalStorage("show-archived-workspaces", false);

const workspaceStore = useWorkspaceStore();

const { workspaces, candidateWorkspaces } = storeToRefs(workspaceStore);

const { profile, showLeftDrawer, showPreferencesDialog, dark } = storeToRefs(
  useAppStore()
);

const filteredWorkspaces = computed(() => {
  if (showArchived.value) {
    return workspaces.value;
  }

  return workspaces.value.filter((w) => !w.archivedAtUtc);
});

onMounted(async () => {
  showLeftDrawer.value = false;

  if (profile.value) {
    await Promise.all([
      workspaceStore.loadWorkspaces(),
      workspaceStore.loadCandidateWorkspaces(profile.value.email),
    ]);
  } else {
    await workspaceStore.loadWorkspaces();
  }
});

watch(profile, async (p) => {
  if (p.uid === defaultProfile.uid) {
    return;
  }

  if (profile.value && typeof profile.value.receiveEmails === "undefined") {
    showPreferencesDialog.value = true;
  }

  console.log(`Loading workspaces for profile: ${p.email}`);

  await Promise.all([
    workspaceStore.loadWorkspaces(),
    workspaceStore.loadCandidateWorkspaces(profile.value.email),
  ]);
});

/**
 * Marks the workspace as archived.
 * @param uid The UID of the workspace to archive
 */
async function toggleWorkspaceArchive(isArchived: boolean, uid: string) {
  if (isArchived) {
    await workspaceRepository.updateFields(uid, {
      archivedAtUtc: deleteField(),
    });
  } else {
    await workspaceRepository.updateFields(uid, {
      archivedAtUtc: dayjs().utc().toISOString(),
    });
  }
}
</script>

<style scoped></style>
