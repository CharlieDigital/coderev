<template>
  <QDialog v-model="visible" position="bottom" seamless>
    <QCard :class="dark ? 'bg-grey-9' : 'bg-white'">
      <QToolbar>
        <QIcon :name="tabMessage2Plus" size="sm" />
        <QToolbarTitle>Rating and feedback</QToolbarTitle>
        <QBtn
          color="grey-6"
          :icon="expanded ? tabChevronCompactDown : tabChevronCompactUp"
          @click="expanded = !expanded"
          dense
          flat
        />
      </QToolbar>
      <p v-show="expanded" class="q-px-md text-grey-6 text-caption">
        Ratings and notes are internal and only visible to your team. Scores are optional.
      </p>
      <QCardSection v-show="expanded" horizontal>
        <QList dense>
          <!-- Overall Score-->
          <QItem>
            <QItemSection side>
              <QChip
                text-color="white"
                size="sm"
                :label="overallScore?.toFixed(1) ?? '0.0'"
                :color="dark ? 'white' : 'accent'"
                :outline="dark"
                dense
              />
            </QItemSection>
            <QItemSection>
              <QItemLabel caption>Overall</QItemLabel>
              <QItemLabel>
                <QSlider v-bind="sliderProps" v-model="overallScore" />
              </QItemLabel>
            </QItemSection>
          </QItem>

          <!-- Depth Score -->
          <QItem>
            <QItemSection side>
              <QChip
                text-color="white"
                size="sm"
                :label="depthScore?.toFixed(1) ?? '0.0'"
                :color="dark ? 'white' : 'accent'"
                :outline="dark"
                dense
              />
            </QItemSection>
            <QItemSection>
              <QItemLabel caption>Depth</QItemLabel>
              <QItemLabel>
                <QSlider v-bind="sliderProps" v-model="depthScore" />
              </QItemLabel>
            </QItemSection>
          </QItem>

          <!-- Thoroughness Score -->
          <QItem>
            <QItemSection side>
              <QChip
                text-color="white"
                size="sm"
                :label="thoroughnessScore?.toFixed(1) ?? '0.0'"
                :color="dark ? 'white' : 'accent'"
                :outline="dark"
                dense
              />
            </QItemSection>
            <QItemSection>
              <QItemLabel caption>Thoroughness</QItemLabel>
              <QItemLabel>
                <QSlider v-bind="sliderProps" v-model="thoroughnessScore" />
              </QItemLabel>
            </QItemSection>
          </QItem>

          <!-- Clarity Score -->
          <QItem>
            <QItemSection side>
              <QChip
                text-color="white"
                size="sm"
                :label="clarityScore?.toFixed(1) ?? '0.0'"
                :color="dark ? 'white' : 'accent'"
                :outline="dark"
                dense
              />
            </QItemSection>
            <QItemSection>
              <QItemLabel caption>Clarity</QItemLabel>
              <QItemLabel>
                <QSlider v-bind="sliderProps" v-model="clarityScore" />
              </QItemLabel>
            </QItemSection>
          </QItem>
        </QList>

        <!-- Right side notes -->
        <QCardSection class="q-pt-none q-pl-none q-pb-none" style="width: 600px">
          <QInput
            v-model="notes"
            type="textarea"
            color="accent"
            input-style="resize: none; overflow: auto; height: 140px;"
            maxlength="1000"
            :bg-color="dark ? 'grey-8' : undefined"
            counter
            outlined
            dense
          />
        </QCardSection>
      </QCardSection>
      <QCardActions v-show="expanded" align="right">
        <QBtn
          :icon="tabCheck"
          :loading="saving"
          label="Save"
          @click="handleSaveRating"
          flat
          dense
          no-caps
        />
        <QBtn :icon="tabX" label="Close" @click="expanded = false" flat dense no-caps />
      </QCardActions>
    </QCard>
  </QDialog>
</template>

<script setup lang="ts">
import { QToolbar } from "quasar";
import {
  tabCheck,
  tabChevronCompactDown,
  tabChevronCompactUp,
  tabMessage2Plus,
  tabX,
} from "quasar-extras-svg-icons/tabler-icons-v2";

const props = defineProps<{
  saving: boolean;
  existingRating?: Rating;
}>();

const { dark } = storeToRefs(useAppStore());

const emits = defineEmits<{
  saveRating: [Omit<Rating, "author">];
}>();

const expanded = ref(false);

const visible = ref(true);

const sliderProps = {
  min: 0,
  max: 5,
  step: 0.5,
  snap: true,
  label: true,
  dense: true,
  color: "accent",
  style: "width: 120px",
};

const overallScore = ref<number>(2.5);

const depthScore = ref<number>();

const clarityScore = ref<number>();

const thoroughnessScore = ref<number>();

const notes = ref("");

// Watch and reload the ratings if one is present.
watch(
  () => props.existingRating,
  (rating) => {
    overallScore.value = rating?.overall ?? 2.5;
    depthScore.value = rating?.depth;
    clarityScore.value = rating?.clarity;
    thoroughnessScore.value = rating?.thoroughness;
    notes.value = rating?.comments ?? "";
  },
  { immediate: true }
);

function handleSaveRating() {
  emits("saveRating", {
    overall: overallScore.value,
    thoroughness: thoroughnessScore.value,
    depth: depthScore.value,
    clarity: clarityScore.value,
    comments: notes.value,
  });

  expanded.value = false;
}
</script>

<style scoped></style>
