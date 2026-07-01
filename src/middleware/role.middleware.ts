import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./auth.middleware.js";

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || !["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
    return res
      .status(403)
      .json({ success: false, error: { code: "FORBIDDEN", message: "Admin role is required" } });
  }
  next();
}

export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message: "Super admin role is required" },
    });
  }
  next();
}
