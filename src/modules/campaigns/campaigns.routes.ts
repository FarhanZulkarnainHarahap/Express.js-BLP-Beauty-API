import { z } from "zod";
import { crudRouter } from "../shared.js";
import { campaignsController } from "./campaigns.controller.js";

export const campaignsRouter = crudRouter(
  campaignsController,
  z.object({
    title: z.string().min(2),
    description: z.string().min(10),
    imageUrl: z.string().url(),
    buttonText: z.string().nullable().optional(),
    buttonLink: z.string().nullable().optional(),
    isPublished: z.boolean().default(false),
  }),
  { detail: true },
);
