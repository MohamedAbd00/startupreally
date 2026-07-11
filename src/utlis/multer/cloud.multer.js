import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// =======================
// Memory Storage
// =======================

const storage = multer.memoryStorage();

// =======================
// Images
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
];

export const uploadStoreProject = multer({
  storage,
  limits: {
    fileSize: 250 * 1024 * 1024, // 250MB
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
    if (projectValidationTypes.includes(file.mimetype)) {
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
  buffer,
  {
    folder = "uploads",
    resource_type = "image",
    public_id = undefined,
    
  } = {}
) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type,
        public_id,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

export { cloudinary };
