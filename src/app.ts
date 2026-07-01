import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import { corsOptions } from "./config/cors.js";
import { productsRouter } from "./modules/products/products.routes.js";
import { categoriesRouter } from "./modules/categories/categories.routes.js";
import { bannersRouter } from "./modules/banners/banners.routes.js";
import { campaignsRouter } from "./modules/campaigns/campaigns.routes.js";
import { articlesRouter } from "./modules/articles/articles.routes.js";
import { newsletterRouter } from "./modules/newsletter/newsletter.routes.js";
import { uploadRouter } from "./modules/upload/upload.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";

export const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors(corsOptions));
app.use(rateLimit({ windowMs: 60_000, limit: 180, standardHeaders: "draft-8" }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.get("/health", (_req, res) =>
  res.json({ success: true, data: { service: "beauty-express-api", status: "ok" } }),
);
app.use("/auth", authRouter);
app.use("/products", productsRouter);
app.use("/categories", categoriesRouter);
app.use("/banners", bannersRouter);
app.use("/campaigns", campaignsRouter);
app.use("/articles", articlesRouter);
app.use("/newsletter", newsletterRouter);
app.use("/upload", uploadRouter);
app.use("/users", usersRouter);
app.use(notFound);
app.use(errorHandler);
