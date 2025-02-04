<template>
  <div>
    <QLayout view="hHh lpR fFf">
      <QPageContainer
        :class="{
          'bg-dark text-white': dark,
          'bg-grey-2 text-black': !dark,
        }"
      >
        <QPage>
          <NuxtPage v-if="route.fullPath.includes('/c/')" />
          <QTabPanels v-else v-model="tab" animated keep-alive>
            <!-- Panel for setting up the files -->
            <QTabPanel name="files" class="q-pa-none">
              <WorkspaceFilesPanel
                v-if="workspace.uid !== defaultWorkspace.uid"
                :source-refs="sources"
              />
            </QTabPanel>
            <!-- Panel for setting up and managing the reviewers -->
            <QTabPanel name="reviews" class="q-pa-none">
              <WorkspaceReviewsPanel />
            </QTabPanel>
          </QTabPanels>
        </QPage>
      </QPageContainer>

      <!-- Left drawer which has the nav and description -->
      <QDrawer v-model="showLeftDrawer" class="column bg-grey-10" dark>
        <QList class="q-gutter-md q-px-sm q-pt-md col">
          <!-- Nav back to the home route -->
          <QItem v-bind="leftMenuProps" @click="navigateTo('/home')" clickable>
            <QItemSection avatar>
              <QIcon :name="tabArrowLeft" />
            </QItemSection>
            <QItemSection>
              <QItemLabel class="text-h5 text-weight-bold">CodeRev.app</QItemLabel>
            </QItemSection>
          </QItem>

          <!-- Top card with the workspace name and description -->
          <QCard class="bg-purple-10" bordered flat>
            <template v-if="editMode">
              <QInput
                v-model="workspaceDetails.name"
                label="Name"
                color="white"
                class="q-ma-sm"
                outlined
                dark
              />

              <QInput
                v-model="workspaceDetails.description"
                label="Description"
                color="white"
                type="textarea"
                class="q-ma-sm"
                outlined
                dark
              />
            </template>
            <template v-else>
              <QCardSection class="text-h6 q-pb-none">
                {{ workspace?.name }}
              </QCardSection>
              <QCardSection>
                {{ workspace?.description }}
              </QCardSection>
            </template>
            <QCardActions align="right">
              <template v-if="editMode">
                <QBtn :icon="tabX" @click="editMode = false" flat />
                <QBtn
                  :icon="tabDeviceFloppy"
                  :disable="
                    workspaceDetails.name === '' || workspaceDetails.description === ''
                  "
                  @click="saveChanges"
                  flat
                />
              </template>
              <QBtn v-else :icon="tabPencil" @click="editMode = true" flat />
              <QBtn :icon="tabUsersGroup" @click="showTeamDialog = true" flat />
              <DeleteConfirmButton
                message="Are you sure you want to delete this workspace?"
                anchor="top middle"
                self="top middle"
                @delete="handleDeleteWorkspace"
              />
            </QCardActions>
          </QCard>

          <!-- Files item in left nav -->
          <QItem
            v-bind="leftMenuProps"
            :focused="tab === 'files' && !route.fullPath.includes('/c/')"
            @click="navigateTab('files')"
            manual-focus
            clickable
          >
            <QItemSection avatar>
              <QIcon :name="tabFiles" />
            </QItemSection>
            <QItemSection>
              <QItemLabel class="text-h6">Files</QItemLabel>
            </QItemSection>
          </QItem>

          <!-- Reviews item in left nav -->
          <QItem
            v-bind="leftMenuProps"
            :focused="tab === 'reviews' && !route.fullPath.includes('/c/')"
            @click="navigateTab('reviews')"
            manual-focus
            clickable
          >
            <QItemSection avatar>
              <QIcon :name="tabFilePencil" />
            </QItemSection>
            <QItemSection>
              <QItemLabel class="text-h6">Reviews</QItemLabel>
            </QItemSection>
          </QItem>

          <!-- Card that show the current candidate -->
          <QCard v-if="route.fullPath.includes('/c/')" class="bg-grey-9">
            <QItem v-if="!editCandidate" v-bind="leftMenuProps">
              <QItemSection style="justify-content: start" avatar>
                <QIcon :name="tabUser" />
              </QItemSection>
              <QItemSection>
                <QItemLabel class="text-body1" style="word-break: break-all" lines="2">{{
                  candidate.label ?? candidate.email
                }}</QItemLabel>
              </QItemSection>
            </QItem>
            <template v-else>
              <QInput
                v-model="newCandidateEmail"
                label="Candidate email"
                color="white"
                class="q-ma-sm q-pt-sm"
                outlined
                dark
              />
            </template>
            <QCardActions align="right">
              <QBtn
                :icon="tabArrowUpLeft"
                @click="navigateTo(`/workspace/${workspace.uid}`)"
                flat
              />
              <template v-if="editCandidate">
                <QBtn :icon="tabX" @click="editCandidate = false" flat />
                <QBtn
                  :icon="tabDeviceFloppy"
                  :disable="newCandidateEmail === ''"
                  @click="saveCandidateChanges"
                  flat
                />
              </template>
              <QBtn
                v-show="!editCandidate"
                :icon="tabPencil"
                @click="startEditCandidate"
                flat
              />
              <QBtn
                :icon="tabClipboard"
                @click="copy(`${baseUrl}/review/${candidate.uid}`)"
                flat
              >
                <QTooltip>Copy URL</QTooltip>
              </QBtn>
              <DeleteConfirmButton
                message="Are you sure you want to delete this candidate?"
                anchor="top middle"
                self="top middle"
                @delete="handleCandidateDelete(candidate.uid)"
              />
            </QCardActions>
          </QCard>
        </QList>

        <!-- Bottom dark/light toggle -->
        <LeftNavBottomButtons />
      </QDrawer>
    </QLayout>

    <WorkspaceTeamDialog :visible="showTeamDialog" @close="showTeamDialog = false" />
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from "nuxt/app";
import { defaultWorkspace } from "../../stores/workspaceStore";
import {
  tabArrowLeft,
  tabArrowUpLeft,
  tabClipboard,
  tabUser,
  tabDeviceFloppy,
  tabFilePencil,
  tabFiles,
  tabPencil,
  tabUsersGroup,
  tabX,
} from "quasar-extras-svg-icons/tabler-icons-v2";
import { leftMenuProps } from "../../utils/commonProps";
import { baseUrl } from "../../utils/environment";

definePageMeta({
  layout: "empty",
  middleware: ["auth"],
});

const route = useRoute();

const workspaceStore = useWorkspaceStore();

const { workspace, candidate, candidates } = storeToRefs(workspaceStore);

const appStore = useAppStore();

const { showLeftDrawer, dark } = storeToRefs(appStore);

const { copy } = useClipboard();

const tab = ref("files");

const showTeamDialog = ref(false);

const editMode = ref(false);

const editCandidate = ref(false);

const newCandidateEmail = ref("");

const workspaceDetails = reactive({
  name: "",
  description: "",
});

const workspaceName = computed(() => workspace.value.name);

useHeadSafe({
  title: workspaceName,
  titleTemplate: (title) => `CodeRev.app | ${title}`,
});

const sources = computed(() => {
  return Object.values(workspace.value.sources).sort((a, b) => {
    if ((a.title ?? "") > (b.title ?? "")) {
      return 1;
    } else if ((a.title ?? "") < (b.title ?? "")) {
      return -1;
    } else {
      return 0;
    }
  });
});

watch(editMode, (editing) => {
  if (editing && workspace.value) {
    workspaceDetails.name = workspace.value.name;
    workspaceDetails.description = workspace.value.description ?? "";
  }
});

onBeforeMount(async () => {
  showLeftDrawer.value = true;
  await workspaceStore.ensureWorkspace(route.params.uid as string);
});

watchEffect(() => {
  if (workspace.value && Object.keys(workspace.value.sources).length > 0) {
    tab.value = "reviews";
  } else {
    tab.value = "files";
  }
});

async function saveChanges() {
  if (!workspace.value) {
    return;
  }

  await workspaceRepository.updateFields(workspace.value.uid, {
    name: workspaceDetails.name,
    description: workspaceDetails.description,
  });

  editMode.value = false;
}

function navigateTab(tabName: string) {
  tab.value = tabName;
  navigateTo(`/workspace/${workspace.value.uid}`);
}

/**
 * Initializes editing of the candidate properties.
 */
function startEditCandidate() {
  newCandidateEmail.value = candidate.value.email;
  editCandidate.value = true;
}

/**
 * Persists changes to the candidate configuration (namely email for now.)
 */
async function saveCandidateChanges() {
  await candidateReviewRepository.updateFields(candidate.value.uid, {
    email: newCandidateEmail.value,
  });

  editCandidate.value = false;
}

/**
 * Handles deletion of the candidate and then routing the navigation to the root
 * workspace afterwards.
 */
async function handleCandidateDelete(uid: string) {
  await candidateReviewRepository.deleteById(uid);

  if (route.fullPath.includes("/c/")) {
    await navigateTo(`/workspace/${workspace.value.uid}`);
  }
}

/**
 * Handle deletion of the current workspace and routing back to home.
 */
async function handleDeleteWorkspace() {
  await workspaceStore.deleteWorkspace(
    workspace.value.uid,
    Object.values(workspace.value.sources)
  );

  await navigateTo("/home");
}
</script>

<style scoped></style>
