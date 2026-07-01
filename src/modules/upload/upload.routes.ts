import { Router } from "express";
import multer from "multer";
import { uploadImage } from "../../lib/cloudinary.js";
import { verifyInternalToken } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/role.middleware.js";
import { ok } from "../../utils/response.js";

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
  async (req, res, next) => {
    try {
      if (!req.file)
        return res.status(422).json({
          success: false,
          error: { code: "FILE_REQUIRED", message: "A JPG, PNG, or WebP image is required" },
        });
      ok(res, { url: await uploadImage(req.file.buffer) }, undefined, 201);
    } catch (error) {
      next(error);
    }
  },
);
