import { Router } from "express";
import { verifyInternalToken } from "../../middleware/auth.middleware.js";
import { authController } from "./auth.controller.js";

export const authRouter = Router();
authRouter.get("/me", verifyInternalToken, authController.me);
authRouter.post("/internal-token/verify", verifyInternalToken, authController.verify);
