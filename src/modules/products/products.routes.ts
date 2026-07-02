import { Router } from "express";
import { z } from "zod";
import { verifyInternalToken, type AuthRequest } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { productsController } from "./products.controller.js";

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
  productsController.list,
);
productsRouter.get("/id/:id", verifyInternalToken, requireAdmin, productsController.byId);
productsRouter.get("/:slug", productsController.detail);
productsRouter.post(
  "/",
  verifyInternalToken,
  requireAdmin,
  validate(productSchema),
  productsController.create,
);
productsRouter.patch(
  "/:id",
  verifyInternalToken,
  requireAdmin,
  validate(productSchema.partial()),
  productsController.update,
);
productsRouter.delete("/:id", verifyInternalToken, requireAdmin, productsController.remove);
