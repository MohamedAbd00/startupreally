import { generateVideoUploadUrl } from "../../../utlis/multer/cloudflare.js";

export const getVideoUploadUrl = async (req, res, next) => {
  try {
    const { fileName, contentType } = req.body;

    if (!fileName || !contentType) {
      return next(
        new Error("fileName و contentType مطلوبين", {
          cause: 400,
        })
      );
    }

    const result = await generateVideoUploadUrl({
      fileName,
      contentType,
    });

    return res.status(200).json({
      message: "Upload URL generated successfully",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};