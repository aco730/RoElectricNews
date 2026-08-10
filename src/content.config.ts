import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const articole = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articole" }),
  schema: z.object({
    title: z.string(),
    categorie: z.string(),
    data: z.date(),
    dataAdaugare: z.string().optional(),
    sursaNume: z.string().optional(),
    sursaUrl: z.string().optional(),
    imagine: z.string().optional(),
    etichete: z.array(z.string()).optional(),
  }),
});

export const collections = { articole };
