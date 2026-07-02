import { Router } from "express";
import { z } from "zod";
import { verifyInternalToken } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { newsletterController } from "./newsletter.controller.js";

export const newsletterRouter = Router();

newsletterRouter.post(
  "/",
  validate(z.object({ email: z.string().email() })),
  newsletterController.subscribe,
);
newsletterRouter.get("/", verifyInternalToken, requireAdmin, newsletterController.list);
newsletterRouter.delete("/:id", verifyInternalToken, requireAdmin, newsletterController.remove);
