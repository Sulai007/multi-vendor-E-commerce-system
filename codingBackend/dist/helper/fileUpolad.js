"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploader = void 0;
exports.uploadImageToCloudinary = uploadImageToCloudinary;
const cloudinary_1 = require("../config/cloudinary");
const multer_1 = __importDefault(require("multer"));
const stream_1 = require("stream");
const apiError_1 = require("../utils/apiError");
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    }
    else {
        cb(new apiError_1.ApiError(400, "Only image files are allowed!"));
    }
};
exports.fileUploader = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter
});
function toStream(buffer) {
    const s = new stream_1.Readable();
    s.push(buffer);
    s.push(null);
    return s;
}
async function uploadImageToCloudinary(file, userId, folder) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.cloudinary.uploader.upload_stream({
            folder: `${folder}/${userId}`,
            resource_type: "image",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
            tags: [`user:${userId}`],
            context: `userId=${userId}|originalName=${file.originalname}`,
        }, (error, result) => {
            if (error || !result) {
                return reject(apiError_1.ApiError.internalServerError(`Cloudinary image upload failed: ${error?.message ?? "unknown"}`));
            }
            resolve({
                publicId: result.public_id,
                secureUrl: result.secure_url,
                format: result.format,
                bytes: result.bytes,
                width: result.width,
                height: result.height,
            });
        });
        toStream(file.buffer).pipe(stream);
    });
}
