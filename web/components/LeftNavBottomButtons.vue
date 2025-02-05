<template>
  <QList class="col-shrink q-my-md">
    <QItem
      v-if="showToggle"
      v-bind="leftMenuProps"
      @click="emits('toggle')"
      manual-focus
      clickable
    >
      <QItemSection avatar>
        <QIcon :name="tablerIconsV2.tabArrowBarToLeft" />
      </QItemSection>
      <QItemSection>
        <QItemLabel class="text-h6"> Toggle </QItemLabel>
      </QItemSection>
    </QItem>

    <QItem v-bind="leftMenuProps" @click="$q.dark.toggle()" manual-focus clickable>
      <QItemSection avatar>
        <QIcon :name="dark ? tablerIconsV2.tabMoon : tablerIconsV2.tabSun" />
      </QItemSection>
      <QItemSection>
        <QItemLabel class="text-h6">
          {{ dark ? "Dark mode" : "Light mode" }}
        </QItemLabel>
      </QItemSection>
    </QItem>

    <QItem
      v-bind="leftMenuProps"
      @click="
        navigateTo('https://github.com/CharlieDigital/coderev/issues', {
          external: true,
          open: {
            target: '_blank',
          },
        })
      "
      manual-focus
      clickable
    >
      <QItemSection avatar>
        <QIcon :name="tablerIconsV2.tabBrandGithub" />
      </QItemSection>
      <QItemSection>
        <QItemLabel class="text-h6"> Feedback </QItemLabel>
      </QItemSection>
    </QItem>
  </QList>
</template>

<script setup lang="ts">
import { navigateTo } from "nuxt/app";
import * as tablerIconsV2 from "quasar-extras-svg-icons/tabler-icons-v2";
import { leftMenuProps } from "../utils/commonProps";

const $q = useQuasar();

const props = defineProps<{
  showToggle?: boolean;
}>();

const emits = defineEmits<{
  toggle: [];
}>();

const dark = computed(() => $q.dark.isActive);
</script>

<style scoped></style>
