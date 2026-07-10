import ProjectActivity from "../../DB/models/activity.js";

export const createProjectActivity = async ({
  project,
  user,
  action,
  targetType,
  targetId = null,
  metadata = {},
}) => {
  try {
    return await ProjectActivity.create({
      project,
      user,
      action,
      targetType,
      targetId,
      metadata,
    });
  } catch (err) {
    console.error("Project Activity Error:", err);
  }
};