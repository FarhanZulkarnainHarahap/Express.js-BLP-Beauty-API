import { z } from "zod";
import { crudRouter } from "../shared.js";
import { articlesController } from "./articles.controller.js";

export const articlesRouter = crudRouter(
  articlesController,
  z.object({
    title: z.string().min(2),
    content: z.string().min(20),
    excerpt: z.string().nullable().optional(),
    imageUrl: z.string().url().nullable().optional(),
    isPublished: z.boolean().default(false),
  }),
  { detail: true },
);
