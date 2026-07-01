import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { verifyInternalToken, type AuthRequest } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { pagination } from "../../utils/pagination.js";
import { ok } from "../../utils/response.js";
import { slugify } from "../../utils/slug.js";

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().nonnegative(),
  discountPrice: z.coerce.number().nonnegative().nullable().optional(),
  imageUrl: z.string().url(),
  categoryId: z.string().min(1),
  badge: z.string().max(30).nullable().optional(),
  stock: z.coerce.number().int().nonnegative(),
  isBestSeller: z.boolean().default(false),
  isPublished: z.boolean().default(false),
});

export const productsRouter = Router();
productsRouter.get(
  "/",
  (req: AuthRequest, res, next) => {
    if (req.query.admin !== "true") return next();
    verifyInternalToken(req, res, () => requireAdmin(req, res, next));
  },
  async (req, res, next) => {
    try {
      const { page, limit, skip } = pagination(req.query);
      const search = String(req.query.search ?? "").trim();
      const category = String(req.query.category ?? "").trim();
      const where = {
        isPublished: req.query.admin === "true" ? undefined : true,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { description: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {}),
        ...(category ? { category: { slug: category } } : {}),
        ...(req.query.bestSeller === "true" ? { isBestSeller: true } : {}),
      };
      const sort =
        req.query.sort === "price-asc"
          ? { price: "asc" as const }
          : req.query.sort === "price-desc"
            ? { price: "desc" as const }
            : { createdAt: "desc" as const };
      const [items, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: { category: true },
          orderBy: sort,
          skip,
          take: limit,
        }),
        prisma.product.count({ where }),
      ]);
      ok(res, items, { page, limit, total, pages: Math.ceil(total / limit) });
    } catch (error) {
      next(error);
    }
  },
);
productsRouter.get("/:slug", async (req, res, next) => {
  try {
    const item = await prisma.product.findFirst({
      where: { slug: String(req.params.slug), isPublished: true },
      include: { category: true },
    });
    if (!item)
      return res
        .status(404)
        .json({ success: false, error: { code: "NOT_FOUND", message: "Product not found" } });
    ok(res, item);
  } catch (error) {
    next(error);
  }
});
productsRouter.post(
  "/",
  verifyInternalToken,
  requireAdmin,
  validate(productSchema),
  async (req, res, next) => {
    try {
      ok(
        res,
        await prisma.product.create({
          data: { ...req.body, slug: slugify(req.body.name) },
          include: { category: true },
        }),
        undefined,
        201,
      );
    } catch (error) {
      next(error);
    }
  },
);
productsRouter.patch(
  "/:id",
  verifyInternalToken,
  requireAdmin,
  validate(productSchema.partial()),
  async (req, res, next) => {
    try {
      const data = req.body.name ? { ...req.body, slug: slugify(req.body.name) } : req.body;
      ok(
        res,
        await prisma.product.update({
          where: { id: String(req.params.id) },
          data,
          include: { category: true },
        }),
      );
    } catch (error) {
      next(error);
    }
  },
);
productsRouter.delete("/:id", verifyInternalToken, requireAdmin, async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: String(req.params.id) } });
    ok(res, { id: req.params.id });
  } catch (error) {
    next(error);
  }
});
