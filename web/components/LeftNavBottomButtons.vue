<template>
  <QList class="col-shrink q-my-md">
    <QItem
      v-bind="leftMenuProps"
      @click="$q.dark.toggle()"
      manual-focus
      clickable
    >
      <QItemSection avatar>
        <QIcon :name="dark ? tabMoon : tabSun" />
      </QItemSection>
      <QItemSection>
        <QItemLabel class="text-h6">
          {{ dark ? "Dark mode" : "Light mode" }}
        </QItemLabel>
      </QItemSection>
    </QItem>

    <QItem
      v-bind="leftMenuProps"
      @click="navigateTo('https://github.com/CharlieDigital/coderev/issues', {
        external: true,
        open: {
          target: '_blank'
        }
      })"
      manual-focus
      clickable>
      <QItemSection avatar>
        <QIcon :name="tabBrandGithub" />
      </QItemSection>
      <QItemSection>
        <QItemLabel class="text-h6"> Feedback </QItemLabel>
      </QItemSection>
    </QItem>
  </QList>
</template>

<script setup lang="ts">
import { tabBrandGithub, tabMoon, tabSun  } from "quasar-extras-svg-icons/tabler-icons-v2";

const $q = useQuasar();

const dark = computed(() => $q.dark.isActive);
</script>

<style scoped></style>
