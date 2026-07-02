import type { RequestHandler } from "express";
import { prisma } from "../../lib/prisma.js";
import { pagination } from "../../utils/pagination.js";
import { ok } from "../../utils/response.js";

class NewsletterController {
  subscribe: RequestHandler = async (req, res, next) => {
    try {
      const email = String(req.body.email).toLowerCase();
      const subscriber = await prisma.newsletterSubscriber.upsert({
        where: { email },
        create: { email },
        update: {},
      });
      ok(res, subscriber, undefined, 201);
    } catch (error) {
      next(error);
    }
  };

  list: RequestHandler = async (req, res, next) => {
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
  };

  remove: RequestHandler = async (req, res, next) => {
    try {
      await prisma.newsletterSubscriber.delete({ where: { id: String(req.params.id) } });
      ok(res, { id: req.params.id });
    } catch (error) {
      next(error);
    }
  };
}

export const newsletterController = new NewsletterController();
