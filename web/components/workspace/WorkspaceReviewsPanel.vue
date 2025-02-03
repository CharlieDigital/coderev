<template>
  <div>
    <QPage
      :class="{
        'bg-dark text-white': dark,
        'bg-grey-2 text-black': !dark,
      }"
      padding
    >
      <p class="text-h4">Candidate Reviews</p>
      <div class="row">
        <!-- Left main work area -->
        <div class="col-9 q-pr-md">
          <QList
            class="rounded-borders"
            :class="[dark ? 'bg-grey-10' : 'bg-grey-1']"
            bordered
          >
            <QItem>
              <QItemSection class="text-h5 text-bold">
                Candidates
              </QItemSection>
              <QItemSection side>
                <QBtn
                  :icon="showArchived ? tabArchive : tabArchiveOff"
                  @click="showArchived = !showArchived"
                  flat
                >
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
                  :disable="isWorkspaceEmpty"
                  @click="showCandidateDialog = true"
                  unelevated
                >
                  <QTooltip v-if="isWorkspaceEmpty">
                    Save your workspace files first.
                  </QTooltip>
                </QBtn>
              </QItemSection>
            </QItem>

            <!-- Listing of candidates -->
            <template
              v-for="c in filteredCandidates"
              :key="c.uid">
              <QSeparator />
              <QItem
                :class="[!!c.archivedAtUtc ? 'text-italic archived' : undefined]"
                @click="navigateTo(`/workspace/${workspace.uid}/c/${c.uid}`)"
                clickable
              >
                <QItemSection avatar>
                  <QAvatar>
                    <QIcon :name="tabUser" size="md" />
                    <QBadge
                      color="accent"
                      :label="Object.keys(c.comments).length"
                      floating
                    />
                  </QAvatar>
                </QItemSection>
                <QItemSection>
                  <QItemLabel class="text-h6">{{ c.name }}</QItemLabel>
                  <QItemLabel class="text-body1">{{
                    dayjs(c.createdAtUtc).utc().fromNow()
                  }}</QItemLabel>
                </QItemSection>
                <QItemSection side>
                  <QBtn
                    :icon="!!c.archivedAtUtc ? tabArchiveOff : tabArchive"
                    @click.stop="
                      toggleCandidateArchive(!!c.archivedAtUtc, c.uid)
                    "
                    flat
                    dense
                  >
                    <QTooltip>{{
                      !!c.archivedAtUtc ? "Unarchive" : "Archive"
                    }}</QTooltip>
                  </QBtn>
                </QItemSection>
                <!-- Copy button -->
                <QItemSection side>
                  <QBtn
                    :icon-right="copied && text.includes(c.uid) ? tabCheck : tabClipboard"
                    :label="copied && text.includes(c.uid) ? 'Copied' : undefined"
                    :text-color="copied && text.includes(c.uid) ? 'green-6' : undefined"
                    @click.stop="copy(`${baseUrl}/review/${c.uid}`)"
                    flat
                    no-caps
                    dense
                  >
                    <QTooltip>Copy URL</QTooltip>
                  </QBtn>
                </QItemSection>
                <QItemSection side>
                  <DeleteConfirmButton
                    message="Are you sure you want to delete this candidate?"
                    @delete="handleCandidateDelete(c.uid)"
                    dense
                  />
                </QItemSection>
              </QItem>
            </template>
          </QList>
        </div>
        <!-- Right column -->
        <div class="col-3">
          <QBanner
            class="tips"
            :class="[dark ? 'bg-grey-8' : 'bg-grey-4']"
            rounded
          >
            <p>Create a code review for each candidate.</p>
            <p>
              Candidates will get their own copies of the workspace to provide
              their feedback and reviews.
            </p>
          </QBanner>
        </div>
      </div>
    </QPage>

    <WorkspaceCandidateDialog
      :visible="showCandidateDialog"
      @close="showCandidateDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from 'nuxt/app';
import { deleteField } from "firebase/firestore";
import {
  tabArchive,
  tabArchiveOff,
  tabCheck,
  tabClipboard,
  tabUser,
} from "quasar-extras-svg-icons/tabler-icons";
import { tabPlus } from "quasar-extras-svg-icons/tabler-icons-v2";
import { baseUrl } from "../../utils/environment";
import { btnProps } from "../../utils/commonProps";

const dayjs = useDayjs();

const { dark } = storeToRefs(useAppStore());

const workspaceStore = useWorkspaceStore();

const { candidates, workspace } = storeToRefs(workspaceStore);

const showCandidateDialog = ref(false);

const { copy, copied, text } = useClipboard();

const showArchived = ref(false);

onMounted(async () => {
  await workspaceStore.loadCandidates();
});

const filteredCandidates = computed(() => {
  if (showArchived.value) {
    return candidates.value;
  } else {
    return candidates.value.filter((c) => !c.archivedAtUtc);
  }
});

const isWorkspaceEmpty = computed(
  () => Object.keys(workspace.value.sources).length === 0
);

/**
 * Handles deletion of the candidate
 */
async function handleCandidateDelete(uid: string) {
  await candidateReviewRepository.deleteById(uid);
}

/**
 * Marks the candidate as archived.
 * @param uid The UID of the candidate to archive
 */
async function toggleCandidateArchive(isArchived: boolean, uid: string) {
  if (isArchived) {
    await candidateReviewRepository.updateFields(uid, {
      archivedAtUtc: deleteField(),
    });
  } else {
    await candidateReviewRepository.updateFields(uid, {
      archivedAtUtc: dayjs().utc().toISOString(),
    });
  }
}
</script>

<style scoped>
.tips p {
  font-size: 1.3em;
}

:deep(.archived) {
  opacity: 0.7;
}
</style>
