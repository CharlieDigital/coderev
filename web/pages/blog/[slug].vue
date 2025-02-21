<template>
  <div>
    <ContentRenderer v-if="post" :value="post" />
    <div v-else>Post not found</div>
  </div>
</template>

<script setup lang="ts">
const $q = useQuasar();

const $route = useRoute();

const slug = computed(() => $route.params.slug);

// const codeBg = computed(() => ($q.dark.isActive ? "#282a36" : "#f3f3f3"));

const codeBg = computed(() => "#282a36");

console.log(`Current slug: ${slug.value}`);

const { data: post } = await useAsyncData((slug.value as string) ?? "post", () =>
  queryCollection("blog")
    .path(`/blog/${slug.value as string}`)
    .first()
);

useHead({
  link: [
    {
      rel: "canonical",
      href: `https://coderev.app/blog/${slug.value}`,
    },
  ],
});

useSeoMeta({
  title: post.value?.title,
  description: post.value?.description,
  ogTitle: post.value?.title,
  ogDescription: post.value?.description,
  ogUrl: `${baseUrl}/blog/${slug}`,
  ogImage: `${baseUrl}/${post.value?.ogImage?.replace("/", "") ?? "coderev-og.png"}`,
  twitterTitle: post.value?.title,
  twitterDescription: post.value?.description,
  twitterCard: "summary_large_image",
  twitterImage: `${baseUrl}/${post.value?.ogImage?.replace("/", "") ?? "coderev-og.png"}`,
});
</script>

<style scoped>
:deep(h1) {
  font-size: 40px;
  margin: 18px 0px;
  line-height: 1.1em;
}

:deep(h2) {
  font-size: 24px;
  margin: 36px 0px 12px 0px;
  line-height: 1.1em;
  position: relative;
}

:deep(h2) a {
  color: inherit;
  font-weight: 500;
  text-decoration: none;
}

:deep(h2):hover a::before {
  position: absolute;
  content: "#";
  display: block;
  margin-left: -24px;
}

:deep(.post-author),
:deep(.post-date) {
  font-style: italic;
  color: #666;
}

:deep(.post-author) {
  font-weight: 600;
}

:deep(.post-desc) {
  display: block;
  font-size: 22px;
  opacity: 0.7;
  padding: 18px 0px;
  margin: 32px 0px;
  border-bottom: 1px solid #ccc;
  border-top: 1px solid #ccc;
}

:deep(p),
:deep(li) {
  font-size: 16px;
}

:deep(li) {
  margin-bottom: 8px;
}

:deep(hr) {
  margin: 32px 120px;
  color: #ccc;
  background-color: #ccc;
  height: 1px;
  border: none;
}

:deep(blockquote) p {
  font-size: 36px !important;
  font-style: italic;
  line-height: 1.4em;
  opacity: 0.6;
  padding: 0px 2%;
}

:deep(p):nth-of-type(3):first-letter,
:deep(hr) + p:first-letter {
  font-weight: 500;

  /* Firefox */
  float: left;
  font-size: 48px;
  padding: 8px 8px 0px 0px;

  /* Chrome and Safari */
  -webkit-initial-letter: 2;
  initial-letter: 2;
  padding-right: 8px;
}

:deep(.shiki) {
  background-color: v-bind(codeBg);
  border-radius: 8px;
  padding: 12px 0px;
  border: 1px solid #454545;
}

:deep(code) {
  counter-reset: step;
  counter-increment: step 0;
}

:deep(code) .line::before {
  content: counter(step);
  counter-increment: step;
  width: 1rem;
  margin-right: 1.5rem;
  display: inline-block;
  text-align: right;
  color: rgba(169, 180, 184, 0.7);
}
</style>
