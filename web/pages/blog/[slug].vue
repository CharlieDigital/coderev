<template>
  <div>
    <ContentRenderer v-if="post" :value="post" />
    <div v-else>Post not found</div>
  </div>
</template>

<script setup lang="ts">
const slug = useRoute().params.slug;

const { data: post } = await useAsyncData(() =>
  queryCollection("blog")
    .path(`/blog/${slug as string}`)
    .first()
);

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
</style>
