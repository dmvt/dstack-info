import { defineCollection, z } from 'astro:content';

const tutorialsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    section: z.string(),
    stepNumber: z.number().nullable(),
    totalSteps: z.number().nullable(),
    lastUpdated: z.date(),
    prerequisites: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    estimatedTime: z.string().optional(),
  }),
});

export const collections = {
  tutorials: tutorialsCollection,
};
