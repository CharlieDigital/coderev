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
          <!-- Panel for setting up the files -->
          <QSplitter v-model="split" class="split-container">
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
        </QPage>
      </QPageContainer>

      <!-- Left drawer which has the nav and description -->
      <QDrawer v-model="showLeftDrawer" class="column bg-grey-10" :mini="mini" dark>
        <template #mini>
          <div class="text-center q-py-sm column full-height justify-between">
            <div>
              <QBtn :icon="tabArrowRight" @click="mini = false" size="md" dense flat />
              <QBtn
                size="md"
                class="q-mt-sm"
                color="accent"
                text-color="deep-purple-3"
                :icon="tabInfoSquare"
                @click="mini = false"
                dense
                unelevated
              />
              <QBtn
                size="md"
                class="q-mt-sm"
                :icon="tabUser"
                @click="mini = false"
                dense
                flat
              />
              <QBtn
                size="md"
                class="q-mt-sm"
                :icon="tabHome"
                @click="navigateTo('/home')"
                dense
                flat
              />
            </div>

            <div>
              <QBtn
                size="md"
                class="q-mb-sm"
                :icon="dark ? tabMoon : tabSun"
                @click="$q.dark.toggle()"
                dense
                flat
              />
              <QBtn size="md" :icon="tabMail" @click="sendFeedback" dense flat />
            </div>
          </div>
        </template>

        <QList class="q-gutter-md q-px-sm q-pt-md col">
          <QItem v-bind="leftMenuProps" @click="mini = true" clickable>
            <QItemSection class="text-h5 text-bold"> CodeRev.app </QItemSection>
            <QItemSection side>
              <QIcon :name="tabArrowLeft" />
            </QItemSection>
          </QItem>

          <!-- Top card with the workspace name and description -->
          <QCard class="bg-purple-10" bordered flat>
            <QCardSection class="text-h6">
              {{ candidate.workspaceName }}
            </QCardSection>
          </QCard>

          <!-- Card that show the current candidate -->
          <QCard class="bg-grey-9">
            <QItem v-bind="leftMenuProps">
              <QItemSection style="justify-content: start" avatar>
                <QIcon :name="tabUser" />
              </QItemSection>
              <QItemSection>
                <QItemLabel class="text-body1" style="word-break: break-all" lines="2">{{
                  candidate.email
                }}</QItemLabel>
              </QItemSection>
            </QItem>
            <!-- <QCardActions align="right">

            </QCardActions> -->
          </QCard>

          <QItem class="rounded-borders" @click="navigateTo('/home')" clickable>
            <QItemSection avatar>
              <QIcon :name="tabHome" />
            </QItemSection>
            <QItemSection>
              <QItemLabel>Home</QItemLabel>
            </QItemSection>
          </QItem>
        </QList>

        <!-- Bottom dark/light toggle -->
        <LeftNavBottomButtons />
      </QDrawer>
    </QLayout>
  </div>
</template>

<script setup lang="ts">
import {
  tabArrowLeft,
  tabArrowRight,
  tabHome,
  tabInfoSquare,
  tabMail,
  tabMoon,
  tabSun,
  tabUser,
} from "quasar-extras-svg-icons/tabler-icons";
import { leftMenuProps } from "../../utils/commonProps";
import { navigateTo } from "nuxt/app";
import { defaultCandidate } from "../../stores/composables/candidates";

const $q = useQuasar();

definePageMeta({
  layout: "empty",
  middleware: ["auth"],
});

const route = useRoute();

const appStore = useAppStore();

const workspaceStore = useWorkspaceStore();

const { dark } = storeToRefs(appStore);

const { candidate } = storeToRefs(workspaceStore);

const workspaceName = computed(() => candidate.value.workspaceName);

useHeadSafe({
  title: workspaceName,
  titleTemplate: (title) => `CodeRev.app | ${title}`,
});

const showLeftDrawer = ref(true);

const mini = ref(true);

const split = ref(75);

onBeforeMount(async () => {
  try {
    await workspaceStore.ensureCandidate(route.params.uid as string);

    await workspaceStore.loadCandidates(
      route.params.uid as string,
      candidate.value.email,
      candidate.value.workspaceUid
    );
  } catch (e) {
    console.error(e);
    await navigateTo("/404.html");
  }
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

/**
 * Opens a mail to link.
 */
function sendFeedback() {
  window.location.href = "mailto:chen.charles.c@gmail.com";
}
</script>

<style scoped>
.split-container {
  height: 100vh;
}
</style>
