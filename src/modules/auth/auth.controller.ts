import type { RequestHandler } from "express";
import type { AuthRequest } from "../../middleware/auth.middleware.js";
import { ok } from "../../utils/response.js";

class AuthController {
  me: RequestHandler = (req: AuthRequest, res) => {
    ok(res, req.user);
  };

  verify: RequestHandler = (req: AuthRequest, res) => {
    ok(res, { valid: true, user: req.user });
  };
}

export const authController = new AuthController();
