import type { NextFunction, Request, Response } from "express";
import { getSession } from "@auth/express";
import { authConfig } from "../config/auth.js";
import { verifyToken, type InternalClaims } from "../lib/jwt.js";

export type AuthRequest = Request & { user?: InternalClaims };

export async function verifyInternalToken(req: AuthRequest, res: Response, next: NextFunction) {
  const [scheme, token] = req.headers.authorization?.split(" ") ?? [];
  if (scheme === "Bearer" && token) {
    try {
      req.user = verifyToken(token);
      next();
      return;
    } catch {
      res.status(401).json({
        success: false,
        error: { code: "INVALID_TOKEN", message: "Internal token is invalid or expired" },
      });
      return;
    }
  }

  try {
    const session = await getSession(req, authConfig);
    const user = session?.user as
      | {
          id?: string;
          email?: string | null;
          role?: InternalClaims["role"];
        }
      | undefined;
    if (user?.id && user.role) {
      req.user = {
        sub: user.id,
        email: user.email ?? undefined,
        role: user.role,
        type: "internal-api",
      };
      next();
      return;
    }
  } catch {
    // Return the same authentication response for invalid or missing sessions.
  }

  return res.status(401).json({
    success: false,
    error: { code: "UNAUTHORIZED", message: "Authentication is required" },
  });
}
