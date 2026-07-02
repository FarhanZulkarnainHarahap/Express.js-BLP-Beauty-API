import "dotenv/config";
import { z } from "zod";

export const env = z
  .object({
    DATABASE_URL: z.string().min(1),
    PORT: z.coerce.number().default(4000),
    JWT_SECRET: z.string().min(16),
    INTERNAL_API_SECRET: z.string().min(16),
    AUTH_SECRET: z.string().min(32).optional(),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    FRONTEND_URL: z.string().min(1),
  })
  .parse(process.env);
