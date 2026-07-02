import { z } from "zod";
import { crudRouter } from "../shared.js";
import { bannersController } from "./banners.controller.js";

export const bannersRouter = crudRouter(
  bannersController,
  z.object({
    title: z.string().min(2),
    subtitle: z.string().min(5),
    imageUrl: z.string().url(),
    buttonText: z.string().min(2),
    buttonLink: z.string().min(1),
    isActive: z.boolean().default(true),
  }),
);
