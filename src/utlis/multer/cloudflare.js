import {
  S3Client,
  PutObjectCommand,
   DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import { v4 as uuid } from "uuid";
import mime from "mime-types";
// ============================================
// حذف ملف من R2
// ============================================
export const getR2Key = (url) => {
  if (!url) return null;

  try {
    const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

    if (publicUrl && url.startsWith(publicUrl)) {
      return url
        .replace(`${publicUrl}/`, "")
        .split("?")[0];
    }

    return new URL(url).pathname
      .replace(/^\/+/, "")
      .split("?")[0];
  } catch (error) {
    console.error("R2 URL Parse Error:", error);
    return null;
  }
};
export const deleteFromR2 = async (key) => {
  if (!key) {
    return;
  }

  try {
    await r2.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      })
    );

    console.log("✅ تم حذف الملف من R2:", key);
  } catch (error) {
    console.error("❌ R2 Delete Error:", error);
    throw error;
  }
};
export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// ============================================
// Upload مباشرة إلى R2 (السيرفر)
// ============================================

export const uploadToR2 = async (
  file,
  {
    folder = "uploads",
    fileName = null,
    download = false,
  } = {}
) => {
  const extension =
    mime.extension(file.mimetype) ||
    file.originalname.split(".").pop();

  const key =
    fileName ||
    `${folder}/${uuid()}.${extension}`;

  let body;

  // لو الملف في الذاكرة
  if (file.buffer) {
    body = file.buffer;
  } else {
    if (!fs.existsSync(file.path)) {
      throw new Error(`الملف غير موجود: ${file.path}`);
    }

    // ✅ استخدام Stream بدلاً من قراءة الملف بالكامل في الرام
    body = fs.createReadStream(file.path);
  }

  const params = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: file.mimetype,
  };

  if (download) {
    params.ContentDisposition = `attachment; filename*=UTF-8''${encodeURIComponent(
      file.originalname
    )}`;
  }

  try {
    const result = await r2.send(
      new PutObjectCommand(params)
    );

    return {
      url: `${process.env.R2_PUBLIC_URL}/${key}`,
      secure_url: `${process.env.R2_PUBLIC_URL}/${key}`,
      key,
      original_filename: file.originalname,
      bytes: file.size,
      format: extension,
      result,
    };
  } catch (err) {
    console.error("R2 Upload Error:", err);
    throw err;
  } finally {
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }
};

// ============================================
// إنشاء Presigned URL للرفع المباشر من React
// ============================================

export const generateVideoUploadUrl = async ({
  fileName,
  contentType,
}) => {
  const extension =
    mime.extension(contentType) ||
    fileName.split(".").pop();

  const key = `projects/videos/${uuid()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2, command, {
    expiresIn: 60 * 10, // 10 دقائق
  });

  return {
    uploadUrl,
    key,
    videoUrl: `${process.env.R2_PUBLIC_URL}/${key}`,
  };
};