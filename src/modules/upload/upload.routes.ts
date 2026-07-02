import { Router } from "express";
import multer from "multer";
import { verifyInternalToken } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/role.middleware.js";
import { uploadController } from "./upload.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024, files: 1, fields: 0, parts: 1 },
  fileFilter: (_req, file, callback) =>
    callback(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)),
});
export const uploadRouter = Router();
uploadRouter.post(
  "/",
  verifyInternalToken,
  requireAdmin,
  upload.single("file"),
  uploadController.upload,
);
