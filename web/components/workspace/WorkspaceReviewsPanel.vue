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
            separator
          >
            <QItem>
              <QItemSection class="text-h5 text-bold"> Candidates </QItemSection>
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
            <QItem
              v-for="c in filteredCandidates"
              :key="c.uid"
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
                <QItemLabel class="text-h6"
                  >{{ c.name }}
                  <QIcon
                    color="grey-6"
                    :name="
                      c.email.trim().toLowerCase().endsWith('coderev.app')
                        ? tabShieldOff
                        : tabShieldCheck
                    "
                  />
                </QItemLabel>
                <QItemLabel class="text-body1">{{
                  dayjs(c.createdAtUtc).utc().fromNow()
                }}</QItemLabel>
              </QItemSection>
              <QItemSection v-if="ratings[c.uid]" side>
                <QChip
                  :icon="tabMessages"
                  :label="ratings[c.uid].length"
                  @click.stop="handleShowRatings(c, ratings[c.uid])"
                  outline
                  clickable
                />
              </QItemSection>
              <QItemSection side>
                <QChip
                  :label="
                    copied && text.includes(c.uid)
                      ? 'Copied'
                      : `${c.uid.slice(0, 2)}********${c.uid.slice(-6)}`
                  "
                  :icon="copied && text.includes(c.uid) ? undefined : tabClipboard"
                  :icon-right="copied && text.includes(c.uid) ? tabCheck : undefined"
                  :color="copied && text.includes(c.uid) ? 'green-6' : undefined"
                  :text-color="copied && text.includes(c.uid) ? 'green-1' : undefined"
                  @click.stop="copy(`${baseUrl}/review/${c.uid}`)"
                  clickable
                  style="font-family: monospace"
                />
              </QItemSection>
              <QItemSection side>
                <QBtn
                  :icon="!!c.archivedAtUtc ? tabArchiveOff : tabArchive"
                  @click.stop="toggleCandidateArchive(!!c.archivedAtUtc, c.uid)"
                  flat
                  dense
                >
                  <QTooltip>{{ !!c.archivedAtUtc ? "Unarchive" : "Archive" }}</QTooltip>
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
          </QList>
        </div>
        <!-- Right column -->
        <div class="col-3">
          <QBanner class="tips" :class="[dark ? 'bg-grey-8' : 'bg-grey-4']" rounded>
            <p>Create a code review for each candidate.</p>
            <p>
              Candidates will get their own copies of the workspace to provide their
              feedback and reviews.
            </p>
            <p>
              <strong>CodeRev does not automatically send emails</strong>
              (for security and anti-spam reasons). After creating the workspace, copy the
              candidate workspace URL and send it to them in an email or chat message.
            </p>
          </QBanner>
        </div>
      </div>
    </QPage>

    <!-- Dialog to add a new candidate -->
    <WorkspaceCandidateDialog
      v-model="showCandidateDialog"
      @generated-user="handleUserGenerated"
    />

    <!-- Dialog to view a candidate's ratings -->
    <WorkspaceCandidateRatingsDialog
      v-model="showRatingsDialog"
      :candidate="selectedCandidate"
      :ratings="selectedRatings"
    />

    <!-- Bottom dialog that shows the last generated user -->
    <QDialog
      v-model="showGeneratedDetails"
      position="bottom"
      :persistent="false"
      seamless
    >
      <QCard style="width: 400px">
        <QCardSection>
          <QItem>
            <QItemSection>
              <QItemLabel class="text-bold">Last generated user</QItemLabel>
              <QItemLabel>{{ generatedInfo?.label }}</QItemLabel>
            </QItemSection>
            <QItemSection side>
              <QBtn
                class="q-mr-sm"
                :icon="
                  copied && text === generatedInfo?.details ? tabCheck : tabClipboard
                "
                :color="copied && text === generatedInfo?.details ? 'green' : undefined"
                @click="copy(generatedInfo?.details ?? '(No user info)')"
                flat
                dense
              />
            </QItemSection>
            <QItemSection side>
              <QBtn :icon="tabX" @click="showGeneratedDetails = false" flat dense />
            </QItemSection>
          </QItem>
        </QCardSection>
      </QCard>
    </QDialog>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from "nuxt/app";
import { deleteField } from "firebase/firestore";
import {
  tabArchive,
  tabArchiveOff,
  tabCheck,
  tabClipboard,
  tabUser,
  tabPlus,
  tabShieldCheck,
  tabShieldOff,
  tabX,
  tabMessages,
} from "quasar-extras-svg-icons/tabler-icons-v2";
import { baseUrl } from "../../utils/environment";
import { btnProps } from "../../utils/commonProps";

const dayjs = useDayjs();

const { dark } = storeToRefs(useAppStore());

const workspaceStore = useWorkspaceStore();

const { candidates, workspace } = storeToRefs(workspaceStore);

const showCandidateDialog = ref(false);

const { copy, copied, text } = useClipboard();

const showArchived = useLocalStorage("show-archived-candidates", false);

const showGeneratedDetails = ref(false);

const selectedRatings = ref<Rating[]>();

const selectedCandidate = ref<CandidateReview>();

const showRatingsDialog = ref(false);

const generatedInfo = ref<{ label: string; details: string }>();

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

const ratings = computed(() =>
  Object.entries(workspace.value.ratings ?? {}).reduce((acc, entry) => {
    const [key, rating] = entry;
    const [candidateId, reviewerId] = key.split("__");

    if (!acc[candidateId]) {
      acc[candidateId] = [];
    }

    acc[candidateId].push(rating);

    return acc;
  }, {} as Record<string, Rating[]>)
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

/**
 * A user was generated; we keep the details here in case the user needs
 * to copy again.
 * @param label The label for the user
 * @param details The details for the user
 */
function handleUserGenerated(label: string, details: string) {
  showGeneratedDetails.value = true;

  generatedInfo.value = {
    label,
    details,
  };
}

/**
 *
 * @param candidate
 * @param candidateRatings
 */
function handleShowRatings(candidate: CandidateReview, candidateRatings: Rating[]) {
  selectedRatings.value = candidateRatings;
  selectedCandidate.value = candidate;
  showRatingsDialog.value = true;
}
</script>

<style scoped>
.tips p {
  font-size: 1.1em;
}

:deep(.archived) {
  opacity: 0.7;
}
</style>
