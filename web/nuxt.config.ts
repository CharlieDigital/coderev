// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  site: {
    url: "coderev.app"
  },
  compatibilityDate: '2024-11-01',
  app: {
    pageTransition: { name: "page", mode: "out-in" }
  },
  modules: [
    "nuxt-quasar-ui",
    "@pinia/nuxt",
    "dayjs-nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/google-fonts",
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    '@nuxt/content',
  ],
  sitemap: {
    include: ['/', '/blog', '/blog/**']
  },
  robots: {
    disallow: ['/login', '/home', '/privacy', '/terms'],
  },
  imports: {
    dirs: ["../shared/**", "./stores/**", "./utils/**"],
    global: true
  },
  googleFonts: {
    families: {
      "M PLUS 2": [300, 400, 500, 700]
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
  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            // Default theme (same as single string)
            default: 'github-light',
            // Theme used if `html.dark`
            dark: 'github-dark',
            // Theme used if `html.sepia`
            sepia: 'monokai'
          },
          langs: ['json', 'js', 'ts', 'html', 'css', 'vue', 'shell']
        }
      }
    }
  },
  nitro: {
    prerender: {
      routes: ['/sitemap.xml', '/robots.txt']
    }
  },
  routeRules: {
    // https://nuxt.com/docs/guide/concepts/rendering#hybrid-rendering
    "/": { prerender: true },
    "/blog": { ssr: false },
    "/blog/**": { ssr: false },
    "/terms": { prerender: true },
    "/privacy": { prerender: true },
    "/login": { ssr: false },
    "/home": { ssr: false },
    "/workspace/**": { ssr: false },
    "/review/**": { ssr: false },
  },
});
