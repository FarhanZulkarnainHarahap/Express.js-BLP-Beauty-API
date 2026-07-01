import { Router } from "express";
import { verifyInternalToken, type AuthRequest } from "../../middleware/auth.middleware.js";
import { ok } from "../../utils/response.js";

export const authRouter = Router();
authRouter.get("/me", verifyInternalToken, (req: AuthRequest, res) => ok(res, req.user));
authRouter.post("/internal-token/verify", verifyInternalToken, (req: AuthRequest, res) =>
  ok(res, { valid: true, user: req.user }),
);
