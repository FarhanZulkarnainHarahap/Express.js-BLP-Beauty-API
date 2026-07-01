import { Router } from "express";
import { z, type ZodObject } from "zod";
import { prisma } from "../lib/prisma.js";
import { verifyInternalToken, type AuthRequest } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { pagination } from "../utils/pagination.js";
import { ok } from "../utils/response.js";
import { slugify } from "../utils/slug.js";

type Resource = "category" | "banner" | "campaign" | "article";

const delegate = (resource: Resource) =>
  prisma[resource] as never as {
    findMany(args: object): Promise<unknown[]>;
    count(args: object): Promise<number>;
    findUnique(args: object): Promise<unknown>;
    findFirst(args: object): Promise<unknown>;
    create(args: object): Promise<unknown>;
    update(args: object): Promise<unknown>;
    delete(args: object): Promise<unknown>;
  };

export function crudRouter(
  resource: Resource,
  createSchema: ZodObject,
  options?: { slug?: boolean; detail?: boolean; publicWhere?: object },
) {
  const router = Router();
  const model = delegate(resource);
  router.get(
    "/",
    (req: AuthRequest, res, next) => {
      if (req.query.admin !== "true") return next();
      verifyInternalToken(req, res, () => requireAdmin(req, res, next));
    },
    async (req, res, next) => {
      try {
        const { page, limit, skip } = pagination(req.query);
        const search = String(req.query.search ?? "").trim();
        const searchField = resource === "category" ? "name" : "title";
        const where = {
          ...(req.query.admin === "true" ? {} : (options?.publicWhere ?? {})),
          ...(search ? { [searchField]: { contains: search, mode: "insensitive" } } : {}),
        };
        const [items, total] = await Promise.all([
          model.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
          model.count({ where }),
        ]);
        ok(res, items, { page, limit, total, pages: Math.ceil(total / limit) });
      } catch (error) {
        next(error);
      }
    },
  );
  if (options?.detail)
    router.get("/:slug", async (req, res, next) => {
      try {
        const item = await model.findFirst({
          where: { slug: String(req.params.slug), ...(options?.publicWhere ?? {}) },
        });
        if (!item)
          return res
            .status(404)
            .json({ success: false, error: { code: "NOT_FOUND", message: "Record not found" } });
        ok(res, item);
      } catch (error) {
        next(error);
      }
    });
  router.post(
    "/",
    verifyInternalToken,
    requireAdmin,
    validate(createSchema),
    async (req, res, next) => {
      try {
        const data = options?.slug
          ? { ...req.body, slug: slugify(req.body.name ?? req.body.title) }
          : req.body;
        ok(res, await model.create({ data }), undefined, 201);
      } catch (error) {
        next(error);
      }
    },
  );
  router.patch(
    "/:id",
    verifyInternalToken,
    requireAdmin,
    validate(createSchema.partial()),
    async (req, res, next) => {
      try {
        const label = req.body.name ?? req.body.title;
        const data = options?.slug && label ? { ...req.body, slug: slugify(label) } : req.body;
        ok(res, await model.update({ where: { id: String(req.params.id) }, data }));
      } catch (error) {
        next(error);
      }
    },
  );
  router.delete("/:id", verifyInternalToken, requireAdmin, async (req, res, next) => {
    try {
      await model.delete({ where: { id: String(req.params.id) } });
      ok(res, { id: req.params.id });
    } catch (error) {
      next(error);
    }
  });
  return router;
}

export const url = z.string().url();
