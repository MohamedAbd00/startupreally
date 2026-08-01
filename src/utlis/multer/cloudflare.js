import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import { v4 as uuid } from "uuid";
import mime from "mime-types";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

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

  if (file.buffer) {
    body = file.buffer;
  } else {
    if (!fs.existsSync(file.path)) {
      throw new Error(`الملف غير موجود: ${file.path}`);
    }

    body = fs.readFileSync(file.path);
  }

  const params = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: file.mimetype,
  };

  // ملفات التحميل فقط
  if (download) {
    params.ContentDisposition = `attachment; filename*=UTF-8''${encodeURIComponent(
      file.originalname
    )}`;
  }

  try {
    const result = await r2.send(new PutObjectCommand(params));

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