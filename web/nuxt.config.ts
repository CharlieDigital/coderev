// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2024-11-01',
  app: {
    pageTransition: { name: "page", mode: "out-in" }
  },
  modules: [
    "nuxt-quasar-ui",
    "@pinia/nuxt",
    "dayjs-nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/google-fonts"
  ],
  imports: {
    dirs: ["../shared/**", "./stores/**", "./utils/**"],
    global: true
  },
  googleFonts: {
    families: {
      "M PLUS Rounded 1c": [300, 400, 500, 700]
    }
  },
  quasar: {
    // https://nuxt.com/modules/quasar
    sassVariables: "~/quasar-variables.sass",
    extras: {
      animations: ["fadeInUp", "fadeInDown"],
    },
    plugins: [
      "Notify"
    ]
  },
  pinia: {
    // https://pinia.vuejs.org/ssr/nuxt.html
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
