import { cloudinary } from "../config/cloudinary";
import multer from "multer";
import { Readable } from "stream";
import { Request } from "express";
import { ApiError } from "../utils/apiError";

export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
}

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new ApiError(400, "Only image files are allowed!"));
    }
};

export const fileUploader = multer({ 
    storage, 
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter });



function toStream(buffer: Buffer): Readable {
  const s = new Readable();
  s.push(buffer);
  s.push(null);
  return s;
}

export async function uploadImageToCloudinary(
  file: Express.Multer.File,
  userId: string,
  folder: string
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${folder}/${userId}`,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
        tags: [`user:${userId}`],
        context: `userId=${userId}|originalName=${file.originalname}`,
      },
      (error, result) => {
        if (error || !result) {
          return reject(ApiError.internalServerError(`Cloudinary image upload failed: ${error?.message ?? "unknown"}`));
        }
        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
        });
      }
    );
    toStream(file.buffer).pipe(stream);
  });
}
