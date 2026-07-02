import type { RequestHandler } from "express";
import { uploadImage } from "../../lib/cloudinary.js";
import { ok } from "../../utils/response.js";

class UploadController {
  upload: RequestHandler = async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(422).json({
          success: false,
          error: { code: "FILE_REQUIRED", message: "A JPG, PNG, or WebP image is required" },
        });
        return;
      }
      ok(res, { url: await uploadImage(req.file.buffer) }, undefined, 201);
    } catch (error) {
      next(error);
    }
  };
}

export const uploadController = new UploadController();
