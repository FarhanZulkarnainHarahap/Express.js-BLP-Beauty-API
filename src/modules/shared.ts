import { Router } from "express";
import { z, type ZodObject } from "zod";
import { verifyInternalToken, type AuthRequest } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { CrudController } from "./shared.controller.js";

export function crudRouter(
  controller: CrudController,
  createSchema: ZodObject,
  options?: { detail?: boolean },
) {
  const router = Router();
  router.get(
    "/",
    (req: AuthRequest, res, next) => {
      if (req.query.admin !== "true") return next();
      verifyInternalToken(req, res, () => requireAdmin(req, res, next));
    },
    controller.list,
  );
  router.get("/id/:id", verifyInternalToken, requireAdmin, controller.byId);
  if (options?.detail) router.get("/:slug", controller.detail);
  router.post("/", verifyInternalToken, requireAdmin, validate(createSchema), controller.create);
  router.patch(
    "/:id",
    verifyInternalToken,
    requireAdmin,
    validate(createSchema.partial()),
    controller.update,
  );
  router.delete("/:id", verifyInternalToken, requireAdmin, controller.remove);
  return router;
}

export const url = z.string().url();
