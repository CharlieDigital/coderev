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

    <QItem v-bind="leftMenuProps" @click="sendFeedback" manual-focus clickable>
      <QItemSection avatar>
        <QIcon :name="tabMail" />
      </QItemSection>
      <QItemSection>
        <QItemLabel class="text-h6"> Feedback </QItemLabel>
      </QItemSection>
    </QItem>
  </QList>
</template>

<script setup lang="ts">
import { tabMail, tabMoon, tabSun } from "quasar-extras-svg-icons/tabler-icons";

const $q = useQuasar();

const dark = computed(() => $q.dark.isActive);

/**
 * Opens a mail to link.
 */
function sendFeedback() {
  window.location.href = "mailto:chen.charles.c@gmail.com";
}
</script>

<style scoped></style>
