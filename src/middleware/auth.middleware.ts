import type { NextFunction, Request, Response } from "express";
import { verifyToken, type InternalClaims } from "../lib/jwt.js";

export type AuthRequest = Request & { user?: InternalClaims };

export function verifyInternalToken(req: AuthRequest, res: Response, next: NextFunction) {
  const [scheme, token] = req.headers.authorization?.split(" ") ?? [];
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Bearer token is required" },
    });
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: { code: "INVALID_TOKEN", message: "Internal token is invalid or expired" },
    });
  }
}
