<template>
  <SideDialogShell
    position="right"
    title="Candidate ratings"
    :icon="tabMessages"
    :visible="visible"
    @close="visible = false"
  >
    <!-- Overall -->
    <QCard
      v-if="(ratings?.length ?? 0) > 1"
      class="q-mb-sm"
      :class="dark ? 'bg-grey-10' : 'bg-grey-2'"
      bordered
      flat
    >
      <QItem>
        <QItemSection>
          <QItemLabel class="text-bold"
            >Candidate:
            {{ candidate?.label ?? candidate?.email ?? candidate?.name }}</QItemLabel
          >
          <QItemLabel caption>Overall Rating</QItemLabel>
        </QItemSection>
      </QItem>
      <QSeparator />
      <!-- First row of ratings -->
      <QItem class="q-pb-none q-px-none">
        <!-- Overall -->
        <QItemSection horizontal>
          <QItemSection>
            <QItem dense>
              <QItemSection side>
                <QChip
                  color="accent"
                  text-color="white"
                  size="sm"
                  :label="(summary.overall * 5).toFixed(1)"
                />
              </QItemSection>
              <QItemSection>
                <QItemLabel caption>Overall</QItemLabel>
                <QItemLabel>
                  <QLinearProgress v-bind="progressProps" :value="summary.overall" />
                </QItemLabel>
              </QItemSection>
            </QItem>
          </QItemSection>
        </QItemSection>

        <!-- Thoroughness -->
        <QItemSection horizontal>
          <QItemSection>
            <QItem dense>
              <QItemSection side>
                <QChip
                  color="accent"
                  text-color="white"
                  size="sm"
                  :label="((summary.thoroughness ?? 0) * 5).toFixed(1) ?? '0.0'"
                />
              </QItemSection>
              <QItemSection>
                <QItemLabel caption>Thoroughness</QItemLabel>
                <QItemLabel>
                  <QLinearProgress
                    v-bind="progressProps"
                    :value="summary.thoroughness ?? 0"
                  />
                </QItemLabel>
              </QItemSection>
            </QItem>
          </QItemSection>
        </QItemSection>
      </QItem>
      <QItem class="q-pt-none q-px-none">
        <!-- Depth -->
        <QItemSection horizontal>
          <QItemSection>
            <QItem dense>
              <QItemSection side>
                <QChip
                  color="accent"
                  text-color="white"
                  size="sm"
                  :label="((summary.depth ?? 0) * 5).toFixed(1) ?? '0.0'"
                />
              </QItemSection>
              <QItemSection>
                <QItemLabel caption>Depth</QItemLabel>
                <QItemLabel>
                  <QLinearProgress v-bind="progressProps" :value="summary.depth ?? 0" />
                </QItemLabel>
              </QItemSection>
            </QItem>
          </QItemSection>
        </QItemSection>

        <!-- Clarity -->
        <QItemSection horizontal>
          <QItemSection>
            <QItem dense>
              <QItemSection side>
                <QChip
                  color="accent"
                  text-color="white"
                  size="sm"
                  :label="((summary.clarity ?? 0) * 5).toFixed(1) ?? '0.0'"
                />
              </QItemSection>
              <QItemSection>
                <QItemLabel caption>Clarity</QItemLabel>
                <QItemLabel>
                  <QLinearProgress v-bind="progressProps" :value="summary.clarity ?? 0" />
                </QItemLabel>
              </QItemSection>
            </QItem>
          </QItemSection>
        </QItemSection>
      </QItem>
    </QCard>

    <!-- Individual reviews -->
    <QCard
      v-for="rating in ratings"
      class="q-pb-sm q-mb-sm"
      :key="rating.author.uid"
      bordered
      flat
    >
      <QItem>
        <QItemSection>
          <QCardSection horizontal>
            <QItemSection
              ><QItemLabel class="text-bold">{{
                rating.author.name
              }}</QItemLabel></QItemSection
            >
            <QItemSection class="text-right"
              ><QItemLabel caption>{{
                dayjs(rating.author.addedUtc).fromNow()
              }}</QItemLabel></QItemSection
            >
          </QCardSection>
          <QItemLabel>{{ rating.comments }}</QItemLabel>
        </QItemSection>
      </QItem>
      <QSeparator />
      <!-- First row of ratings -->
      <QItem class="q-pb-none q-px-none">
        <!-- Overall -->
        <QItemSection horizontal>
          <QItemSection>
            <QItem dense>
              <QItemSection side>
                <QChip
                  color="accent"
                  text-color="white"
                  size="sm"
                  :label="rating.overall.toFixed(1) ?? '0.0'"
                />
              </QItemSection>
              <QItemSection>
                <QItemLabel caption>Overall</QItemLabel>
                <QItemLabel>
                  <QLinearProgress v-bind="progressProps" :value="rating.overall / 5" />
                </QItemLabel>
              </QItemSection>
            </QItem>
          </QItemSection>
        </QItemSection>

        <!-- Thoroughness -->
        <QItemSection horizontal>
          <QItemSection>
            <QItem dense>
              <QItemSection side>
                <QChip
                  color="accent"
                  text-color="white"
                  size="sm"
                  :label="rating.thoroughness?.toFixed(1) ?? '0.0'"
                />
              </QItemSection>
              <QItemSection>
                <QItemLabel caption>Thoroughness</QItemLabel>
                <QItemLabel>
                  <QLinearProgress
                    v-bind="progressProps"
                    :value="(rating.thoroughness ?? 0) / 5"
                  />
                </QItemLabel>
              </QItemSection>
            </QItem>
          </QItemSection>
        </QItemSection>
      </QItem>
      <QItem class="q-pt-none q-px-none">
        <!-- Depth -->
        <QItemSection horizontal>
          <QItemSection>
            <QItem dense>
              <QItemSection side>
                <QChip
                  color="accent"
                  text-color="white"
                  size="sm"
                  :label="rating.depth?.toFixed(1) ?? '0.0'"
                />
              </QItemSection>
              <QItemSection>
                <QItemLabel caption>Depth</QItemLabel>
                <QItemLabel>
                  <QLinearProgress
                    v-bind="progressProps"
                    :value="(rating.depth ?? 0) / 5"
                  />
                </QItemLabel>
              </QItemSection>
            </QItem>
          </QItemSection>
        </QItemSection>

        <!-- Clarity -->
        <QItemSection horizontal>
          <QItemSection>
            <QItem dense>
              <QItemSection side>
                <QChip
                  color="accent"
                  text-color="white"
                  size="sm"
                  :label="rating.clarity?.toFixed(1) ?? '0.0'"
                />
              </QItemSection>
              <QItemSection>
                <QItemLabel caption>Clarity</QItemLabel>
                <QItemLabel>
                  <QLinearProgress
                    v-bind="progressProps"
                    :value="(rating.clarity ?? 0) / 5"
                  />
                </QItemLabel>
              </QItemSection>
            </QItem>
          </QItemSection>
        </QItemSection>
      </QItem>
    </QCard>
  </SideDialogShell>
</template>

<script setup lang="ts">
import { tabMessages } from "quasar-extras-svg-icons/tabler-icons-v2";
import dayjs from "dayjs";

const visible = defineModel<boolean>({ required: true });

const { dark } = storeToRefs(useAppStore());

const props = defineProps<{
  candidate?: CandidateReview;
  ratings?: Rating[];
}>();

const progressProps = computed(() => ({
  min: 0,
  max: 5,
  step: 0.5,
  snap: true,
  readonly: true,
  label: true,
  dense: true,
  color: dark.value ? "deep-purple-3" : "accent",
  size: "md",
  rounded: true,
}));

type Entry = {
  total: number;
  count: number;
};

type Overall = {
  overall: Entry;
  thoroughness: Entry;
  clarity: Entry;
  depth: Entry;
};

/**
 * Reduce the scores by category so we can calculate an average.
 */
const summary = computed(() => {
  const counted = (props.ratings ?? []).reduce(
    (acc, rating) => {
      acc.overall.total += rating.overall;
      acc.overall.count++;

      if (rating.thoroughness) {
        acc.thoroughness.total += rating.thoroughness ?? 0;
        acc.thoroughness.count++;
      }

      if (rating.clarity) {
        acc.clarity.total += rating.clarity ?? 0;
        acc.clarity.count++;
      }

      if (rating.depth) {
        acc.depth.total += rating.depth ?? 0;
        acc.depth.count++;
      }

      return acc;
    },
    {
      overall: { total: 0, count: 0 },
      thoroughness: { total: 0, count: 0 },
      clarity: { total: 0, count: 0 },
      depth: { total: 0, count: 0 },
    } as Overall
  );

  return {
    overall: counted.overall.total / counted.overall.count / 5,
    thoroughness:
      counted.thoroughness.count === 0
        ? undefined
        : counted.thoroughness.total / counted.thoroughness.count / 5,
    clarity:
      counted.clarity.count === 0
        ? undefined
        : counted.clarity.total / counted.clarity.count / 5,
    depth:
      counted.depth.count === 0
        ? undefined
        : counted.depth.total / counted.depth.count / 5,
  };
});
</script>

<style scoped></style>
