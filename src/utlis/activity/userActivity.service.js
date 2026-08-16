import UserActivity from "../../DB/models/UserActivity.js";

export const logUserActivity = async ({
  userId,
  type,
  metadata = {},
}) => {
  try {
    if (!userId || !type) return;

    await UserActivity.create({
      user: userId,
      type,
      metadata,
    });
  } catch (error) {
    // مهم جدًا:
    // فشل تسجيل النشاط لا يوقف العملية الأساسية
    console.error("User activity logging error:", error.message);
  }
};