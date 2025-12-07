import { defineCollection, z } from 'astro:content';

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // Required fields
    title: z.string().min(1).max(100),
    pubDate: z.coerce.date(),

    // Optional fields
    description: z.string().max(200).optional(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),

    // Hero image (optional)
    heroImage: z
      .object({
        src: z.string(),
        alt: z.string(),
      })
      .optional(),
  }),
});

export const collections = {
  posts: postsCollection,
};
