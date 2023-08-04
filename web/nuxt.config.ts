// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    pageTransition: { name: "page", mode: "out-in" },
  },
  alias: {
    "#shared": "../shared"
  },
  modules: [
    "nuxt-quasar-ui",
    "@pinia/nuxt",
    "dayjs-nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/google-fonts"
  ],
  imports: {
    dirs: ["../shared/**", "./stores/**", "./utils/data/**"],
  },
  googleFonts: {
    families: {
      "M PLUS Rounded 1c": [300, 400, 500, 700]
    }
  },
  quasar: {
    // https://nuxt.com/modules/quasar
    sassVariables: "./quasar-variables.sass",
    extras: {
      animations: ["fadeInUp", "fadeInDown"],
    },
    plugins: [
      "Notify"
    ]
  },
  pinia: {
    // https://pinia.vuejs.org/ssr/nuxt.html
    autoImports: ["defineStore", "acceptHMRUpdate", "storeToRefs"],
  },
  dayjs: {
    locales: ["en"],
    plugins: [
      "relativeTime",
      "utc",
      "timezone",
      "duration",
      "isTomorrow",
      "isToday",
      "isYesterday",
      "isSameOrAfter",
      "isSameOrBefore",
    ],
    defaultLocale: "en",
    defaultTimezone: "America/New_York",
  },
  routeRules: {
    // https://nuxt.com/docs/guide/concepts/rendering#hybrid-rendering
    "/": { prerender: true },
    "/terms": { prerender: true },
    "/privacy": { prerender: true },
    "/login": { ssr: false },
    "/home": { ssr: false },
    "/workspace/**": { ssr: false },
    "/review/**": { ssr: false },
  },
});
