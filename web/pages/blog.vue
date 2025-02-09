<template>
  <div class="row">
    <section
      v-if="$route.path.endsWith('/blog')"
      class="q-pb-xl q-pt-lg offset-xl-3 offset-md-2 offset-sm-1 col-xl-6 col-md-8 col-sm-10 col-xs-12"
    >
      <QList>
        <QItem
          v-for="post in posts"
          class="rounded-borders q-pa-md"
          @click="navigateTo(post.path)"
          clickable
        >
          <QItemSection>
            <QItemLabel class="text-h6 text-bold post-title">
              <NuxtLink :to="post.path">{{ post.title }}</NuxtLink>
            </QItemLabel>
            <QItemLabel class="q-pb-sm text-italic" caption>
              {{ post.author }} - {{ post.date }}
            </QItemLabel>
            <QItemLabel>
              {{ post.description }}
            </QItemLabel>
          </QItemSection>
        </QItem>
      </QList>
    </section>
    <section
      v-else
      class="q-pb-xl q-pt-lg offset-xl-4 offset-md-3 offset-sm-2 col-xl-4 col-md-6 col-sm-8 col-xs-12"
    >
      <NuxtPage />

      <QSeparator spaced="xl" />

      <h6 class="q-my-lg text-center">Read more</h6>

      <QList>
        <QItem
          v-for="post in posts?.filter((p) => p.path !== $route.path).slice(0, 2)"
          class="rounded-borders q-pa-sm"
          @click="navigateTo(post.path)"
          clickable
        >
          <QItemSection>
            <QItemLabel class="text-h6 text-bold post-title">
              <NuxtLink :to="post.path">{{ post.title }}</NuxtLink>
            </QItemLabel>
            <QItemLabel class="q-pb-sm text-italic" caption>
              {{ post.author }} - {{ post.date }}
            </QItemLabel>
            <QItemLabel>
              {{ post.description }}
            </QItemLabel>
          </QItemSection>
        </QItem>
      </QList>
    </section>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from "#app";

useHeadSafe({
  title: "CodeRev.app | Blog Posts",
});

const $q = useQuasar();

const $route = useRoute();

console.log($route.path);

const { data: posts } = await useAsyncData("blog", () => queryCollection("blog").all());
</script>

<style scoped>
.post-title a {
  text-decoration: none;
}

.post-title a,
.post-title a:visited {
  color: var(--q-accent);
}
</style>
