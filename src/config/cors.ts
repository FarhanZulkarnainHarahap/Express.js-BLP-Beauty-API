import type { CorsOptions } from "cors";
import { env } from "./env.js";

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    const allowedOrigins = env.FRONTEND_URL.split(",").map((value) => value.trim());
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
};
