import type { RequestHandler } from "express";
import { prisma } from "../../lib/prisma.js";
import { ok } from "../../utils/response.js";

class UsersController {
  list: RequestHandler = async (_req, res, next) => {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, image: true, role: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      });
      ok(res, users);
    } catch (error) {
      next(error);
    }
  };

  updateRole: RequestHandler = async (req, res, next) => {
    try {
      const user = await prisma.user.update({
        where: { id: String(req.params.id) },
        data: { role: req.body.role },
        select: { id: true, name: true, email: true, role: true },
      });
      ok(res, user);
    } catch (error) {
      next(error);
    }
  };

  remove: RequestHandler = async (req, res, next) => {
    try {
      await prisma.user.delete({ where: { id: String(req.params.id) } });
      ok(res, { id: req.params.id });
    } catch (error) {
      next(error);
    }
  };
}

export const usersController = new UsersController();
