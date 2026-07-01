import { z } from "zod";
import { crudRouter } from "../shared.js";

export const campaignsRouter = crudRouter(
  "campaign",
  z.object({
    title: z.string().min(2),
    description: z.string().min(10),
    imageUrl: z.string().url(),
    buttonText: z.string().nullable().optional(),
    buttonLink: z.string().nullable().optional(),
    isPublished: z.boolean().default(false),
  }),
  { slug: true, detail: true, publicWhere: { isPublished: true } },
);
