import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/astro/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    order: z.number().default(99),
    showInNav: z.boolean().default(true),
  }),
});

const changelog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/astro/content/changelog' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    tag: z.string(),
    notes: z.string().optional(),
  }),
});

export const collections = { docs, changelog };
