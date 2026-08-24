import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    locale: z.enum(['pt-BR', 'en']),
    client: z.string(),
    category: z.string(),
    summary: z.string(),
    challenge: z.string(),
    solution: z.string(),
    result: z.string(),
    services: z.array(z.string()),
    technologies: z.array(z.string()),
    year: z.number(),
    featured: z.boolean(),
    seoTitle: z.string(),
    seoDescription: z.string(),
  }),
});

export const collections = { projects };
