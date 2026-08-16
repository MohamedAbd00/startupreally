import UserActivity from "../../DB/models/adminactivity.js";

export const logadminActivity = async ({
  userId,
  action,
  type,
  metadata = {},
}) => {
  try {
    if (!userId || !action || !type) return;

    await UserActivity.create({
      user: userId,
      action,
      type,
      metadata,
    });

  } catch (error) {

    // فشل تسجيل النشاط لا يوقف العملية الأساسية
    console.error(
      "Admin activity logging error:",
      error.message
    );

  }
};