import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { verifyInternalToken } from "../../middleware/auth.middleware.js";
import { requireSuperAdmin } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { usersController } from "./users.controller.js";

export const usersRouter = Router();

usersRouter.use(verifyInternalToken, requireSuperAdmin);
usersRouter.get("/", usersController.list);
usersRouter.patch(
  "/:id/role",
  validate(z.object({ role: z.nativeEnum(Role) })),
  usersController.updateRole,
);
usersRouter.delete("/:id", usersController.remove);
