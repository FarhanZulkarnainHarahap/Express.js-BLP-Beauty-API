import type { RequestHandler } from "express";
import { prisma } from "../../lib/prisma.js";
import { pagination } from "../../utils/pagination.js";
import { ok } from "../../utils/response.js";
import { slugify } from "../../utils/slug.js";

class ProductsController {
  list: RequestHandler = async (req, res, next) => {
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
      const orderBy =
        req.query.sort === "price-asc"
          ? { price: "asc" as const }
          : req.query.sort === "price-desc"
            ? { price: "desc" as const }
            : { createdAt: "desc" as const };
      const [items, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: { category: true },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.product.count({ where }),
      ]);
      ok(res, items, { page, limit, total, pages: Math.ceil(total / limit) });
    } catch (error) {
      next(error);
    }
  };

  byId: RequestHandler = async (req, res, next) => {
    try {
      const item = await prisma.product.findUnique({
        where: { id: String(req.params.id) },
        include: { category: true },
      });
      if (!item) {
        res
          .status(404)
          .json({ success: false, error: { code: "NOT_FOUND", message: "Product not found" } });
        return;
      }
      ok(res, item);
    } catch (error) {
      next(error);
    }
  };

  detail: RequestHandler = async (req, res, next) => {
    try {
      const item = await prisma.product.findFirst({
        where: { slug: String(req.params.slug), isPublished: true },
        include: { category: true },
      });
      if (!item) {
        res
          .status(404)
          .json({ success: false, error: { code: "NOT_FOUND", message: "Product not found" } });
        return;
      }
      ok(res, item);
    } catch (error) {
      next(error);
    }
  };

  create: RequestHandler = async (req, res, next) => {
    try {
      const item = await prisma.product.create({
        data: { ...req.body, slug: slugify(req.body.name) },
        include: { category: true },
      });
      ok(res, item, undefined, 201);
    } catch (error) {
      next(error);
    }
  };

  update: RequestHandler = async (req, res, next) => {
    try {
      const data = req.body.name ? { ...req.body, slug: slugify(req.body.name) } : req.body;
      const item = await prisma.product.update({
        where: { id: String(req.params.id) },
        data,
        include: { category: true },
      });
      ok(res, item);
    } catch (error) {
      next(error);
    }
  };

  remove: RequestHandler = async (req, res, next) => {
    try {
      await prisma.product.delete({ where: { id: String(req.params.id) } });
      ok(res, { id: req.params.id });
    } catch (error) {
      next(error);
    }
  };
}

export const productsController = new ProductsController();
