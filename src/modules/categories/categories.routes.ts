import { z } from "zod";
import { crudRouter } from "../shared.js";

export const categoriesRouter = crudRouter(
  "category",
  z.object({
    name: z.string().min(2),
    description: z.string().nullable().optional(),
    imageUrl: z.string().url().nullable().optional(),
  }),
  { slug: true },
);
