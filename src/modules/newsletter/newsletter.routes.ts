import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { verifyInternalToken } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { pagination } from "../../utils/pagination.js";
import { ok } from "../../utils/response.js";

export const newsletterRouter = Router();
newsletterRouter.post(
  "/",
  validate(z.object({ email: z.string().email() })),
  async (req, res, next) => {
    try {
      ok(
        res,
        await prisma.newsletterSubscriber.upsert({
          where: { email: req.body.email.toLowerCase() },
          create: { email: req.body.email.toLowerCase() },
          update: {},
        }),
        undefined,
        201,
      );
    } catch (error) {
      next(error);
    }
  },
);
newsletterRouter.get("/", verifyInternalToken, requireAdmin, async (req, res, next) => {
  try {
    const { page, limit, skip } = pagination(req.query);
    const search = String(req.query.search ?? "");
    const where = search ? { email: { contains: search, mode: "insensitive" as const } } : {};
    const [items, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.newsletterSubscriber.count({ where }),
    ]);
    ok(res, items, { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});
newsletterRouter.delete("/:id", verifyInternalToken, requireAdmin, async (req, res, next) => {
  try {
    await prisma.newsletterSubscriber.delete({ where: { id: String(req.params.id) } });
    ok(res, { id: req.params.id });
  } catch (error) {
    next(error);
  }
});
