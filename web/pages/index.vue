<template>
  <div class="row">
    <QPage
      class="q-pb-xl offset-xl-3 offset-md-2 col-xl-6 col-md-8 col-sm-12 text-center"
    >
      <section class="q-pb-xl q-px-md">
        <div class="header">
          <h1 class="q-my-none q-py-xl">Code review as interview made easy.</h1>
          <p>
            CodeRev is a lightweight tool to help you organize and conduct technical
            interviews using code reviews rather than leetcode.
          </p>
          <QBtn
            v-bind="btnProps"
            to="/login"
            label="Get started (it's free!)"
            class="q-mt-md"
            size="xl"
            color="accent"
          />
        </div>
      </section>

      <video
        preload="none"
        controls
        name="media"
        class="rounded-borders shadow-2"
        style="width: 100%"
        poster="https://storage.googleapis.com/media.coderev.app/code-rev-intro.webp"
        title="CodeRev.app 3 minute intro.">
        <source
          src="https://storage.googleapis.com/media.coderev.app/code-rev-intro-720p-hb-1000.mp4"
          type="video/mp4" />
      </video>

      <section class="q-px-md">
        <h2
          class="q-my-none q-pt-lg q-pb-md"
          :class="[dark ? 'text-deep-purple-3' : 'text-accent']"
        >
          Rationale
        </h2>

        <p>
          In the age of StackOverflow and ChatGPT, is leetcode really the best way to
          evaluate technical candidates?
        </p>
        <p><em>Was it ever?</em></p>

        <p>Try code review as interview instead!</p>

        <div class="row q-col-gutter-md q-mb-xl q-mt-lg justify-center">
          <div v-for="reason in reasons" class="col-md-4 col-sm-12">
            <QCard class="fit justify-between column" :bordered="dark">
              <QCardSection class="text-h6">{{ reason }}</QCardSection>
            </QCard>
          </div>
        </div>

        <p>
          A candidate's ability to read and reason about your existing code can be a
          better measure of how quickly they can adapt to your team and how you would
          expect them to contribute to your ongoing efforts. And in most cases, a new
          hire's first days are focused on reading code.
        </p>

        <QBtn
          v-bind="btnProps"
          :icon="tabExternalLink"
          @click="
            navigateTo(
              'https://chrlschn.dev/blog/2023/07/interviews-age-of-ai-ditch-leetcode-try-code-reviews-instead/',
              { external: true, open: { target: '_blank' } }
            )
          "
          label="Read more"
          class="q-mt-md"
          size="xl"
          color="accent"
        />

        <!--
        <p>
          Code reviews as interview allow your team to evaluate a technical
          candidate in a more realistic, day-to-day interaction model that is
          collaborative and open-ended; it better reflects how a candidate
          thinks in the context of the code that your team sees day-in-day-out.
        </p>
        <p>
          It also lets you get a feel for what it would be like to work with
          your candidate by understanding how they would interact with snippets of
          your team's codebase.
        </p>
        -->
      </section>

      <section class="row q-px-md">
        <div class="col-12">
          <h2
            class="q-my-none q-pt-xl q-pb-md"
            :class="[dark ? 'text-deep-purple-3' : 'text-accent']"
          >
            How it works
          </h2>

          <QResponsive :ratio="1400 / 805" class="rounded-borders">
            <QCarousel v-model="slide" animated swipeable infinite keep-alive>
              <template #navigation-icon="{ active, btnProps, onClick }">
                <q-btn
                  v-if="active"
                  size="md"
                  :icon="btnProps.icon"
                  color="accent"
                  flat
                  round
                  dense
                  @click="onClick"
                  title="Slide"
                />
                <q-btn
                  v-else
                  size="sm"
                  :icon="btnProps.icon"
                  color="accent"
                  flat
                  round
                  dense
                  @click="onClick"
                  title="Slide"
                  style="opacity: 0.7"
                />
              </template>

              <QCarouselSlide
                v-for="(screenshot, index) in screenshots"
                class="q-pa-none"
                :name="`slide-${index}`"
              >
                <QImg
                  class="rounded-borders"
                  :title="screenshot.text"
                  :src="screenshot.path"
                >
                  <QBanner
                    v-if="$q.screen.gt.sm"
                    class="absolute-bottom q-ma-md rounded-borders slide-caption"
                  >
                    <span class="text-h6">
                      {{ screenshot.text }}
                    </span>
                  </QBanner>
                </QImg>
              </QCarouselSlide>
            </QCarousel>
          </QResponsive>

          <QBanner v-if="$q.screen.lt.md" class="rounded-borders">
            <span class="text-h6">
              {{ screenshots[Number.parseInt(slide.split("-")[1])].text }}
            </span>
          </QBanner>

          <div class="row q-gutter-sm justify-center q-mt-xs">
            <QBtn
              v-for="(screenshot, index) in screenshots"
              color="accent"
              @click="slide = `slide-${index}`"
              :icon="slide === `slide-${index}` ? tabCircleFilled : tabCircle"
              round
              flat
              dense
            />
          </div>
        </div>
      </section>

      <section class="q-px-md">
        <h2
          class="q-my-none q-pt-xl q-pb-md"
          :class="[dark ? 'text-deep-purple-3' : 'text-accent']"
        >
          Benefits
        </h2>

        <p>Why use CodeRev? Why not just a GitHub repo or CodeSandbox or Stackblitz?</p>

        <div class="row q-col-gutter-md">
          <div v-for="entry in benefits" class="col-md-4 col-12">
            <QCard class="fit justify-between column" :bordered="dark">
              <QCardSection class="text-h5">{{ entry.title }}</QCardSection>
              <QCardSection class="text-body1">{{ entry.text }}</QCardSection>
              <QCardSection>
                <QChip
                  v-if="entry.ready"
                  label="Ready"
                  :icon="tabCheck"
                  :color="dark ? 'light-green-8' : 'light-green-2'"
                  :text-color="dark ? 'light-green-2' : 'light-green-8'"
                />
                <QChip
                  v-else
                  label="Future"
                  :icon="tabClock"
                  :color="dark ? 'grey-9' : 'grey-2'"
                  :text-color="dark ? 'grey-6' : 'grey-9'"
                />
              </QCardSection>
            </QCard>
          </div>
        </div>
      </section>

      <section class="q-px-md">
        <h2
          class="q-my-none q-pt-xl q-pb-md"
          :class="[dark ? 'text-deep-purple-3' : 'text-accent']"
        >
          FAQ
        </h2>

        <template v-for="faq in Object.entries(faqs)">
          <h3>{{ faq[0] }}</h3>
          <p v-html="faq[1]"></p>
        </template>
      </section>

      <section class="q-my-lg">
        <QChip
          size="lg"
          :color="dark ? 'grey-8' : undefined"
          @click="
            navigateTo('https://chrlschn.dev', {
              external: true,
              open: { target: '_blank' },
            })
          "
          clickable
        >
          <QAvatar>
            <img src="/chrlschn.jpg" title="Charles Chen" alt="Charles Chen" />
          </QAvatar>
          Charles Chen
        </QChip>

        <QChip
          size="lg"
          :color="dark ? 'grey-8' : undefined"
          @click="
            navigateTo('https://mastodon.social/@chrlschn', {
              external: true,
              open: { target: '_blank' },
            })
          "
          clickable
        >
          <QAvatar class="bg-accent" text-color="white" font-size="0.9em">
            <QIcon :name="tabBrandMastodon" />
          </QAvatar>
          @chrlschn
        </QChip>

        <QChip
          size="lg"
          :color="dark ? 'grey-8' : undefined"
          @click="
            navigateTo('https://github.com/CharlieDigital/coderev', {
              external: true,
              open: { target: '_blank' },
            })
          "
          clickable
        >
          <QAvatar class="bg-accent" text-color="white" font-size="0.9em">
            <QIcon :name="tabBrandGithub" />
          </QAvatar>
          coderev
        </QChip>
      </section>
    </QPage>

    <ClientOnly>
      <AnalyticsWrapper />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import {
  tabBrandGithub,
  tabBrandMastodon,
  tabCheck,
  tabCircle,
  tabClock,
  tabExternalLink,
} from "quasar-extras-svg-icons/tabler-icons";
import { tabCircleFilled } from "quasar-extras-svg-icons/tabler-icons-v2";
import { btnProps } from "../utils/commonProps";

const description =
  "CodeRev is a lightweight tool to help you organize and conduct technical interviews using code reviews rather than leetcode.";

const title = "CodeRev.app - Code Review as Interview";

useHeadSafe({
  title: title,
  meta: [{ name: "description", content: description }],
});

useSeoMeta({
  title: title,
  description: description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: import.meta.env.VITE_PUBLISHED_BASE_URL,
  ogImage: `${baseUrl}/coderev-og.png`,
  twitterTitle: title,
  twitterDescription: description,
  twitterCard: "summary_large_image",
  twitterImage: `${baseUrl}/coderev-og.png`,
});

const slide = ref("slide-0");

const reasons = [
  "Understand how candidates interact with isolated parts of your codebase.",
  "Reflects day-to-day engineering responsibilities in your team.",
  "Better representation of how a candidate reasons, thinks, and communicates.",
  "Open-ended and collaborative; no black and white responses.",
  "Hard to game with generative AI and studying leetcode challenges.",
  "Learn more about your candidates in less time with less stress.",
  "Evaluate for technical roles biased towards reading vs writing code (manager, support).",
];

const screenshots = [
  {
    text: "Create a workspace for each of the roles you're screening for.",
    path: "/screens/coderev-workspaces.webp",
  },
  {
    text: "Upload and edit your source files that you'd like the candidates to review.",
    path: "/screens/coderev-files.webp",
  },
  {
    text: "Add candidates; each gets a separate view of the source to work on.",
    path: "/screens/coderev-candidates.webp",
  },
  {
    text:
      "Candidates review the code in their workspace and provide comments and feedback.",
    path: "/screens/coderev-comments.webp",
  },
];

const benefits = [
  {
    title: "Easy setup",
    text: "Lightweight, focused, and simple; just a few clicks to get started.",
    ready: true,
  },
  {
    title: "Isolated",
    text: "No exposure of your company GitHub repos, accounts, and workspaces.",
    ready: true,
  },
  {
    title: "Collaborative",
    text:
      "Focus on analysis, feedback, and communication; not algorithmic complexity (let GPT do that).",
    ready: true,
  },
];

const faqs = {
  "Why did you make this tool?":
    "I went through an interview where the process involved reviewing a snippet of code and really enjoyed the experience.  I thought it would be great if there was a dedicated tool for this.",
  "Why not just CodeSandbox or Stackblitz?":
    "Those tools serve a different purpose in an interview process. This tool is meant to help understand how a candidate would interact and communicate in a real-world, day-to-day responsibility of providing feedback to a teammate.",
  "Does this replace coding exercises?":
    "It can if you want it to!  But think of it as another tool you can use to help better gauge your candidates.",
  "How is this better than actual coding?":
    "Many roles such as a senior engineering manager or technical architect are more biased towards reading and evaluating code rather than writing code.  This is also the case for roles like technical support or QA who may be tracing code, but not writing code.  And in reality, we all use external resources when we typically code -- whether StackOverflow, GitHub Copilot, ChatGPT, or Reddit forums -- especially when we are dealing with algorithmically complex problems.  Coding exercises artificially create a high-stress interaction that doesn't reflect how we build and ship software in real life.",
  "What's the stack?":
    "Nuxt3 (Vue.js) + Quasar Framework + Google Cloud Firebase.  Productive, fast, and more or less free.",
  "Can you add [...]?": "Send me an email or DM and let me know!",
};

const $q = useQuasar();

const dark = computed(() => $q.dark.isActive);
</script>

<style scoped>
.header h1 {
  font-size: 4em;
  font-weight: 500;
  line-height: 1.2em;
}

.header p {
  font-size: 2em;
}

h2 {
  font-size: 3em;
}

h3 {
  margin: 0px 0px 8px 0px;
  font-size: 1.8em;
  font-weight: 700;
}

p {
  font-size: 1.4em;
}

.slide-caption {
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  box-shadow: 2px 2px 12px 2px rgba(0, 0, 0, 0.7);
}
</style>
