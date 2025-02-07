<template>
  <div>
    <NuxtLayout />

    <ClientOnly>
      <AnalyticsWrapper />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
/// <reference types="quasar" />

const userThemeMode = useLocalStorage("user-theme-mode", "light");

const $q = useQuasar();

if (
  (userThemeMode.value === "light" && $q.dark.isActive) ||
  (userThemeMode.value === "dark" && !$q.dark.isActive)
) {
  $q.dark.toggle();
}

watch(
  () => $q.dark.isActive,
  (isDark) => {
    if (isDark) {
      userThemeMode.value = "dark";
    } else {
      userThemeMode.value = "light";
    }
  }
);
</script>

<style>
body * {
  font-weight: 400;
}

strong {
  font-weight: bold;
}

.page-enter-active,
.page-leave-active {
  transition: all 0.1s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}

/* Custom colors; see quasar-variables.sass for the rest */
.text-brand {
  color: #512da8 !important;
}

.bg-brand {
  background: #512da8 !important;
}
</style>

<style lang="scss">
.q-dialog__backdrop,
.q-inner-loading {
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}
</style>
