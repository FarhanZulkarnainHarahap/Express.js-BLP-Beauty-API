import express from "express";
import cors from "cors";
import helmet, { type HelmetOptions } from "helmet";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import { ExpressAuth } from "@auth/express";
import { authConfig } from "./config/auth.js";
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
import { appController } from "./app.controller.js";

export const app = express();
const createHelmetMiddleware = helmet as unknown as (
  options?: Readonly<HelmetOptions>,
) => express.RequestHandler;

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(createHelmetMiddleware());
app.use(cors(corsOptions));
app.use(rateLimit({ windowMs: 60_000, limit: 180, standardHeaders: "draft-8" }));
app.use(
  "/api/auth",
  (req, _res, next) => {
    const forwardedHost = req.headers["x-forwarded-host"];
    if (typeof forwardedHost === "string") req.headers.host = forwardedHost.split(",")[0]!.trim();
    next();
  },
  ExpressAuth(authConfig),
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.get("/", appController.index);
app.get("/health", appController.health);
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

export default app;
