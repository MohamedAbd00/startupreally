
import { asyncHandelr } from "../../../utlis/response/error.response.js";
import { successresponse } from "../../../utlis/response/success.response.js";
import { v2 as cloudinary } from 'cloudinary';
import Usermodel from "../../../DB/models/usermodel.js";
import storeModel from "../../../DB/models/store.js";
import proposal from "../../../DB/models/proposal.js";
import Projects from "../../../DB/models/projects.js";
import tasks from "../../../DB/models/Tasks.js";
import chat from "../../../DB/models/chat.js";
import FolderModel from "../../../DB/models/folder.js";
import ProjectFiles from "../../../DB/models/file.js";
import { createProjectActivity } from "../../../utlis/activity/projectActivity.js";
import ProjectActivity from "../../../DB/models/activity.js";
import Payment from "../../../DB/models/Payment .js";
import projects from "../../../DB/models/projects.js";
import { createNotification } from "../../../utlis/activity/createNotification.js";
import { uploadToCloudinary } from "../../../utlis/multer/clouid.multern.js";
import Order from "../../../DB/models/Order.js";
import Withdraw from "../../../DB/models/Withdraw.js";
import Message from "../../../DB/models/massege.js";
import Notification from "../../../DB/models/Notification.js";
import Tasks from "../../../DB/models/Tasks.js";
import StoreView from "../../../DB/models/ProductViews.js";
import projectreviwe from "../../../DB/models/projectreviwe.js";
import previousprojects from "../../../DB/models/previousprojects.js"

//استكمال البيانات
export const updateprofiledev = asyncHandelr(async (req, res, next) => {
  const id = req.user?._id;

  if (!id) {
    return next(new Error("التوكن مطلوب", { cause: 401 }));
  }

  const user = await Usermodel.findById(id);

  if (!user) {
    return next(new Error("المستخدم غير موجود", { cause: 404 }));
  }

  console.log("BODY RECEIVED:", req.body);
  console.log("FILES RECEIVED:", req.files);

  const {
    fullName,
    title,
    bio,
    experience,
    hourlyRate,
    techStack,
    skills,
    languages,
    github,
    linkedin,
    twitter,
    website,
    phone,
    education,
    country,
    certificates,
    goverment
  } = req.body;

  const updateData = {};

  const convertBufferToBase64Str = (file) => {
    const base64Content = file.buffer.toString("base64");
    return `data:${file.mimetype};base64,${base64Content}`;
  };

  const getPublicIdFromUrl = (url) => {
    try {
      const uploadIndex = url.indexOf("/upload/");
      if (uploadIndex === -1) return null;

      const path = url.substring(uploadIndex + 8);
      const pathWithoutVersion = path.replace(/^v\d+\//, "");

      return pathWithoutVersion.substring(
        0,
        pathWithoutVersion.lastIndexOf(".")
      );
    } catch {
      return null;
    }
  };

  // =========================
  // Profile Image
  // =========================
  if (req.files?.profileImage?.[0]) {
    try {
      if (user.profileImage) {
        const publicId = getPublicIdFromUrl(user.profileImage);

        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      const fileStr = convertBufferToBase64Str(
        req.files.profileImage[0]
      );

      const uploadResult = await cloudinary.uploader.upload(fileStr, {
        folder: "user_profiles",
        resource_type: "auto",
      });

      updateData.profileImage = uploadResult.secure_url;
    } catch (err) {
      console.error("❌ Profile Image Upload Error:", err);

      return next(
        new Error(
          `خطأ أثناء رفع الصورة الشخصية: ${err.message || err}`,
          { cause: 500 }
        )
      );
    }
  }

  // =========================
  // Cover Image
  // =========================
  if (req.files?.coverImage?.[0]) {
    try {
      if (user.coverImage) {
        const publicId = getPublicIdFromUrl(user.coverImage);

        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      const fileStr = convertBufferToBase64Str(
        req.files.coverImage[0]
      );

      const uploadResult = await cloudinary.uploader.upload(fileStr, {
        folder: "user_profiles",
        resource_type: "auto",
      });

      updateData.coverImage = uploadResult.secure_url;
    } catch (err) {
      console.error("❌ Cover Image Upload Error:", err);

      return next(
        new Error(
          `خطأ أثناء رفع صورة الغلاف: ${err.message || err}`,
          { cause: 500 }
        )
      );
    }
  }

  // =========================
  // Text Fields
  // =========================

  if (country !== undefined) {
    updateData.country = country.trim();
  }
  
  

  if (fullName !== undefined) {
    updateData.username = fullName.trim();
  }

  if (title !== undefined) {
    updateData.title = title.trim();
  }

  if (bio !== undefined) {
    updateData.bio = bio.trim();
  }

  if (experience !== undefined) {
    updateData.experience = experience;
  }

  if (hourlyRate !== undefined) {
    updateData.hourlyRate = Number(hourlyRate);
  }

  if (phone !== undefined) {
    updateData.phone = phone;
  }

  if (github !== undefined) {
    updateData.github = github;
  }

  if (linkedin !== undefined) {
    updateData.linkedin = linkedin;
  }

  if (twitter !== undefined) {
    updateData.twitter = twitter;
  }

  if (website !== undefined) {
    updateData.website = website;
  }

  // =========================
  // Arrays
  // =========================

  if (techStack !== undefined) {
    updateData.techStack =
      typeof techStack === "string"
        ? JSON.parse(techStack)
        : techStack;
  }

  if (skills !== undefined) {
    updateData.skills =
      typeof skills === "string"
        ? JSON.parse(skills)
        : skills;
  }

  if (languages !== undefined) {
    updateData.languages =
      typeof languages === "string"
        ? JSON.parse(languages)
        : languages;
  }

  if (education !== undefined) {
    updateData.education =
      typeof education === "string"
        ? JSON.parse(education)
        : education;
  }

  if (certificates !== undefined) {
    updateData.certificates =
      typeof certificates === "string"
        ? JSON.parse(certificates)
        : certificates;
  }

  // =========================
  // Validation
  // =========================

  if (Object.keys(updateData).length === 0) {
    return next(
      new Error("لا يوجد بيانات جديدة للتحديث", {
        cause: 400,
      })
    );
  }

  updateData.compleytprofile = true;

  const updatedUser = await Usermodel.findByIdAndUpdate(
    id,
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  return successresponse(
    res,
    "تم تحديث الملف الشخصي بنجاح",
    200,
    { user: updatedUser }
  );
});

//اضافة مشروع 
export const createProject = asyncHandelr(async (req, res, next) => {
  const owner = req.user?._id;

  if (!owner) {
    return next(
      new Error("التوكن مطلوب", {
        cause: 401,
      })
    );
  }
const projectCount = await storeModel.countDocuments({
   owner
})
if (req.user.plan === "free" && projectCount >= 3) {
  return next(
    new Error("الرجاء ترقية الخطة لنشر المزيد من المشاريع", {
      cause: 403,
    })
  );
}
  const {
    projectName,
    category,
    shortDescription,
    fullDescription,
    demoUrl,
    githubUrl,
    license,
    technologies,
    mainFeatures,
    videoUrl,
    basic,
    pro,
    enterprise,
    supportPeriod,
    updatesPeriod,
  } = req.body;

  if (
    !projectName ||
    !category ||
    !shortDescription ||
    !license ||
    !supportPeriod ||
    !updatesPeriod
  ) {
    return next(
      new Error("جميع الحقول المطلوبة يجب إدخالها", {
        cause: 400,
      })
    );
  }

  // ==========================
  // Upload Images
  // ==========================

  const images = [];

  if (req.files?.images?.length) {
    for (const file of req.files.images) {
      const result = await uploadToCloudinary(file, {
        folder: "projects/images",
        resource_type: "image",
      });

      images.push(result.secure_url);
    }
  }

  // ==========================
  // Upload Video
  // ==========================

  let uploadedVideoUrl = videoUrl || "";

  if (req.files?.video?.length) {
    const result = await uploadToCloudinary(req.files.video[0], {
      folder: "projects/videos",
      resource_type: "video",
    });

    uploadedVideoUrl = result.secure_url;
  }

  // Upload ZIP

let downloadurl = "";

if (req.files?.downloadurl?.length) {
  const result = await uploadToCloudinary(
    req.files.downloadurl[0],
    {
      folder: "projects/files",
      resource_type: "raw",
    }
  );

  downloadurl = result.secure_url;
}

  // ==========================
  // Create Project
  // ==========================

  const project = await storeModel.create({
    owner,
    projectName,
    downloadurl,
    category,
    shortDescription,
    fullDescription,
    demoUrl,
    githubUrl,
    license,

    technologies:
      typeof technologies === "string"
        ? JSON.parse(technologies)
        : technologies,

    mainFeatures:
      typeof mainFeatures === "string"
        ? JSON.parse(mainFeatures)
        : mainFeatures,

    videoUrl: uploadedVideoUrl,

    basic:
      typeof basic === "string"
        ? JSON.parse(basic)
        : basic,

    pro:
      typeof pro === "string"
        ? JSON.parse(pro)
        : pro,

    enterprise:
      typeof enterprise === "string"
        ? JSON.parse(enterprise)
        : enterprise,

    supportPeriod,
    updatesPeriod,
    images,
  });

  return successresponse(
    res,
    "تم إنشاء المشروع بنجاح",
    201,
    {
      project,
    }
  );
});
//جلب جميع المشروعات للمبرمج
export const getallprojects = asyncHandelr(async (req, res, next) => {
  const id = req.user?._id;

  if (!id) {
    return next(new Error("التوكن مطلوب", { cause: 401 }));
  }

  const user = await Usermodel.findById(id);

  if (!user) {
    return next(new Error("المستخدم غير موجود", { cause: 404 }));
  }

 const myprojects = await storeModel.find({owner: id})
  return successresponse(
    res,
    "تم جلب جميع المشاريع بنجاح",
    200,
    {  myprojects }
  );
});

//تعديل حالة النشر
export const updatestate = asyncHandelr(async (req, res, next) => {
  const { id } = req.body;

  if (!id) {
    return next(new Error("الايدي مطلوب", { cause: 400 }));
  }

  const project = await storeModel.findById(id);

  if (!project) {
    return next(new Error("المشروع غير موجود", { cause: 404 }));
  }

  const updatedProject = await storeModel.findByIdAndUpdate(
    id,
    {
      public: !project.public,
    },
    {
      new: true,
    }
  );

  return successresponse(
    res,
    "تم تغيير حالة المشروع بنجاح",
    200,
   
  );
});
//حذف المشروع
export const deleteProject = asyncHandelr(async (req, res, next) => {
  const { id } = req.body;
  const owner = req.user?._id;

  if (!id) {
    return next(new Error("الايدي مطلوب", { cause: 400 }));
  }

  const project = await storeModel.findById(id);

  if (!project) {
    return next(new Error("المشروع غير موجود", { cause: 404 }));
  }

  // التأكد أن صاحب المشروع هو من يحذفه
  if (project.owner.toString() !== owner.toString()) {
    return next(new Error("غير مصرح لك بحذف هذا المشروع", { cause: 403 }));
  }

  // حذف الصور من Cloudinary
  if (project.images?.length) {
    for (const image of project.images) {
      try {
        const publicId = image
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];

        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.log("Error deleting image:", err);
      }
    }
  }

  // حذف المشروع
  await project.deleteOne();

  return successresponse(
    res,
    "تم حذف المشروع بنجاح",
    200
  );
});
//تعديل المشروع
export const updateProject = asyncHandelr(async (req, res, next) => {
  const owner = req.user?._id;
  const { id } = req.body;

  if (!owner) {
    return next(new Error("التوكن مطلوب", { cause: 401 }));
  }

  const project = await storeModel.findById(id);

  if (!project) {
    return next(new Error("المشروع غير موجود", { cause: 404 }));
  }

  if (project.owner.toString() !== owner.toString()) {
    return next(new Error("غير مصرح لك", { cause: 403 }));
  }

  const {
    projectName,
    category,
    shortDescription,
    fullDescription,
    demoUrl,
    githubUrl,
    license,
    technologies,
    mainFeatures,
    videoUrl,
    basic,
    pro,
    enterprise,
    supportPeriod,
    updatesPeriod,
  } = req.body;

  if (projectName !== undefined) {
    project.projectName = projectName;
  }

  if (category !== undefined) {
    project.category = category;
  }

  if (shortDescription !== undefined) {
    project.shortDescription = shortDescription;
  }

  if (fullDescription !== undefined) {
    project.fullDescription = fullDescription;
  }

  if (demoUrl !== undefined) {
    project.demoUrl = demoUrl;
  }

  if (githubUrl !== undefined) {
    project.githubUrl = githubUrl;
  }

  if (license !== undefined) {
    project.license = license;
  }

  if (technologies !== undefined) {
    project.technologies =
      typeof technologies === "string"
        ? JSON.parse(technologies)
        : technologies;
  }

  if (mainFeatures !== undefined) {
    project.mainFeatures =
      typeof mainFeatures === "string"
        ? JSON.parse(mainFeatures)
        : mainFeatures;
  }

  if (videoUrl !== undefined) {
    project.videoUrl = videoUrl;
  }

  if (basic !== undefined) {
    project.basic =
      typeof basic === "string"
        ? JSON.parse(basic)
        : basic;
  }

  if (pro !== undefined) {
    project.pro =
      typeof pro === "string"
        ? JSON.parse(pro)
        : pro;
  }

  if (enterprise !== undefined) {
    project.enterprise =
      typeof enterprise === "string"
        ? JSON.parse(enterprise)
        : enterprise;
  }

  if (supportPeriod !== undefined) {
    project.supportPeriod = supportPeriod;
  }

  if (updatesPeriod !== undefined) {
    project.updatesPeriod = updatesPeriod;
  }

  await project.save();

  return successresponse(
    res,
    "تم تعديل المشروع بنجاح",
    200,
    { project }
  );
});
//تقديم عرض علي المشروع
export const createProposal = asyncHandelr(async (req, res, next) => {
  const developer = req.user._id;

  const {
    projectId,
    coverLetter,
    budget,
    duration,
  } = req.body;

  // التأكد من وجود المشروع
  const project = await Projects.findById(projectId);

  if (!project) {
    return next(new Error("المشروع غير موجود", { cause: 404 }));
  }

  // منع صاحب المشروع من التقديم على مشروعه
  if (project.owner.toString() === developer.toString()) {
    return next(
      new Error("لا يمكنك التقديم على مشروعك", { cause: 400 })
    );
  }

  // منع التقديم إذا تم اختيار مبرمج بالفعل
  if (project.developertaked) {
    return next(
      new Error("تم اختيار مبرمج لهذا المشروع بالفعل", {
        cause: 400,
      })
    );
  }

  // منع التقديم مرتين
  const alreadyApplied = await proposal.findOne({
    project: projectId,
    developer,
  });

  if (alreadyApplied) {
    return next(
      new Error("لقد قمت بالتقديم على هذا المشروع بالفعل", {
        cause: 409,
      })
    );
  }
const previousProjectCount = await previousprojects.countDocuments({
  owner: developer,
});

if (previousProjectCount < 3) {
  return next(
    new Error("لازم تكون ناشر 3 مشاريع في سابقة الأعمال على الأقل", {
      cause: 409,
    })
  );
}


  const Proposl = await proposal.create({
    project: projectId,
    developer,
    owner: project.owner,
    coverLetter,
    budget,
    duration,
  });

  await createNotification({
    receiver: project.owner,
    sender: developer,
    type: "project",
    title: "لقد قدم علي مشروعك",
    body: project.coverLetter,
    project: projectId,
});

  return successresponse(
    res,
    "تم إرسال العرض بنجاح",
    201,
    Proposl
  );
});
//جلب المشاريع المتاحة
export const getOpenProjects = asyncHandelr(async (req, res, next) => {

  const projects = await Projects.find({
    public: true,
    $or: [
      { developertaked: null },
      { developertaked: { $exists: false } }
    ]
  })
    .populate("owner", "username profileImage location")
    .sort({ createdAt: -1 });

  // جلب عدد العروض لكل المشاريع مرة واحدة
  const proposalCounts = await proposal.aggregate([
    {
      $group: {
        _id: "$project",
        count: { $sum: 1 }
      }
    }
  ]);

  const countMap = new Map();

  proposalCounts.forEach(item => {
    countMap.set(item._id.toString(), item.count);
  });

  const data = projects.map((project) => ({
    _id: project._id,

    title: project.projectName,

    description: project.Description,

    category: project.category,

    budget: project.budget,

    duration: project.time,

    client: project.owner,

    deadline: project.deadline,

    skills: project.skills,
currency : project.currency,
    proposals: countMap.get(project._id.toString()) || 0,

    createdAt: project.createdAt,
  }));

  return successresponse(res, "Done", 200, {
    projects: data,
  });

});
//جلب عروض المبرمج
export const getMyProposals = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;

  const proposals = await proposal
    .find({ developer: userId })
    .populate({
      path: "project",
      select:
        "projectName Description budget time skills owner status",
      populate: {
        path: "owner",
        select: "username profileImage",
      },
    })
    .sort({ createdAt: -1 });

  const data = proposals.map((item) => ({
    id: item._id,

    projectId: item.project?._id,

    projectName: item.project?.projectName,

    clientName: item.project?.owner?.username,

    clientAvatar: item.project?.owner?.profileImage,

    clientCompany: item.project?.owner?.username,

    amount: item.budget,

    duration: item.duration,

    status: item.status,

    message: item.coverLetter,

    submittedAt: item.createdAt,

    respondedAt: item.respondedAt,

    milestones: item.milestones || [],

    projectDescription: item.project?.Description,

    projectBudget: item.project?.budget,

    projectDuration: item.project?.time,

    projectSkills: item.project?.skills || [],
    
  }));

  // الإحصائيات
  const stats = {
    total: data.length,

    pending: data.filter((p) => p.status === "pending").length,

    accepted: data.filter((p) => p.status === "accepted").length,

    rejected: data.filter((p) => p.status === "rejected").length,

    totalValue: data
      .filter((p) => p.status === "accepted")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0),
  };

  return successresponse(res, "Done", 200, {
    proposals: data,
    stats,
  });
});
//جلب غرفة المشروع
export const getProjectRoom = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;
  const { projectId } = req.params;
console.log(projectId)
  const project = await Projects.findById(projectId)
    .populate("owner", "username profileImage")
    .populate("developertaked", "username profileImage");
 const money = await proposal.findOne({
  project : projectId ,
  developer: project.developertaked,
  status: "accepted"
 })
    const cash = await Payment.find({project:projectId})
  if (!project)
    return next(new Error("المشروع غير موجود", { cause: 404 }));

  // صلاحية الدخول
  const allowed =
    project.owner._id.toString() === userId.toString() ||
    project.developertaked?._id.toString() === userId.toString();

  if (!allowed)
    return next(new Error("غير مصرح", { cause: 403 }));

  // الشات
  const chats = await chat.findOne({
    project: project._id,
  });

  return successresponse(res, "Done", 200, {
    project: {
      _id: project._id,
      projectName: project.projectName,
      description: project.Description,
      status: project.status,
      progress: project.progress,
      budget: money.budget,
      amount: project.amount,
      time: project.time,
      startDate: project.startDate,
      dueDate: project.dueDate,
      completedAt: project.completedAt,
      skills: project.skills,
      deadline: project.deadline,
      demoUrl: project.demoLink,
      githubRepo:  project.githubRepo,
      feature: project.features,
      objective: project.Objectives,
      payments: cash
    },

    client: project.owner,

    developer: project.developertaked,

    chatId: chats?._id || null,
  });
});
//اضافة مهمة 
export const createTask = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;

  const { projectId, title, description, dueDate } = req.body;

  const project = await Projects.findById(projectId).populate("owner", "notificationSettings");

  if (!project)
    return next(new Error("المشروع غير موجود", { cause: 404 }));
 if (project.clientApproved) {
    return next(
      new Error("تم الانتهاء من المشروع لايمكنك التعديل", { cause: 404 })
    );
  }
  // المبرمج فقط
  if (project.developertaked.toString() !== userId.toString())
    return next(new Error("غير مصرح", { cause: 403 }));

  const task = await tasks.create({
    project: projectId,
    createdBy: userId,
    title,
    description,
    dueDate,
  });
await createProjectActivity({
  project: projectId,
  user: userId,
  action: "task_created",
  targetType: "task",
  targetId: task._id,
  metadata: {
    taskTitle: task.title,
  },
});
if(project.notificationSettings.tasks == true){
  await createNotification({
    receiver: project.owner,
    sender:userId ,
    type: "tasks",
    title: "لقد تم اضافة مرلحة جديدة",
    body: "مرحلة جديدة",
    project: projectId,
});}
  return successresponse(res, "تم إنشاء المهمة", 201, {
    task,
  });
});
//جلب المهام
export const getProjectTasks = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;

  const { projectId } = req.params;

  const project = await Projects.findById(projectId);

  if (!project)
    return next(new Error("المشروع غير موجود", { cause: 404 }));

  const allowed =
    project.owner.toString() === userId.toString() ||
    project.developertaked.toString() === userId.toString();

  if (!allowed)
    return next(new Error("غير مصرح", { cause: 403 }));

  const task = await tasks.find({
    project: projectId,
  }).sort({ createdAt: 1 });

  return successresponse(res, "Done", 200, {
    task,
  });
});
//تعديل حالة المهام
export const updateTaskStatus = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;

  const { taskId } = req.params;

  const { status } = req.body;

  const task = await tasks.findById(taskId).populate("project");

  if (!task)
    return next(new Error("المهمة غير موجودة", { cause: 404 }));

  if (
    task.project.developertaked.toString() !==
    userId.toString()
  )
    return next(new Error("غير مصرح", { cause: 403 }));

  task.status = status;

  await task.save();

  // تحديث Progress تلقائياً

  const total = await tasks.countDocuments({
    project: task.project._id,
  });

  const completed = await tasks.countDocuments({
    project: task.project._id,
    status: "completed",
  });

  const progress =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  await Projects.findByIdAndUpdate(task.project._id, {
    progress,
  });

  return successresponse(res, "تم التعديل", 200, {
    task,
    progress,
  });
});
//حذف مهمة 
export const deleteTask = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;

  const { taskId } = req.params;

  const task = await tasks.findById(taskId).populate("project");

  if (!task)
    return next(new Error("المهمة غير موجودة", { cause: 404 }));

  if (
    task.project.developertaked.toString() !==
    userId.toString()
  )
    return next(new Error("غير مصرح", { cause: 403 }));

  await task.deleteOne();
await createProjectActivity({
  project: projectId,
  user: userId,
  action: "task_deleted",
  targetType: "task",
  targetId: task._id,
  metadata: {
    taskTitle: task.title,
  },
});
  return successresponse(res, "تم حذف المهمة", 200);
});
//اضافة عضو في فريق التطوير
export const addMember = asyncHandelr(async (req, res, next) => {
  const { projectId, role, email } = req.body;

  const project = await Projects.findById(projectId).populate("owner", "notificationSettings");

  if (!project) {
    return next(new Error("المشروع غير موجود", { cause: 404 }));
  }

if (project.clientApproved) {
    return next(
      new Error("تم الانتهاء من المشروع لايمكنك التعديل", { cause: 404 })
    );
  }
  // البحث عن المستخدم بالإيميل
  const member = await Usermodel.findOne({ email });

  if (!member) {
    return next(new Error("هذا المبرمج غير موجود", { cause: 404 }));
  }

  if (member.userType !== "developer") {
    return next(new Error("هذا عميل وليس مبرمج", { cause: 409 }));
  }

  // التأكد أنه غير مضاف بالفعل
  const exists = project.members.some((item) =>
    item.idmember.equals(member._id)
  );

  if (exists) {
    return next(new Error("هذا العضو موجود بالفعل", { cause: 409 }));
  }

  // إضافة العضو
  project.members.push({
    idmember: member._id,
    role,
  });
await createProjectActivity({
  project: projectId,
  user: userId,
  action: "member_added",
  targetType: "member",
  targetId: member._id,
  metadata: {
    memberName: member.username,
    role,
  },
});
  await project.save();
if(project.notificationSettings.projects == true){
  await createNotification({
    receiver: project.owner,
    sender:userId ,
    type: "projects",
    title: "لقد تم اضافة عضو جديد في فريق العمل",
    body: "عضو جديدة",
    project: projectId,
});}
  return res.status(201).json({
    message: "تم إضافة العضو بنجاح",
    members: project.members,
  });
});
//جلب اعضاء الفريق
export const getProjectMembers = asyncHandelr(async (req, res, next) => {
  const { projectId } = req.params;

  const project = await Projects
    .findOne({
      _id: projectId,
      
    })
    .select("members").populate("members.idmember", "username profileImage");

  if (!project) {
    return next(new Error("المشروع غير موجود", { cause: 404 }));
  }

  return res.status(200).json({
    message: "تم جلب أعضاء المشروع بنجاح",
    count: project.members.length,
    members: project.members,
  });
});
//حذف عضو
export const removeMember = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;
  const { projectId, memberId } = req.params;

  const project = await Projects.findById(projectId);

  if (!project) {
    return next(new Error("المشروع غير موجود", { cause: 404 }));
  }
  
if (project.clientApproved) {
    return next(
      new Error("تم الانتهاء من المشروع لايمكنك التعديل", { cause: 404 })
    );
  }
if (project.developertaked.toString() !== userId.toString()) {
  return next(new Error("غير مصرح لك", { cause: 403 }));
}
  const memberExists = project.members.some((member) =>
    member.idmember.equals(memberId)
  );

  if (!memberExists) {
    return next(new Error("العضو غير موجود في المشروع", { cause: 404 }));
  }

  project.members = project.members.filter(
    (member) => !member.idmember.equals(memberId)
  );

  await project.save();
await createProjectActivity({
  project: projectId,
  user: userId,
  action: "member_removed",
  targetType: "member",
  targetId: memberId,
});
  return res.status(200).json({
    message: "تم حذف العضو بنجاح",
    members: project.members,
  });
});
//انشاء فولدر
export const createFolder = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;
  const { projectId } = req.params;
  const { name } = req.body;

  const project = await Projects.findById(projectId);

  if (!project) {
    return next(new Error("المشروع غير موجود", { cause: 404 }));
  }

if (project.clientApproved) {
    return next(
      new Error("تم الانتهاء من المشروع لايمكنك التعديل", { cause: 404 })
    );
  }
  const folderExists = await FolderModel.findOne({
    project: projectId,
    name: name.trim(),
  });

  if (folderExists) {
    return next(
      new Error("يوجد فولدر بنفس الاسم بالفعل", {
        cause: 409,
      })
    );
  }

  const folder = await FolderModel.create({
    project: projectId,
    name: name.trim(),
    createdBy: userId,
  });
  await createProjectActivity({
  project: projectId,
  user: userId,
  action: "folder_created",
  targetType: "folder",
  targetId: folder._id,
  metadata: {
    folderName: folder.name,
  },
});

  return successresponse(
    res,
    "تم إنشاء الفولدر بنجاح",
    201,
    folder
  );
});
//جلب جميع الفولدرات
export const getProjectFolders = asyncHandelr(async (req, res, next) => {
  const { projectId } = req.params;

  const project = await Projects.findById(projectId);

  if (!project) {
    return next(new Error("المشروع غير موجود", { cause: 404 }));
  }

  const folders = await FolderModel.find({
    project: projectId,
  })
    .populate("createdBy", "username profileImage")
    .sort({ createdAt: -1 });

  return successresponse(
    res,
    "تم جلب الفولدرات بنجاح",
    200,
    folders
  );
});
//حذف فولدر بالكامل 
export const deleteFolder = asyncHandelr(async (req, res, next) => {
    const userId = req.user._id;
  const { projectId, folderId } = req.params;
  const project = await Projects.findById(projectId);

  const folder = await FolderModel.findOne({
    _id: folderId,
    project: projectId,
  });

  if (!folder) {
    return next(new Error("الفولدر غير موجود", { cause: 404 }));
  }

if (project.clientApproved) {
    return next(
      new Error("تم الانتهاء من المشروع لايمكنك التعديل", { cause: 404 })
    );
  }
  // جميع الملفات داخل الفولدر
  const files = await ProjectFiles.find({
    folder: folderId,
  });

  // حذف الملفات من Cloudinary
  for (const file of files) {
    try {
      await cloudinary.uploader.destroy(file.public_id, {
        resource_type: "raw",
      });
    } catch (err) {
      console.log(err);
    }
  
  }

  // حذف الملفات من قاعدة البيانات
  await ProjectFiles.deleteMany({
    folder: folderId,
  });

  // حذف الفولدر
  await FolderModel.findByIdAndDelete(folderId);
  await createProjectActivity({
  project: projectId,
  user: userId,
  action: "folder_deleted",
  targetType: "folder",
  metadata: {
    folderName: folder.name,
  },
});
  return successresponse(
    res,
    "تم حذف الفولدر وجميع ملفاته",
    200
  );
});

//رفع ملفات
export const uploadProjectFil = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;
  const { projectId, folderId } = req.params;
  const project = await Projects.findById(projectId);
  const folder = await FolderModel.findOne({
    _id: folderId,
    project: projectId,
  });
 if (project.clientApproved) {
    return next(
      new Error("تم الانتهاء من المشروع لايمكنك التعديل", { cause: 404 })
    );
  }
  if (!folder) {
    return next(new Error("الفولدر غير موجود", { cause: 404 }));
  }

  if (!req.files || req.files.length === 0) {
    return next(new Error("يجب اختيار ملفات", { cause: 400 }));
  }

  const uploadedFiles = [];

  for (const file of req.files) {
    // إصلاح أسماء الملفات العربية
    const fileName = Buffer.from(file.originalname, "latin1").toString("utf8");

    const extension = fileName.split(".").pop().toLowerCase();
    const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");

    const base64 = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: `projects/${projectId}/${folderId}`,
      resource_type: "raw",
      public_id: fileNameWithoutExt,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });

    let type = "";

    switch (extension) {
      case "pdf":
        type = "pdf";
        break;

      case "xls":
      case "xlsx":
        type = "excel";
        break;

      case "ppt":
      case "pptx":
        type = "powerpoint";
        break;

      default:
        return next(new Error("نوع الملف غير مدعوم", { cause: 400 }));
    }

    const fileUrl = `${result.secure_url}.${extension}`;

    const newFile = await ProjectFiles.create({
      project: projectId,
      folder: folderId,
      fileName,
      url: fileUrl,
      public_id: result.public_id,
      size: file.size,
      extension,
      type,
      uploadedBy: userId,
    });

    // تسجيل النشاط
    await createProjectActivity({
      project: projectId,
      user: userId,
      action: "file_uploaded",
      targetType: "file",
      targetId: newFile._id,
      metadata: {
        fileName: newFile.fileName,
        folderName: folder.name,
      },
    });

    uploadedFiles.push(newFile);
  }

  return successresponse(
    res,
    "تم رفع الملفات بنجاح",
    201,
    uploadedFiles
  );
});
//جلب جميع الملفات داخل الفولدر
export const getFolderFiles = asyncHandelr(async (req, res, next) => {
  const { projectId, folderId } = req.params;

  const folder = await FolderModel.findOne({
    _id: folderId,
    project: projectId,
  });

  if (!folder) {
    return next(new Error("الفولدر غير موجود", { cause: 404 }));
  }

  const files = await ProjectFiles.find({
    folder: folderId,
  })
    .populate("uploadedBy", "username profileImage")
    .sort({ createdAt: -1 });

  return successresponse(
    res,
    "تم جلب الملفات بنجاح",
    200,
    files
  );
});
//حذف ملف داخل الفولدر
export const deleteProjectFile = asyncHandelr(async (req, res, next) => {
      const userId = req.user._id;

  const { projectId, fileId } = req.params;
const project = await projects.findById(projectId)
  const file = await ProjectFiles.findOne({
    _id: fileId,
    project: projectId,
  });

  if (!file) {
    return next(new Error("الملف غير موجود", { cause: 404 }));
  }
 if (project.clientApproved) {
    return next(
      new Error("تم الانتهاء من المشروع لايمكنك التعديل", { cause: 404 })
    );
  }
  // حذف الملف من Cloudinary
  try {
    await cloudinary.uploader.destroy(file.public_id, {
      resource_type: "raw",
    });
  } catch (err) {
    console.error("Cloudinary Error:", err);
  }

  // حذف الملف من قاعدة البيانات
  await ProjectFiles.findByIdAndDelete(fileId);
await createProjectActivity({
  project: projectId,
  user: userId,
  action: "file_deleted",
  targetType: "file",
  metadata: {
    fileName: file.fileName,
  },
});
  return successresponse(
    res,
    "تم حذف الملف بنجاح",
    200
  );
});
//جلب الانشطة
export const getProjectActivity = asyncHandelr(async (req, res, next) => {
  const { projectId } = req.params;

  const project = await Projects.findById(projectId);

  if (!project) {
    return next(new Error("المشروع غير موجود", { cause: 404 }));
  }

  const activities = await ProjectActivity.find({
    project: projectId,
  })
    .populate("user", "username profileImage")
    .sort({ createdAt: -1 });

  return successresponse(
    res,
    "تم جلب النشاط بنجاح",
    200,
    activities
  );
});

//تعديل و اضافة رابط مستودع و ديمو
export const updateProjectLinks = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;
  const { projectId } = req.params;
  const { githubRepo, demoLink } = req.body;

  const project = await Projects.findById(projectId);

  if (!project) {
    return next(new Error("المشروع غير موجود", { cause: 404 }));
  }
 if (project.clientApproved) {
    return next(
      new Error("تم الانتهاء من المشروع لايمكنك التعديل", { cause: 404 })
    );
  }
  // السماح فقط لصاحب المشروع أو المطور المسؤول
  if (
    project.developertaked?.toString() !== userId.toString()
  ) {
    return next(new Error("غير مصرح لك", { cause: 403 }));
  }

  // لازم يبعت رابط واحد على الأقل
  if (githubRepo === undefined && demoLink === undefined) {
    return next(
      new Error("يجب إرسال رابط المستودع أو رابط الديمو", {
        cause: 400,
      })
    );
  }

  // التحقق من صحة الرابط
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (githubRepo !== undefined) {
    if (githubRepo && !isValidUrl(githubRepo)) {
      return next(
        new Error("رابط GitHub غير صالح", {
          cause: 400,
        })
      );
    }

    project.githubRepo = githubRepo.trim();
  }

  if (demoLink !== undefined) {
   // if (demoLink && !isValidUrl(demoLink)) {
      return next(
        new Error("رابط Demo غير صالح", {
          cause: 400,
        })
      );
  //  }

    project.demoLink = demoLink.trim();
  }

  await project.save();

  return successresponse(
    res,
    "تم تحديث روابط المشروع بنجاح",
    200,
    {
      githubRepo: project.githubRepo,
      demoLink: project.demoLink,
    }
  );
});
//جلب مشاريع المبرمج
export const GetDeveloperProjects = asyncHandelr(async (req, res, next) => {

  const userId = req.user._id;

  const allProjects = await Projects.find({
    developertaked: userId,
  }).populate("owner", "username profileImage");

  const result = await Promise.all(
    allProjects.map(async (project) => {

      const projectTasks = await tasks.find({
        project: project._id,
      });
       const cash = await proposal.findOne({
              project: project._id,
              status: "accepted"
            });

      const payments = await Payment.find({
        project: project._id,
      });

      return {
        _id: project._id,
        projectName: project.projectName,
        description: project.Description,
        category: project.category,

        client: project.owner,

        budget: cash.budget,
        amount: project.amount,

        status: project.status,
        progress: project.progress,

        skills: project.skills,

        startDate: project.startDate,
        dueDate: project.dueDate,
        completedAt: project.completedAt,
        createdAt: project.createdAt,

        tasks: projectTasks,
        payments,
      };
    })
  );

  return successresponse(res, "Done", 200, {
    count: result.length,
    projects: result,
  });

});
//تحديث بيانات الاعدادات
export const updateAccountSettings = asyncHandelr(async (req, res) => {

  const updates = {};

  const fields = [
    "phone",
    "language",
    "timezone",
    "currency",
    "dateFormat",
    "profilpublic"
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await Usermodel.findByIdAndUpdate(
    req.user._id,
    {
      $set: updates,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  return successresponse(
    res,
    "تم تحديث البيانات",
    200,
    user
  );
});

//تعديل اعدادات الاشعارات
export const updateNotificationSettings = asyncHandelr(async (req, res) => {

  const updates = {};

  Object.keys(req.body).forEach((key) => {
    updates[`notificationSettings.${key}`] = req.body[key];
  });

  const user = await Usermodel.findByIdAndUpdate(
    req.user._id,
    {
      $set: updates,
    },
    {
      new: true,
    }
  );

  return successresponse(
    res,
    "تم تحديث إعدادات الإشعارات",
    200,
    user.notificationSettings
  );
});
//تم حذف الحساب 
export const deleteAccount = asyncHandelr(async (req, res) => {

  await Usermodel.findByIdAndUpdate(
    req.user._id,
    {
      deleted: true,
      deletedAt: new Date(),
    }
  );

  return successresponse(
    res,
    "تم حذف الحساب",
    200
  );
});
//صفحة السحب
export const getDeveloperEarnings = asyncHandelr(async (req, res, next) => {

    const developer = req.user._id;
    const now = new Date();

    const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const startOfWeek = new Date(now);
    startOfWeek.setDate(
        startOfWeek.getDate() - startOfWeek.getDay()
    );

    const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    );

    const months = [
        "",
        "يناير",
        "فبراير",
        "مارس",
        "أبريل",
        "مايو",
        "يونيو",
        "يوليو",
        "أغسطس",
        "سبتمبر",
        "أكتوبر",
        "نوفمبر",
        "ديسمبر",
    ];

    // =====================================
    // Store Revenue
    // =====================================

    const storeRevenueResult =
        await Order.aggregate([
            {
                $match: {
                    developer,
                    status: "paid",
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount",
                    },
                },
            },
        ]);

    const storeRevenue =
        storeRevenueResult[0]?.total || 0;

    // =====================================
    // Freelance Revenue
    // =====================================

    const paymentRevenueResult =
        await Payment.aggregate([
            {
                $lookup: {
                    from: "projects",
                    localField: "project",
                    foreignField: "_id",
                    as: "project",
                },
            },
            {
                $unwind: "$project",
            },
            {
                $match: {
                    "project.developertaked": developer,
                    status: "paid",
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount",
                    },
                },
            },
        ]);

    const freelanceRevenue =
        paymentRevenueResult[0]?.total || 0;

    // =====================================
    // Pending Payments
    // =====================================

    const pendingPaymentResult =
        await Payment.aggregate([
            {
                $lookup: {
                    from: "projects",
                    localField: "project",
                    foreignField: "_id",
                    as: "project",
                },
            },
            {
                $unwind: "$project",
            },
            {
                $match: {
                    "project.developertaked": developer,
                    status: "pending",
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount",
                    },
                },
            },
        ]);

    const pendingPayments =
        pendingPaymentResult[0]?.total || 0;

    // =====================================
    // Withdraw Summary
    // =====================================

    const withdrawSummary =
        await Withdraw.aggregate([
            {
                $match: {
                    developer,
                },
            },
            {
                $group: {
                    _id: "$status",
                    total: {
                        $sum: "$amount",
                    },
                },
            },
        ]);

    const withdrawnAmount =
        withdrawSummary.find(
            x => x._id === "completed"
        )?.total || 0;

    const pendingWithdraw =
        withdrawSummary.find(
            x => x._id === "pending"
        )?.total || 0;

    // =====================================
    // Final Numbers
    // =====================================

    const totalEarnings =
        storeRevenue +
        freelanceRevenue;

    const availableBalance =
        totalEarnings -
        withdrawnAmount -
        pendingWithdraw;
            // =====================================
    // Today / Week / Month Earnings
    // =====================================

    const [
        todayOrders,
        weekOrders,
        monthOrders,
        todayPayments,
        weekPayments,
        monthPayments,
        projectsCount,
    ] = await Promise.all([

        Order.aggregate([
            {
                $match: {
                    developer,
                    status: "paid",
                    createdAt: {
                        $gte: startOfDay,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount",
                    },
                },
            },
        ]),

        Order.aggregate([
            {
                $match: {
                    developer,
                    status: "paid",
                    createdAt: {
                        $gte: startOfWeek,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount",
                    },
                },
            },
        ]),

        Order.aggregate([
            {
                $match: {
                    developer,
                    status: "paid",
                    createdAt: {
                        $gte: startOfMonth,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount",
                    },
                },
            },
        ]),

        Payment.aggregate([
            {
                $lookup: {
                    from: "projects",
                    localField: "project",
                    foreignField: "_id",
                    as: "project",
                },
            },
            {
                $unwind: "$project",
            },
            {
                $match: {
                    "project.developertaked": developer,
                    status: "paid",
                    createdAt: {
                        $gte: startOfDay,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount",
                    },
                },
            },
        ]),

        Payment.aggregate([
            {
                $lookup: {
                    from: "projects",
                    localField: "project",
                    foreignField: "_id",
                    as: "project",
                },
            },
            {
                $unwind: "$project",
            },
            {
                $match: {
                    "project.developertaked": developer,
                    status: "paid",
                    createdAt: {
                        $gte: startOfWeek,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount",
                    },
                },
            },
        ]),

        Payment.aggregate([
            {
                $lookup: {
                    from: "projects",
                    localField: "project",
                    foreignField: "_id",
                    as: "project",
                },
            },
            {
                $unwind: "$project",
            },
            {
                $match: {
                    "project.developertaked": developer,
                    status: "paid",
                    createdAt: {
                        $gte: startOfMonth,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount",
                    },
                },
            },
        ]),

        projects.countDocuments({
            developertaked: developer,
        }),

    ]);

    const todayEarnings =
        (todayOrders[0]?.total || 0) +
        (todayPayments[0]?.total || 0);

    const weeklyEarnings =
        (weekOrders[0]?.total || 0) +
        (weekPayments[0]?.total || 0);

    const monthlyEarnings =
        (monthOrders[0]?.total || 0) +
        (monthPayments[0]?.total || 0);

    const stats = {

        totalEarnings,

        availableBalance,

        pendingAmount: pendingPayments,

        withdrawnAmount,

        todayEarnings,

        weeklyEarnings,

        monthlyEarnings,

        averagePerProject:
            projectsCount > 0
                ? Math.round(
                      totalEarnings /
                          projectsCount
                  )
                : 0,

    };

 
        // =====================================
// Transactions
// =====================================

const [storeTransactions, projectTransactions] =
    await Promise.all([

        Order.find({
            developer,
            status: "paid",
        })
            .populate(
                "buyer",
                "username"
            )
            .populate(
                "project",
                "projectName"
            )
            .sort({
                createdAt: -1,
            })
            .limit(10)
            .lean(),

        Payment.aggregate([
            {
                $lookup: {
                    from: "projects",
                    localField: "project",
                    foreignField: "_id",
                    as: "project",
                },
            },

            {
                $unwind: "$project",
            },

            {
                $match: {
                    "project.developertaked":
                        developer,
                    status: "paid",
                },
            },

            {
                $sort: {
                    createdAt: -1,
                },
            },

            {
                $limit: 10,
            },
        ]),
    ]);

const transactions = [

    ...storeTransactions.map(item => ({

        id: item._id,

        type: "sale",

        project:
            item.project?.projectName,

        buyer:
            item.buyer?.username,

        amount: item.amount,

        date: item.createdAt,

        package: item.package,

        status: item.status,

    })),

    ...projectTransactions.map(item => ({

        id: item._id,

        type: "project",

        project:
            item.project.projectName,

        buyer: item.namePayment,

        amount: item.amount,

        date: item.createdAt,

        status: item.status,

        typeLabel:
            "دفعة مشروع",

    })),

]
    .sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    )
    .slice(0, 15);

// =====================================
// Withdraw History
// =====================================

const withdrawals =
    await Withdraw.find({
        developer,
    })
        .sort({
            createdAt: -1,
        })
        .limit(20)
        .lean();

const withdrawalsData =
    withdrawals.map(item => ({

        id: item._id,

        amount: item.amount,

        method: item.method,

        status: item.status,

        reference:
            item.reference,

        date:
            item.createdAt,

    }));

// =====================================
// Top Selling Store Projects
// =====================================

const topProjects =
    await Order.aggregate([

        {
            $match: {
                developer,
                status: "paid",
            },
        },

        {
            $group: {

                _id: "$project",

                revenue: {
                    $sum: "$amount",
                },

                sales: {
                    $sum: 1,
                },

            },
        },

        {
            $sort: {
                revenue: -1,
            },
        },

        {
            $limit: 5,
        },

        {
            $lookup: {

                from: "stores",

                localField: "_id",

                foreignField: "_id",

                as: "project",

            },
        },

        {
            $unwind: "$project",
        },

    ]);

const topProjectsData =
    topProjects.map(item => ({

        id: item.project._id,

        name:
            item.project.projectName,

        sales: item.sales,

        revenue: item.revenue,

        image:
            item.project.images?.[0] ||
            "",

        rating:
            item.project.rating || 0,

    }));
    // =====================================
// Chart
// =====================================

// أرباح المتجر
const storeChart = await Order.aggregate([
    {
        $match: {
            developer,
            status: "paid",
        },
    },
    {
        $group: {
            _id: {
                year: {
                    $year: "$createdAt",
                },
                month: {
                    $month: "$createdAt",
                },
            },
            earnings: {
                $sum: "$amount",
            },
        },
    },
]);

// أرباح المشاريع الخاصة
const paymentChart = await Payment.aggregate([
    {
        $lookup: {
            from: "projects",
            localField: "project",
            foreignField: "_id",
            as: "project",
        },
    },
    {
        $unwind: "$project",
    },
    {
        $match: {
            "project.developertaked": developer,
            status: "paid",
        },
    },
    {
        $group: {
            _id: {
                year: {
                    $year: "$createdAt",
                },
                month: {
                    $month: "$createdAt",
                },
            },
            earnings: {
                $sum: "$amount",
            },
        },
    },
]);

// دمج النتائج
const chartMap = {};

storeChart.forEach(item => {
    const key = `${item._id.year}-${item._id.month}`;

    chartMap[key] = {
        year: item._id.year,
        month: item._id.month,
        earnings: item.earnings,
    };
});

paymentChart.forEach(item => {

    const key = `${item._id.year}-${item._id.month}`;

    if (!chartMap[key]) {

        chartMap[key] = {
            year: item._id.year,
            month: item._id.month,
            earnings: 0,
        };

    }

    chartMap[key].earnings += item.earnings;

});

const chartData = Object.values(chartMap)
    .sort((a, b) => {

        if (a.year === b.year)
            return a.month - b.month;

        return a.year - b.year;

    })
    .slice(-6)
    .map(item => ({

        month: months[item.month],

        earnings: item.earnings,

    }));

// =====================================
// Response
// =====================================

return successresponse(
    res,
    "تم جلب الأرباح بنجاح",
    200,
    {
        stats,

        chartData,

        transactions,

        withdrawals: withdrawalsData,

        topProjects: topProjectsData,
        storesales: storeRevenue,
        custmisprojects: freelanceRevenue
    }
);})
//جلب بيانات الداش بورد
export const getDeveloperDashboard = async (req, res) => {
  try {
    const developerId = req.user._id;
    const now = new Date();

    // تجهيز تواريخ اليوم، الأسبوع، والشهر للحسابات المالية
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const month = new Date(now.getFullYear(), now.getMonth(), 1);

    // =========================================================================
    // 1. تنفيذ جميع العمليات بشكل متوازٍ باستخدام Promise.all (لأعلى أداء)
    // =========================================================================
    const [
      projectStatsData,
      notificationStatsData,
      totalStoreProjects,
      totalChats,
      totalTasks,
      freelanceDataResult,
      storeDataResult,
      withdrawsResult,
      stores, // نحتاجها لاحقاً لحساب المشاهدات
      recentProjects,
      recentSales,
      recentMessages,
      upcomingTasks,
      topSellingProducts,
      latestNotifications,
        reviewStats,
    ] = await Promise.all([
      
      // -- إحصائيات المشاريع (إجمالي، مكتمل، جاري) في استعلام واحد بدلاً من 3 --
      Projects.aggregate([
        { $match: { developertaked: developerId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
            ongoing: { $sum: { $cond: [{ $in: ["$status", ["pending", "review", "in_progress"]] }, 1, 0] } },
          },
        },
      ]),

      // -- إحصائيات الإشعارات (الكل، غير المقروء) في استعلام واحد بدلاً من 2 --
      Notification.aggregate([
        { $match: { receiver: developerId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            unread: { $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] } },
          },
        },
      ]),

      // -- الإحصائيات الفردية --
      storeModel.countDocuments({ owner: developerId }),
      chat.countDocuments({ developer: developerId }),
      Tasks.countDocuments({ createdBy: developerId }),

      // -- إحصائيات الـ Freelance (Payments) باستخدام Lookup و Facet --
      Payment.aggregate([
        {
          // الربط مع المشاريع لمعرفة المطور الحقيقي
          $lookup: {
            from: "projects", // تأكد أن هذا هو اسم الكولكشن في قاعدة البيانات
            localField: "project", // الحقل الموجود في Payment
            foreignField: "_id",
            as: "projectData",
          },
        },
        { $unwind: "$projectData" },
        { $match: { "projectData.developertaked": developerId } },
        {
          $facet: {
            paidStats: [
              { $match: { status: "paid" } },
              {
                $group: {
                  _id: null,
                  totalEarnings: { $sum: "$amount" },
                  todayEarnings: { $sum: { $cond: [{ $gte: ["$createdAt", today] }, "$amount", 0] } },
                  weeklyEarnings: { $sum: { $cond: [{ $gte: ["$createdAt", week] }, "$amount", 0] } },
                  monthlyEarnings: { $sum: { $cond: [{ $gte: ["$createdAt", month] }, "$amount", 0] } },
                },
              },
            ],
            pendingStats: [
              { $match: { status: "pending" } },
              {
                $group: {
                  _id: null,
                  pendingBalance: { $sum: "$amount" },
                },
              },
            ],
            chartData: [
              { $match: { status: "paid" } },
              {
                $group: {
                  _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                  earnings: { $sum: "$amount" },
                },
              },
            ],
          },
        },
      ]),

      // -- إحصائيات المتجر (Orders) باستخدام Facet --
      Order.aggregate([
        { $match: { developer: developerId, status: "paid" } },
        {
          $facet: {
            paidStats: [
              {
                $group: {
                  _id: null,
                  totalSales: { $sum: 1 },
                  storeRevenue: { $sum: "$amount" },
                  todayEarnings: { $sum: { $cond: [{ $gte: ["$createdAt", today] }, "$amount", 0] } },
                  weeklyEarnings: { $sum: { $cond: [{ $gte: ["$createdAt", week] }, "$amount", 0] } },
                  monthlyEarnings: { $sum: { $cond: [{ $gte: ["$createdAt", month] }, "$amount", 0] } },
                },
              },
            ],
            chartData: [
              {
                $group: {
                  _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                  earnings: { $sum: "$amount" },
                },
              },
            ],
          },
        },
      ]),

      // -- إحصائيات السحب (Withdraws) --
      Withdraw.aggregate([
        { $match: { developer: developerId } },
        {
          $group: {
            _id: "$status", // نجمع حسب الحالة (completed / pending)
            total: { $sum: "$amount" },
          },
        },
      ]),

      // -- المتاجر (لجلب المشاهدات لاحقاً) --
      storeModel.find({ owner: developerId }).select("_id").lean(),

      // -- العمليات الأخيرة (Recent Data) - لم تتغير ميزاتها بل تم تحسينها بـ lean --
      projects.find({ developertaked: developerId }).populate("owner", "username profileImage").sort({ updatedAt: -1 }).limit(5).lean(),
      Order.find({ developer: developerId, status: "paid" }).populate("buyer", "username profileImage").populate("project", "projectName").sort({ createdAt: -1 }).limit(5).lean(),
      chat.find({ developer: developerId }).populate({ path: "lastMessage", populate: { path: "sender", select: "username profileImage" } }).populate("client", "username profileImage").sort({ updatedAt: -1 }).limit(5).lean(),
      tasks.find({ createdBy: developerId, status: { $ne: "completed" } }).populate("project", "projectName").sort({ dueDate: 1 }).limit(5).lean(),
      
      // Top Selling Products
      Order.aggregate([
        { $match: { developer: developerId, status: "paid" } },
        { $group: { _id: "$project", sales: { $sum: 1 }, revenue: { $sum: "$amount" } } },
        { $sort: { sales: -1 } },
        { $limit: 5 },
        { $lookup: { from: "stores", localField: "_id", foreignField: "_id", as: "project" } },
        { $unwind: "$project" },
        {
          $project: {
            _id: 1,
            sales: 1,
            revenue: 1,
            projectName: "$project.projectName",
            images: "$project.images",
            category: "$project.category",
          },
        },
      ]),
      
      Notification.find({ receiver: developerId }).sort({ createdAt: -1 }).limit(5).lean(),
      projectreviwe.aggregate([
  { $match: { developer: developerId } },
  {
    $group: {
      _id: null,
      averageRating: { $avg: "$rating" },
      totalReviews: { $sum: 1 },
    },
  },
]),
    ]);

    // =========================================================================
    // 2. معالجة وتجهيز البيانات الناتجة
    // =========================================================================

    // استخراج الإحصائيات من نواتج Aggregations (مع قيم افتراضية 0 في حال عدم وجود بيانات)
    const projectStats = projectStatsData[0] || { total: 0, completed: 0, ongoing: 0 };
    const notifStats = notificationStatsData[0] || { total: 0, unread: 0 };
    
    const freelanceData = freelanceDataResult[0] || { paidStats: [], pendingStats: [], chartData: [] };
    const fStats = freelanceData.paidStats[0] || { totalEarnings: 0, todayEarnings: 0, weeklyEarnings: 0, monthlyEarnings: 0 };
    const freelancePending = freelanceData.pendingStats[0]?.pendingBalance || 0;

    const storeData = storeDataResult[0] || { paidStats: [], chartData: [] };
    const sStats = storeData.paidStats[0] || { totalSales: 0, storeRevenue: 0, todayEarnings: 0, weeklyEarnings: 0, monthlyEarnings: 0 };

    // عمليات السحب (Withdraws)
    const totalWithdrawn = withdrawsResult.find(w => w._id === "completed")?.total || 0;
    const pendingWithdraw = withdrawsResult.find(w => w._id === "pending")?.total || 0;
const reviews = reviewStats[0] || {
  averageRating: 0,
  totalReviews: 0,
};
    // =========================================================================
    // 3. الحسابات المالية (كما تم طلبها بالضبط)
    // =========================================================================

    const freelanceRevenue = fStats.totalEarnings;
    const marketplaceRevenue = sStats.storeRevenue;
    const totalEarnings = freelanceRevenue + marketplaceRevenue;

    const todayEarnings = fStats.todayEarnings + sStats.todayEarnings;
    const weeklyEarnings = fStats.weeklyEarnings + sStats.weeklyEarnings;
    const monthlyEarnings = fStats.monthlyEarnings + sStats.monthlyEarnings;

    // الرصيد المعلق هو مجموع الـ payments المعلقة الخاصة بمشاريع المطور
    const pendingBalance = freelancePending;

    // الرصيد المتاح يحسب برمجياً (ديناميكياً)
    const availableBalance = totalEarnings - totalWithdrawn - pendingWithdraw;

    // =========================================================================
    // 4. دمج الرسم البياني (Orders + Payments) في Map
    // =========================================================================
    const chartMap = new Map();

    const addToChartMap = (dataArray) => {
      dataArray.forEach((item) => {
        if (!item._id || !item._id.year || !item._id.month) return;
        // إنشاء مفتاح لترتيب البيانات لاحقاً (مثال: 2023-05)
        const key = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
        const currentEarnings = chartMap.get(key) || 0;
        chartMap.set(key, currentEarnings + item.earnings);
      });
    };

    addToChartMap(freelanceData.chartData); // دمج المدفوعات (Freelance)
    addToChartMap(storeData.chartData);     // دمج الطلبات (Store)

    // تحويل الـ Map لمصفوفة، ترتيبها تصاعدياً حسب السنة والشهر، واقتطاع آخر 6 شهور
    const monthlyChart = Array.from(chartMap.entries())
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB)) // ترتيب تصاعدي حسب مفتاح التاريخ
      .slice(-6)
      .map(([key, earnings]) => {
        const [, monthStr] = key.split("-");
        return {
          month: parseInt(monthStr, 10),
          earnings,
        };
      });

    // =========================================================================
    // 5. حساب مشاهدات المتاجر ومعدل التحويل (Store Views & Conversion)
    // =========================================================================
    const storeIds = stores.map((store) => store._id);
    const totalViews = await StoreView.countDocuments({
      project: { $in: storeIds },
    });

    const conversionRate =
      totalViews === 0
        ? 0
        : Number(((sStats.totalSales / totalViews) * 100).toFixed(2));

    // =========================================================================
    // 6. إرسال الـ Response (نفس الشكل الأصلي 100%)
    // =========================================================================
    return res.status(200).json({
      success: true,

      statistics: {
        totalProjects: projectStats.total,
        completedProjects: projectStats.completed,
        ongoingProjects: projectStats.ongoing,

        totalProducts: totalStoreProjects,
        totalOrders: sStats.totalSales,

        freelanceRevenue,
        marketplaceRevenue,
        totalEarnings,

        availableBalance,
        pendingBalance,

        totalWithdrawn,
        pendingWithdraw,
averageRating: Number((reviews.averageRating || 0).toFixed(1)),
totalReviews: reviews.totalReviews,
        totalChats,
        totalTasks,

        totalNotifications: notifStats.total,
        unreadNotifications: notifStats.unread,

        totalViews,
        conversionRate,
      },

      earnings: {
        total: totalEarnings,
        today: todayEarnings,
        week: weeklyEarnings,
        month: monthlyEarnings,
      },

      charts: {
        monthlyChart,
      },

      recentProjects,
      recentSales,
      recentMessages,
      upcomingTasks,
      topSellingProducts,
      latestNotifications,
    
    });

  } catch (error) {
    console.error("Dashboard Error: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
//طلب سحب
export const requestwithdraw = asyncHandelr(async (req, res, next) => {

    const developer = req.user._id;

    const { amount, method, account , phone } = req.body;

    if (!amount || !method || !account || !phone) {
        return next(
            new Error("الرجاء إدخال جميع الحقول", {
                cause: 400,
            })
        );
    }

    const user = await Usermodel.findById(developer);

    if (!user) {
        return next(
            new Error("المستخدم غير موجود", {
                cause: 404,
            })
        );
    }

    // ============================
    // إجمالي أرباح المتجر
    // ============================

    const storeRevenue = await Order.aggregate([
        {
            $match: {
                developer,
                status: "paid",
            },
        },
        {
            $group: {
                _id: null,
                total: {
                    $sum: "$amount",
                },
            },
        },
    ]);

    // ============================
    // إجمالي أرباح المشاريع
    // ============================

    const freelanceRevenue = await Payment.aggregate([
        {
            $lookup: {
                from: "projects",
                localField: "project",
                foreignField: "_id",
                as: "project",
            },
        },
        {
            $unwind: "$project",
        },
        {
            $match: {
                "project.developertaked": developer,
                status: "paid",
            },
        },
        {
            $group: {
                _id: null,
                total: {
                    $sum: "$amount",
                },
            },
        },
    ]);

    // ============================
    // السحوبات
    // ============================

    const withdrawSummary = await Withdraw.aggregate([
        {
            $match: {
                developer,
            },
        },
        {
            $group: {
                _id: "$status",
                total: {
                    $sum: "$amount",
                },
            },
        },
    ]);

    const completedWithdraw =
        withdrawSummary.find(
            item => item._id === "completed"
        )?.total || 0;

    const pendingWithdraw =
        withdrawSummary.find(
            item => item._id === "pending"
        )?.total || 0;

    // ============================
    // الرصيد الحقيقي
    // ============================

    const totalEarnings =
        (storeRevenue[0]?.total || 0) +
        (freelanceRevenue[0]?.total || 0);

    const availableBalance =
        totalEarnings -
        completedWithdraw -
        pendingWithdraw;

    if (amount > availableBalance) {
        return next(
            new Error("لا تمتلك رصيد كافي", {
                cause: 400,
            })
        );
    }

    // ============================
    // إنشاء طلب السحب
    // ============================

    const withdraw = await Withdraw.create({
        developer,
        amount,
        method,
        account,
        status: "pending",
        phone
    });

    return successresponse(
        res,
        "تم إنشاء طلب السحب بنجاح",
        200,
        {
            withdraw,
            availableBalance:
                availableBalance - amount,
        }
    );
});
//اضافة اعمال سابقة
export const addpreviousprojects = asyncHandelr(async (req, res, next) => {
  const owner = req.user?._id;

  if (!owner) {
    return next(
      new Error("التوكن مطلوب", {
        cause: 401,
      })
    );
  }

  const {
    projectName,
    category,
    shortDescription,
    fullDescription,
    demoUrl,
    githubUrl,
    technologies,
    mainFeatures,
    videoUrl,
  } = req.body;

  if (
    !projectName ||
    !category ||
    !shortDescription 
  ) {
    return next(
      new Error("جميع الحقول المطلوبة يجب إدخالها", {
        cause: 400,
      })
    );
  }

  // ==========================
  // Upload Images
  // ==========================

  const images = [];

  if (req.files?.images?.length) {
    for (const file of req.files.images) {
      const result = await uploadToCloudinary(file, {
        folder: "projects/images",
        resource_type: "image",
      });

      images.push(result.secure_url);
    }
  }

  // ==========================
  // Upload Video
  // ==========================

  let uploadedVideoUrl = videoUrl || "";

  if (req.files?.video?.length) {
    const result = await uploadToCloudinary(req.files.video[0], {
      folder: "projects/videos",
      resource_type: "video",
    });

    uploadedVideoUrl = result.secure_url;
  }
  // ==========================
  // Create Project
  // ==========================

  const project = await previousprojects.create({
    owner,
    projectName,
    category,
    shortDescription,
    fullDescription,
    demoUrl,
    githubUrl,
  

    technologies:
      typeof technologies === "string"
        ? JSON.parse(technologies)
        : technologies,

    mainFeatures:
      typeof mainFeatures === "string"
        ? JSON.parse(mainFeatures)
        : mainFeatures,

    videoUrl: uploadedVideoUrl,

    images,
  });

  return successresponse(
    res,
    "تم إنشاء المشروع بنجاح",
    201,
    {
      project,
    }
  );
});
//جلب الاعمال السابقة للمبرمج
export const getpreviousprojects = asyncHandelr(async (req, res, next) => {
const {id} = req.body


 

 const myprojects = await previousprojects.find({owner: id})

  return successresponse(
    res,
    "تم جلب جميع الاعمال السابقة بنجاح",
    200,
    {  myprojects }
  );
});
// حذف عمل سابق لدي المبرمج
export const deletepreviousprojects = asyncHandelr(async (req, res, next) => {
  const { projectId } = req.body;
  const owner = req.user?._id;

  if (!projectId) {
    return next(
      new Error("الايدي مطلوب", {
        cause: 400,
      })
    );
  }

  const project = await previousprojects.findById(projectId);

  if (!project) {
    return next(
      new Error("المشروع غير موجود", {
        cause: 404,
      })
    );
  }

  if (project.owner.toString() !== owner.toString()) {
    return next(
      new Error("غير مصرح لك بحذف هذا المشروع", {
        cause: 403,
      })
    );
  }

  // ==========================
  // حذف الصور
  // ==========================

  if (project.images?.length) {
    for (const image of project.images) {
      try {
        const publicId = image
          .split("/upload/")[1]
          .replace(/^v\d+\//, "")
          .split(".")[0];

        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.log("Error deleting image:", err);
      }
    }
  }

  // ==========================
  // حذف الفيديو
  // ==========================

  if (project.videoUrl) {
    try {
      const publicId = project.videoUrl
        .split("/upload/")[1]
        .replace(/^v\d+\//, "")
        .split(".")[0];

      await cloudinary.uploader.destroy(publicId, {
        resource_type: "video",
      });
    } catch (err) {
      console.log("Error deleting video:", err);
    }
  }

  // ==========================
  // حذف المشروع
  // ==========================

  await project.deleteOne();

  return successresponse(
    res,
    "تم حذف المشروع بنجاح",
    200
  );
});