import type { RequestHandler } from "express";
import { prisma } from "../lib/prisma.js";
import { pagination } from "../utils/pagination.js";
import { ok } from "../utils/response.js";
import { slugify } from "../utils/slug.js";

export type CrudResource = "category" | "banner" | "campaign" | "article";
export type CrudOptions = {
  slug?: boolean;
  publicWhere?: object;
};

type Delegate = {
  findMany(args: object): Promise<unknown[]>;
  count(args: object): Promise<number>;
  findUnique(args: object): Promise<unknown>;
  findFirst(args: object): Promise<unknown>;
  create(args: object): Promise<unknown>;
  update(args: object): Promise<unknown>;
  delete(args: object): Promise<unknown>;
};

export class CrudController {
  private readonly model: Delegate;

  constructor(
    private readonly resource: CrudResource,
    private readonly options: CrudOptions = {},
  ) {
    this.model = prisma[resource] as unknown as Delegate;
  }

  list: RequestHandler = async (req, res, next) => {
    try {
      const { page, limit, skip } = pagination(req.query);
      const search = String(req.query.search ?? "").trim();
      const searchField = this.resource === "category" ? "name" : "title";
      const where = {
        ...(req.query.admin === "true" ? {} : (this.options.publicWhere ?? {})),
        ...(search ? { [searchField]: { contains: search, mode: "insensitive" } } : {}),
      };
      const [items, total] = await Promise.all([
        this.model.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
        this.model.count({ where }),
      ]);
      ok(res, items, { page, limit, total, pages: Math.ceil(total / limit) });
    } catch (error) {
      next(error);
    }
  };

  byId: RequestHandler = async (req, res, next) => {
    try {
      const item = await this.model.findUnique({ where: { id: String(req.params.id) } });
      if (!item) {
        res
          .status(404)
          .json({ success: false, error: { code: "NOT_FOUND", message: "Record not found" } });
        return;
      }
      ok(res, item);
    } catch (error) {
      next(error);
    }
  };

  detail: RequestHandler = async (req, res, next) => {
    try {
      const item = await this.model.findFirst({
        where: { slug: String(req.params.slug), ...(this.options.publicWhere ?? {}) },
      });
      if (!item) {
        res
          .status(404)
          .json({ success: false, error: { code: "NOT_FOUND", message: "Record not found" } });
        return;
      }
      ok(res, item);
    } catch (error) {
      next(error);
    }
  };

  create: RequestHandler = async (req, res, next) => {
    try {
      const data = this.options.slug
        ? { ...req.body, slug: slugify(req.body.name ?? req.body.title) }
        : req.body;
      ok(res, await this.model.create({ data }), undefined, 201);
    } catch (error) {
      next(error);
    }
  };

  update: RequestHandler = async (req, res, next) => {
    try {
      const label = req.body.name ?? req.body.title;
      const data = this.options.slug && label ? { ...req.body, slug: slugify(label) } : req.body;
      ok(res, await this.model.update({ where: { id: String(req.params.id) }, data }));
    } catch (error) {
      next(error);
    }
  };

  remove: RequestHandler = async (req, res, next) => {
    try {
      await this.model.delete({ where: { id: String(req.params.id) } });
      ok(res, { id: req.params.id });
    } catch (error) {
      next(error);
    }
  };
}
