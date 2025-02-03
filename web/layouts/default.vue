<template>
  <QLayout
    view="hHh lpR fFf"
    :class="{
      'bg-dark text-white': dark,
      'bg-white text-black': !dark,
    }"
  >
    <QHeader
      class="header row"
      :class="{
        'bg-dark text-white': dark,
        'bg-white text-black': !dark,
      }"
    >
      <QToolbar class="q-py-sm offset-md-2 col-md-8 col-sm-12 toolbar">
        <QToolbarTitle
          class="text-h4 text-weight-medium cursor-pointer"
          @click="navigateTo('/')"
        >
          CodeRev.app
        </QToolbarTitle>

        <QBtn
          title="Toggle dark mode"
          :icon="dark ? tabMoon : tabSun"
          :size="$q.screen.gt.sm ? 'lg' : 'md'"
          @click="$q.dark.toggle()"
          dense
          flat
        />

        <QBtn
          title="GitHub"
          :icon="tabBrandGithub"
          :size="$q.screen.gt.sm ? 'lg' : 'md'"
          @click="
            navigateTo('https://github.com/CharlieDigital/coderev', {
              external: true,
              open: { target: '_blank' },
            })
          "
          dense
          flat
        />

        <QBtn
          v-if="!$route.fullPath.includes('login')"
          title="Login"
          color="brand"
          class="q-ml-sm"
          :label="$q.screen.gt.sm ? 'Login' : undefined"
          :size="$q.screen.gt.sm ? 'lg' : 'md'"
          :icon="tabLogin"
          to="/login"
          unelevated
          no-caps
        />
      </QToolbar>
    </QHeader>

    <QPageContainer :class="[dark ? 'bg-dark' : 'bg-white']">
      <NuxtPage />
    </QPageContainer>
  </QLayout>
</template>

<script setup lang="ts">
import { navigateTo } from 'nuxt/app';
import { tabBrandGithub } from "quasar-extras-svg-icons/tabler-icons";
import {
  tabLogin,
  tabMoon,
  tabSun,
} from "quasar-extras-svg-icons/tabler-icons-v2";

const $q = useQuasar();

const dark = computed(() => $q.dark.isActive);
</script>

<style scoped>
.header {
  opacity: 0.95;
}
</style>
