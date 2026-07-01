import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { verifyInternalToken } from "../../middleware/auth.middleware.js";
import { requireSuperAdmin } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { ok } from "../../utils/response.js";

export const usersRouter = Router();
usersRouter.use(verifyInternalToken, requireSuperAdmin);
usersRouter.get("/", async (_req, res, next) => {
  try {
    ok(
      res,
      await prisma.user.findMany({
        select: { id: true, name: true, email: true, image: true, role: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
    );
  } catch (error) {
    next(error);
  }
});
usersRouter.patch(
  "/:id/role",
  validate(z.object({ role: z.nativeEnum(Role) })),
  async (req, res, next) => {
    try {
      ok(
        res,
        await prisma.user.update({
          where: { id: String(req.params.id) },
          data: { role: req.body.role },
          select: { id: true, name: true, email: true, role: true },
        }),
      );
    } catch (error) {
      next(error);
    }
  },
);
usersRouter.delete("/:id", async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: String(req.params.id) } });
    ok(res, { id: req.params.id });
  } catch (error) {
    next(error);
  }
});
