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
      :height-hint="115"
      :class="{
        'bg-dark text-white': dark,
        'bg-white text-black': !dark,
      }"
    >
      <QToolbar class="q-py-sm offset-md-2 col-md-8 col-sm-12 toolbar">
        <QToolbarTitle
          class="text-h5 text-weight-medium cursor-pointer"
          @click="navigateTo('/')"
        >
          CodeRev.app
        </QToolbarTitle>

        <QBtn
          title="Toggle dark mode"
          class="gt-sm"
          size="lg"
          :icon="dark ? tabMoon : tabSun"
          @click="$q.dark.toggle()"
          dense
          flat
        />

        <QBtn
          title="Toggle dark mode"
          class="lt-md"
          :icon="dark ? tabMoon : tabSun"
          @click="$q.dark.toggle()"
          dense
          flat
        />

        <QBtn
          title="GitHub"
          size="lg"
          class="gt-sm"
          :icon="tabBrandGithub"
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
          title="GitHub"
          class="lt-md"
          :icon="tabBrandGithub"
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
          class="gt-sm q-ml-sm"
          label="Login"
          size="lg"
          :icon="tabLogin"
          to="/login"
          unelevated
          no-caps
        />
        <QBtn
          v-if="!$route.fullPath.includes('login')"
          title="Login"
          color="brand"
          class="q-ml-sm lt-md"
          :icon="tabLogin"
          to="/login"
          unelevated
          no-caps
        />
      </QToolbar>

      <QTabs v-model="tab" class="col-12">
        <QRouteTab label="Home" name="home" no-caps to="/" />
        <QRouteTab label="Blog" name="blog" no-caps to="/blog" exact />
        <QTab v-if="isPost" label="Post" name="post" no-caps />
      </QTabs>
    </QHeader>

    <QPageContainer :class="[dark ? 'bg-dark' : 'bg-white']">
      <QPage class="" padding>
        <NuxtPage />
      </QPage>
    </QPageContainer>

    <QFooter
      class="text-center q-py-sm"
      :height-hint="53"
      :class="[dark ? 'bg-grey-19' : 'bg-white']"
      reveal
      bordered
    >
      <QChip
        size="md"
        :color="dark ? 'grey-8' : undefined"
        @click="
          navigateTo('https://chrlschn.dev', {
            external: true,
            open: { target: '_blank' },
          })
        "
        clickable
      >
        <QAvatar size="sm">
          <img src="/chrlschn.jpg" title="Charles Chen" alt="Charles Chen" />
        </QAvatar>
        Charles Chen
      </QChip>

      <QChip
        size="md"
        :color="dark ? 'grey-8' : undefined"
        @click="
          navigateTo('https://bsky.app/profile/chrlschn.bsky.social', {
            external: true,
            open: { target: '_blank' },
          })
        "
        clickable
      >
        <QAvatar class="bg-accent" text-color="white" font-size="0.9em" size="sm">
          <QIcon :name="tabButterfly" />
        </QAvatar>
        @chrlschn
      </QChip>

      <QChip
        size="md"
        :color="dark ? 'grey-8' : undefined"
        @click="
          navigateTo('https://mastodon.social/@chrlschn', {
            external: true,
            open: { target: '_blank' },
          })
        "
        clickable
      >
        <QAvatar class="bg-accent" text-color="white" font-size="0.9em" size="sm">
          <QIcon :name="tabBrandMastodon" />
        </QAvatar>
        @chrlschn
      </QChip>
    </QFooter>
  </QLayout>
</template>

<script setup lang="ts">
import { navigateTo } from "nuxt/app";
import { tabBrandGithub } from "quasar-extras-svg-icons/tabler-icons";
import {
  tabBrandMastodon,
  tabButterfly,
  tabLogin,
  tabMoon,
  tabSun,
} from "quasar-extras-svg-icons/tabler-icons-v2";

const $q = useQuasar();

const $route = useRoute();

const tab = ref<"home" | "blog" | "post">("home");

const dark = computed(() => $q.dark.isActive);

const isPost = computed(() => $route.path.startsWith("/blog/"));

watch(
  $route,
  (route) => {
    if (isPost.value) {
      tab.value = "post";
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.header {
  opacity: 0.95;
}
</style>
