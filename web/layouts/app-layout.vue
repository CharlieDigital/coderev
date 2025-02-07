<template>
  <QLayout view="hHh lpR fFf">
    <QHeader
      class="header row"
      :class="{
        'bg-dark text-white': dark,
        'bg-grey-2 text-black': !dark,
      }"
    >
      <QToolbar
        class="q-py-sm offset-md-2 col-md-8 col-sm-12 toolbar"
        :class="{
          'bg-dark text-white': dark,
          'bg-grey-2 text-black': !dark,
        }"
      >
        <QToolbarTitle
          class="text-h5 text-weight-medium cursor-pointer"
          @click="navigateTo('/')"
        >
          CodeRev.app
        </QToolbarTitle>

        <QBtn
          size="lg"
          :icon="dark ? tabMoon : tabSun"
          @click="$q.dark.toggle()"
          dense
          flat
        />

        <QBtn :icon="tabMenu" size="lg" class="q-ml-sm" unelevated>
          <QMenu anchor="bottom right" self="top right" auto-close>
            <QList>
              <QItem>
                <QItemSection avatar>
                  <QIcon :name="tabUser" />
                </QItemSection>
                <QItemSection>
                  <QItemLabel class="text-body1 text-bold">{{ profile.name }}</QItemLabel>
                  <QItemLabel class="text-caption">{{ profile.email }}</QItemLabel>
                </QItemSection>
              </QItem>

              <QSeparator />

              <QItem @click="showPreferencesDialog = true" clickable>
                <QItemSection avatar>
                  <QIcon :name="tabSettings2" />
                </QItemSection>
                <QItemSection> Preferences </QItemSection>
              </QItem>

              <QItem @click="sendFeedback" clickable>
                <QItemSection avatar>
                  <QIcon :name="tabBrandGithub" />
                </QItemSection>
                <QItemSection> Feedback </QItemSection>
              </QItem>

              <QItem
                @click="
                  navigateTo('https://mastodon.social/@chrlschn', {
                    external: true,
                    open: { target: '_blank' },
                  })
                "
                clickable
              >
                <QItemSection avatar>
                  <QIcon :name="tabBrandMastodon" />
                </QItemSection>
                <QItemSection> @chrlschn </QItemSection>
              </QItem>

              <QItem @click="logout" clickable>
                <QItemSection avatar>
                  <QIcon :name="tabLogout" />
                </QItemSection>
                <QItemSection> Logout </QItemSection>
              </QItem>
            </QList>
          </QMenu>
        </QBtn>
      </QToolbar>
    </QHeader>

    <QDrawer v-model="showLeftDrawer" id="top-level-drawer" side="left"> </QDrawer>

    <QPageContainer
      :class="{
        'bg-dark text-white': dark,
        'bg-grey-2 text-black': !dark,
      }"
    >
      <NuxtPage />
    </QPageContainer>
  </QLayout>
</template>

<script setup lang="ts">
import { navigateTo } from "nuxt/app";
import {
  tabBrandMastodon,
  tabMenu,
  tabSettings2,
  tabUser,
} from "quasar-extras-svg-icons/tabler-icons";
import {
  tabBrandGithub,
  tabLogout,
  tabMoon,
  tabSun,
} from "quasar-extras-svg-icons/tabler-icons-v2";

const $q = useQuasar();

const dark = computed(() => $q.dark.isActive);

const { profile, showLeftDrawer, showPreferencesDialog } = storeToRefs(useAppStore());

async function logout() {
  await firebaseConnector.logout();
}

/**
 * Opens a mail to link.
 */
async function sendFeedback() {
  await navigateTo("https://github.com/CharlieDigital/coderev/issues", {
    external: true,
    open: {
      target: "_blank",
    },
  });
}
</script>

<style scoped>
.header {
  opacity: 0.95;
}
</style>
