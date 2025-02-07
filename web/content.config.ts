import { defineContentConfig, defineCollection, z } from '@nuxt/content'
import { asSitemapCollection } from '@nuxtjs/sitemap/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection(asSitemapCollection({
      type: 'page',
      source: {
        include: '**/*.md',
        prefix: '/blog/',
      },
      schema: z.object({
        author: z.string(),
        date: z.string(),
      })
    }))
  }
})
