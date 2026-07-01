import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(buffer: Buffer) {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw Object.assign(new Error("Cloudinary credentials are not configured"), { status: 503 });
  }
  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "beauty-cms", resource_type: "image" },
      (error, result) => (error || !result ? reject(error) : resolve(result.secure_url)),
    );
    stream.end(buffer);
  });
}
