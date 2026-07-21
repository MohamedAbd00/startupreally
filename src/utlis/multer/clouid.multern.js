import multer from "multer";
import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// =======================
// Create uploads folder
// =======================

const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// =======================
// Memory Storage (للصور العادية)
// =======================

const storage = multer.memoryStorage();

// =======================
// Disk Storage (للفيديوهات الكبيرة)
// =======================

const diskStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    );
  },
});

// =======================
// Images + Videos + zip
// =======================

const projectValidationTypes = [
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",

  // Videos
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",

  // ZIP
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream",
];
// =======================
// Store Project Upload
// =======================

export const uploadStoreProject = multer({
  storage: diskStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 250MB
  },
  fileFilter(req, file, cb) {
    if (projectValidationTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("يسمح فقط برفع الصور أو الفيديو"), false);
    }
  },
});

// =======================
// Images
// =======================

const imageValidationTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
];

// =======================
// Documents
// =======================

const documentValidationTypes = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

// =======================
// Image Upload Middleware
// =======================

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    if (imageValidationTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("❌ الملف غير مدعوم"), false);
    }
  },
});

export const uploadSingleImage = (fieldName = "image") =>
  upload.single(fieldName);

// =======================
// Documents Upload Middleware
// =======================

export const uploadProjectFiles = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    if (documentValidationTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("يسمح فقط برفع ملفات PDF و Excel و PowerPoint"),
        false
      );
    }
  },
});

// =======================
// Universal Cloudinary Upload
// =======================

export const uploadToCloudinary = (
  file,
  {
    folder = "uploads",
    resource_type = "image",
    public_id = undefined,
  } = {}
) => {
  return new Promise((resolve, reject) => {
    const options = {
      folder,
      resource_type,
      public_id,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    };

    // لو الملف جاي من diskStorage
    if (file.path) {
      const uploadMethod =
        resource_type === "video" || resource_type === "raw"
          ? cloudinary.uploader.upload_large
          : cloudinary.uploader.upload;

      console.log({
        path: file.path,
        size: fs.statSync(file.path).size,
        mimetype: file.mimetype,
        resource_type,
        method:
          resource_type === "video" || resource_type === "raw"
            ? "upload_large"
            : "upload",
      });

      uploadMethod.call(
        cloudinary.uploader,
        file.path,
        {
          ...options,
          chunk_size: 10 * 1024 * 1024,
        },
        (error, result) => {
          if (error) {
            console.log("========== CLOUDINARY ERROR ==========");
            console.dir(error, { depth: null });
            console.log(JSON.stringify(error, null, 2));
            console.log("======================================");
            return reject(error);
          }

          fs.unlink(file.path, () => {});
          resolve(result);
        }
      );

      return;
    }

    // لو الملف جاي من memoryStorage
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
};

export { cloudinary };