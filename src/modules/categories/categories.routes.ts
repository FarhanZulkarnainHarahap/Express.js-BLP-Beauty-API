import { z } from "zod";
import { crudRouter } from "../shared.js";
import { categoriesController } from "./categories.controller.js";

export const categoriesRouter = crudRouter(
  categoriesController,
  z.object({
    name: z.string().min(2),
    description: z.string().nullable().optional(),
    imageUrl: z.string().url().nullable().optional(),
  }),
);
