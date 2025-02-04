<template>
  <div class="row">
    <QCard class="offset-md-4 col-md-4 offset-sm-1 col-sm-10 col-xs-12" flat>
      <QCardSection class="text-center">
        <QInput
          v-model="userEmail"
          label="Email"
          :hint="emailHint"
          :color="btnColor"
          outlined
        >
          <template #append>
            <QBtn :icon="tabUserBolt" @click="generateEmail">
              <QTooltip>Generate random</QTooltip>
            </QBtn>
          </template>
        </QInput>

        <QInput
          ref="passwordInput"
          v-model="userPassword"
          label="Password"
          class="q-mt-md"
          hint="6 characters or more"
          type="password"
          :color="btnColor"
          outlined
        />

        <QBanner
          v-show="errorMessage !== ''"
          class="bg-red-8 text-white rounded-borders dense q-mt-md q-py-none"
          dense
        >
          <template #avatar>
            <QAvatar size="md" :icon="tabUserExclamation" />
          </template>
          {{ errorMessage }}
        </QBanner>

        <QBtn
          v-bind="btnProps"
          label="Login"
          color="accent"
          class="q-mt-md"
          :icon="tabLogin"
          :disable="invalidInputs"
          @click="handleLogin"
        />

        <QBtn
          v-bind="btnProps"
          label="Signup"
          color="accent"
          class="q-mt-md q-ml-md"
          :icon="tabUserPlus"
          :disable="invalidInputs"
          @click="handleSignup"
        />
      </QCardSection>
      <QSeparator />
      <QCardSection>
        <QBtn
          v-bind="btnProps"
          class="full-width q-mt-md"
          label="Github"
          size="lg"
          :icon="tabBrandGithub"
          :outline="dark"
          @click="firebaseConnector.loginGithub()"
        />
        <QBtn
          v-bind="btnProps"
          class="full-width q-mt-md"
          label="Google"
          size="lg"
          :icon="tabBrandGoogle"
          :outline="dark"
          @click="firebaseConnector.loginGoogle()"
        />
      </QCardSection>
      <QCardSection class="text-center">
        By logging in, you acknowledge agreement with the<br />
        <a href="/privacy" target="_blank">privacy policy</a> and
        <a href="/terms" target="_blank">terms and conditions</a>.
      </QCardSection>
    </QCard>
  </div>
</template>

<script setup lang="ts">
/// <reference types="quasar" />
import { btnProps } from "../utils/commonProps";
import { firebaseConnector } from "../utils/data/FirebaseConnector";
import { navigateTo } from "nuxt/app";
import { QInput, QSlideTransition } from "quasar";
import {
  tabLogin,
  tabUserExclamation,
  tabUserPlus,
} from "quasar-extras-svg-icons/tabler-icons";
import {
  tabBrandGithub,
  tabBrandGoogle,
  tabUserBolt,
} from "quasar-extras-svg-icons/tabler-icons-v2";

const passwordInput = ref<QInput>();

const $q = useQuasar();

const dark = computed(() => $q.dark.isActive);

const { profile, user } = storeToRefs(useAppStore());

const { copy } = useClipboard();

const userEmail = ref("");

const defaultHint = "Any valid unique string that matches an email (generate one!)";

const emailHint = ref(defaultHint);

const userPassword = ref("");

const errorMessage = ref("");

useHeadSafe({
  title: "CodeRev.app | Login",
});

onBeforeMount(async () => {
  if (!!profile.value && !!user.value) {
    await navigateTo("/home");
  }
});

const btnColor = computed(() => (dark.value ? "deep-purple-4" : "accent"));

// https://stackoverflow.com/a/48800/116051
const emailPattern = /^\S+@\S+\.\S+$/;

// TODO: Regex check; complexity check
const invalidInputs = computed(
  () =>
    userEmail.value.trim().length === 0 ||
    !userEmail.value.toLowerCase().match(emailPattern) ||
    userPassword.value.trim().length < 6
);

function generateEmail() {
  const generated = `${nanoid(12).toLowerCase()}@coderev.app`;
  userEmail.value = generated;
  copy(generated);

  emailHint.value = "Copied to clipboard";

  window.setTimeout(() => (emailHint.value = defaultHint), 2500);

  passwordInput.value?.focus();
}

async function handleLogin() {
  try {
    await firebaseConnector.loginEmailUser(userEmail.value, userPassword.value);
  } catch (e) {
    console.error(e);
    errorMessage.value = "An error occurred while logging in.";
  }
}

async function handleSignup() {
  try {
    await firebaseConnector.createEmailUser(userEmail.value, userPassword.value);
  } catch (e) {
    console.error(e);
    errorMessage.value = "An error occurred while creating the account.";
  }
}
</script>

<style scoped>
a,
a:visited {
  color: #7a5cc0;
}

:deep(.q-btn__content) {
  font-size: 1.3rem;
}
</style>
