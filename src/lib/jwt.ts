import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type InternalClaims = {
  sub: string;
  email?: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  type: "internal-api";
};

export function verifyToken(token: string) {
  const claims = jwt.verify(token, env.INTERNAL_API_SECRET, {
    algorithms: ["HS256"],
    issuer: "beauty-web",
    audience: "beauty-api",
  });
  if (typeof claims === "string" || claims.type !== "internal-api") {
    throw new Error("Invalid internal token");
  }
  return claims as InternalClaims & jwt.JwtPayload;
}
