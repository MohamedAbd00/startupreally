import { asyncHandelr } from "../../../utlis/response/error.response.js";
import { successresponse } from "../../../utlis/response/success.response.js";
import Usermodel from "../../../DB/models/usermodel.js";
import profileImage from "../../../DB/models/profileImage.js";
import projects from "../../../DB/models/projects.js";
import proposal from "../../../DB/models/proposal.js";
import chat from "../../../DB/models/chat.js";
import Message from "../../../DB/models/massege.js";
import Payment from "../../../DB/models/Payment .js";
import { createProjectActivity } from "../../../utlis/activity/projectActivity.js";
import storeModel from "../../../DB/models/store.js";
 import {createNotification} from "../../../utlis/activity/createNotification.js"
  import ProductViews from "../../../DB/models/ProductViews.js"
import Order from "../../../DB/models/Order.js";
import previousprojects from "../../../DB/models/previousprojects.js"
import Review from "../../../DB/models/Review.js"; // ✅ أضف الـ import ده
import chatsupport from "../../../DB/models/chatsupport.js";
import projectreviwe from "../../../DB/models/projectreviwe.js";
import ProjectActivity from "../../../DB/models/activity.js";
import reportModel from "../../../DB/models/report.js";
import tasks from "../../../DB/models/Tasks.js";
import { cloudinary , getCloudinaryPublicId} from "../../../utlis/multer/clouid.multern.js";
import AdminActivity from "../../../DB/models/adminactivity.js";
import PaymentRequest from "../../../DB/models/PaymentRequest.js";
import {
  getR2Key,
  deleteFromR2,
} from "../../../utlis/multer/cloudflare.js";
import { uploadToCloudinary } from "../../../utlis/multer/clouid.multern.js";
import { sendemail } from "../../../utlis/email/sendemail.js";
import { acceptedEmail, broadcastEmailTemplate } from "../../../utlis/temblete/vervication.email.js";
import UserActivity from "../../../DB/models/UserActivity.js";
import { generatehash } from "../../../utlis/security/hash.security.js";
import { logadminActivity } from "../../../utlis/activity/adminactivity.js";
import Withdraw from "../../../DB/models/Withdraw.js";

//جلب المستخدمين
export const getusers = asyncHandelr(async (req, res, next) => {

  const users = await Usermodel.find({
    userType: { $ne: "admin" }
  }).sort({ createdAt: -1 });


  return successresponse(
    res,
    "تم جلب جميع المستخدمين بنجاح",
    200,
    {
      users
    }
  );

});
//جلب مستخدم معين
export const getuser = asyncHandelr(async (req, res, next) => {
  const { userId } = req.params;

  // ==========================================
  // جلب المستخدم
  // ==========================================

  const user = await Usermodel.findById(userId);

  if (!user) {
    return next(
      new Error("المستخدم غير موجود", { cause: 404 })
    );
  }

  // ==========================================
  // جلب سجل نشاط المستخدم
  // ==========================================

  const activities = await UserActivity.find({
    user: userId,
  })
    .sort({ createdAt: -1 });

  // ==========================================
  // Response
  // ==========================================

  return successresponse(
    res,
    "تم جلب المستخدم وسجل النشاط بنجاح",
    200,
    {
      user,
      activities,
    }
  );
});
// ================================
// 📊 Analytics
// ================================
// 📊 Advanced Analytics
export const getAnalytics = asyncHandelr(async (req, res, next) => {
  const { period = "month" } = req.query;

  const allowedPeriods = ["day", "week", "month", "year"];

  if (!allowedPeriods.includes(period)) {
    return next(new Error("الفترة الزمنية غير صحيحة"));
  }

  // ==========================================
  // 🕐 Current Period
  // ==========================================

  const now = new Date();

  let startDate;

  switch (period) {
    case "day":
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;

    case "week": {
      startDate = new Date(now);

      const day = startDate.getDay();
      const diff = day === 0 ? 6 : day - 1;

      startDate.setDate(startDate.getDate() - diff);
      startDate.setHours(0, 0, 0, 0);

      break;
    }

    case "month":
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
      break;

    case "year":
      startDate = new Date(
        now.getFullYear(),
        0,
        1
      );
      break;
  }

  const endDate = new Date(now);

  // ==========================================
  // 🕐 Previous Period
  // ==========================================

  let previousStartDate;
  let previousEndDate;

  if (period === "day") {
    previousStartDate = new Date(startDate);
    previousStartDate.setDate(
      previousStartDate.getDate() - 1
    );

    previousEndDate = new Date(startDate);
  }

  else if (period === "week") {
    previousStartDate = new Date(startDate);
    previousStartDate.setDate(
      previousStartDate.getDate() - 7
    );

    previousEndDate = new Date(startDate);
  }

  else if (period === "month") {
    previousStartDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() - 1,
      1
    );

    previousEndDate = new Date(startDate);
  }

  else if (period === "year") {
    previousStartDate = new Date(
      startDate.getFullYear() - 1,
      0,
      1
    );

    previousEndDate = new Date(startDate);
  }

  // ==========================================
  // 📈 Growth Helper
  // ==========================================

  const calculateGrowth = (current, previous) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }

    return Number(
      (((current - previous) / previous) * 100).toFixed(2)
    );
  };

  // ==========================================
  // 👥 Current Users
  // ==========================================

  const currentUsers = await Usermodel.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },

    deleted: {
      $ne: true,
    },
  }).select(
    "country track plan createdAt"
  );

  const totalUsers = currentUsers.length;

  // ==========================================
  // 👥 Previous Users
  // ==========================================

  const previousUsers =
    await Usermodel.countDocuments({
      createdAt: {
        $gte: previousStartDate,
        $lt: previousEndDate,
      },

      deleted: {
        $ne: true,
      },
    });

  // ==========================================
  // 💎 VIP
  // ==========================================

  const vipUsers = currentUsers.filter(
    (user) => user.plan === "vip"
  ).length;

  const previousVipUsers =
    await Usermodel.countDocuments({
      createdAt: {
        $gte: previousStartDate,
        $lt: previousEndDate,
      },

      plan: "vip",

      deleted: {
        $ne: true,
      },
    });

  // ==========================================
  // 🆓 Free
  // ==========================================

  const freeUsers = currentUsers.filter(
    (user) => user.plan === "free"
  ).length;

  // ==========================================
  // 💰 Paid
  // ==========================================

  const paidUsers = currentUsers.filter(
    (user) =>
      user.plan === "basic" ||
      user.plan === "vip"
  ).length;

  // ==========================================
  // 🎯 Tracks
  // ==========================================

  const trackMap = {};

  currentUsers.forEach((user) => {
    if (!user.track) return;

    trackMap[user.track] =
      (trackMap[user.track] || 0) + 1;
  });

  const tracks = Object.entries(trackMap)
    .map(([name, count]) => ({
      name,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const tracksTotal = tracks.reduce(
    (sum, item) => sum + item.count,
    0
  );

  tracks.forEach((item) => {
    item.value = tracksTotal
      ? Number(
          ((item.count / tracksTotal) * 100).toFixed(2)
        )
      : 0;
  });

  // ==========================================
  // 🌍 Countries
  // ==========================================

  const countryMap = {};

  currentUsers.forEach((user) => {
    if (!user.country) return;

    countryMap[user.country] =
      (countryMap[user.country] || 0) + 1;
  });

  const countries = Object.entries(countryMap)
    .map(([country, users]) => ({
      country,
      users,
    }))
    .sort((a, b) => b.users - a.users)
    .slice(0, 10);

  // ==========================================
  // 📁 Current Projects
  // ==========================================

  const currentProjectStats =
    await projects.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },

          status: {
            $ne: "cancelled",
          },
        },
      },

      {
        $group: {
          _id: null,

          totalProjects: {
            $sum: 1,
          },

          totalAmount: {
            $sum: {
              $ifNull: ["$amount", 0],
            },
          },

          completedProjects: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", "completed"],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

  const currentProjectData =
    currentProjectStats[0] || {
      totalProjects: 0,
      totalAmount: 0,
      completedProjects: 0,
    };

  // ==========================================
  // 📁 Previous Projects
  // ==========================================

  const previousProjectStats =
    await projects.aggregate([
      {
        $match: {
          createdAt: {
            $gte: previousStartDate,
            $lt: previousEndDate,
          },

          status: {
            $ne: "cancelled",
          },
        },
      },

      {
        $group: {
          _id: null,

          totalProjects: {
            $sum: 1,
          },

          totalAmount: {
            $sum: {
              $ifNull: ["$amount", 0],
            },
          },

          completedProjects: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", "completed"],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

  const previousProjectData =
    previousProjectStats[0] || {
      totalProjects: 0,
      totalAmount: 0,
      completedProjects: 0,
    };

  // ==========================================
  // 💵 Average Project Value
  // ==========================================

  const currentAverage =
    currentProjectData.totalProjects > 0
      ? currentProjectData.totalAmount /
        currentProjectData.totalProjects
      : 0;

  const previousAverage =
    previousProjectData.totalProjects > 0
      ? previousProjectData.totalAmount /
        previousProjectData.totalProjects
      : 0;

  // ==========================================
  // 💻 Top Technologies
  // projects.skills
  // ==========================================

  const currentTechnologies =
    await projects.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },

          status: {
            $ne: "cancelled",
          },
        },
      },

      {
        $unwind: "$skills",
      },

      {
        $group: {
          _id: "$skills",

          projects: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          projects: -1,
        },
      },

      {
        $limit: 10,
      },
    ]);

  // ==========================================
  // 💻 Previous Technologies
  // ==========================================

  const previousTechnologies =
    await projects.aggregate([
      {
        $match: {
          createdAt: {
            $gte: previousStartDate,
            $lt: previousEndDate,
          },

          status: {
            $ne: "cancelled",
          },
        },
      },

      {
        $unwind: "$skills",
      },

      {
        $group: {
          _id: "$skills",

          projects: {
            $sum: 1,
          },
        },
      },
    ]);

  const previousTechMap = {};

  previousTechnologies.forEach((item) => {
    previousTechMap[item._id] =
      item.projects;
  });

  const technologies =
    currentTechnologies.map((item) => ({
      tech: item._id,

      projects: item.projects,

      growth: calculateGrowth(
        item.projects,
        previousTechMap[item._id] || 0
      ),
    }));

  // ==========================================
  // 📈 Current Active Users
  // ==========================================

  const currentActiveUsers =
    await UserActivity.distinct(
      "user",
      {
        type: "login",

        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      }
    );

  // ==========================================
  // 📈 Previous Active Users
  // ==========================================

  const previousActiveUsers =
    await UserActivity.distinct(
      "user",
      {
        type: "login",

        createdAt: {
          $gte: previousStartDate,
          $lt: previousEndDate,
        },
      }
    );

  // ==========================================
  // 📊 Retention - آخر 6 شهور
  // ==========================================

  const retention = [];

  for (let i = 5; i >= 0; i--) {
    const cohortStart = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1
    );

    const cohortEnd = new Date(
      now.getFullYear(),
      now.getMonth() - i + 1,
      1
    );

    // المستخدمين الذين سجلوا في الشهر
    const cohortUsers =
      await Usermodel.find({
        createdAt: {
          $gte: cohortStart,
          $lt: cohortEnd,
        },

        deleted: {
          $ne: true,
        },
      }).select("_id");

    const cohortIds =
      cohortUsers.map(
        (user) => user._id
      );

    let rate = 0;

    if (cohortIds.length > 0) {
      // المستخدمين الذين سجلوا + عملوا Login
      // داخل نفس الشهر
      const activeUsers =
        await UserActivity.distinct(
          "user",
          {
            user: {
              $in: cohortIds,
            },

            type: "login",

            createdAt: {
              $gte: cohortStart,
              $lt: cohortEnd,
            },
          }
        );

      rate =
        (activeUsers.length /
          cohortIds.length) *
        100;
    }

    retention.push({
      month: cohortStart.toLocaleDateString(
        "ar-EG",
        {
          month: "long",
        }
      ),

      rate: Number(
        rate.toFixed(2)
      ),
    });
  }

  // ==========================================
  // 🎯 Conversion
  // ==========================================

  const registered = totalUsers;

  const paid = paidUsers;

  const conversionRate =
    registered > 0
      ? (paid / registered) * 100
      : 0;

  // ==========================================
  // 📤 Final Response
  // ==========================================

  return successresponse(
    res,
    "تم جلب التحليلات بنجاح",
    200,
    {
      period,

      dateRange: {
        start: startDate,
        end: endDate,
      },

      // ========================================
      // Stats
      // ========================================

      stats: {
        averageProjectValue:
          Number(
            currentAverage.toFixed(2)
          ),

        averageProjectValueGrowth:
          calculateGrowth(
            currentAverage,
            previousAverage
          ),

        completedProjects:
          currentProjectData.completedProjects,

        completedProjectsGrowth:
          calculateGrowth(
            currentProjectData.completedProjects,
            previousProjectData.completedProjects
          ),

        totalProjects:
          currentProjectData.totalProjects,

        totalUsers,

        usersGrowth:
          calculateGrowth(
            totalUsers,
            previousUsers
          ),

        activeUsers:
          currentActiveUsers.length,

        activeUsersGrowth:
          calculateGrowth(
            currentActiveUsers.length,
            previousActiveUsers.length
          ),

        vipUsers,

        vipUsersGrowth:
          calculateGrowth(
            vipUsers,
            previousVipUsers
          ),

        freeUsers,

        paidUsers,

        conversionRate:
          Number(
            conversionRate.toFixed(2)
          ),
      },

      // ========================================
      // Tracks
      // ========================================

      tracks,

      // ========================================
      // Countries
      // ========================================

      countries,

      // ========================================
      // Conversion
      // ========================================

      conversion: {
        registered,
        free: freeUsers,
        paid,
        vip: vipUsers,
      },

      // ========================================
      // Technologies
      // ========================================

      technologies,

      // ========================================
      // Retention
      // ========================================

      retention,
    }
  );
});

//جلب جميع المشتريع
export const getProjects = asyncHandelr(async (req, res, next) => {
  const projectsData = await projects
    .find()
    .populate("developertaked", "username profileImage").populate("owner", "username profileImage")
    .sort({ createdAt: -1 });

  const data =  await Promise.all( projectsData.map(async(project) => {
    
 const cash = await proposal.findOne({
        project: project._id,
        status: "accepted"
      });
    return{
    id: project._id,
    name: project.projectName,

    developerName: project.developertaked?.username || "لم يتم اختيار مبرمج بعد",
    developerAvatar:
      project.developertaked?.profileImage ||
      "https://ui-avatars.com/api/?name=Developer",
         ownerAvatar:
      project.owner.profileImage ,
          ownerName: project.owner.username,
    developerId: project.developertaked?._id || null,
datastart: "2/12/2027",
expecteddata: "5/5/2029",
    status: project.status,
    progress: project.progress,

    startDate: project.startDate,
    dueDate: project.dueDate,

    amount: Number(cash?.budget || 0),
    paidAmount: Number(project.paidAmount || 0),
    remainingAmount:
      Number(cash?.budget || 0) - Number(project.paidAmount || 0),

    description: project.Description,

    lastUpdate: project.updatedAt,

    messages: 0,
    unreadMessages: 0,
  }}));
  return successresponse(
    res,
    "تم جلب المشاريع بنجاح",
    200,
    {
      projects: data,
    }
  );
});


//جلب مشروع معين من خلال الايدي
export const getProject = asyncHandelr(async (req, res, next) => {
    const { id } = req.params;

    const project = await projects.findById(id)
        .populate("developertaked", "username profileImage")
        .populate("owner", "username profileImage");

    if (!project) {
        return next(new Error("المشروع غير موجود"));
    }

    const [cash, task, chatData, activity] = await Promise.all([
        proposal.findOne({
            project: project._id,
            status: "accepted",
        }),

        tasks.find({
            project: project._id,
        }),

        chat.findOne({
            project: project._id,
        }).select("_id"),

        ProjectActivity.find({
            project: project._id,
        }).sort({ createdAt: -1 }),
    ]);

    const lastMessage = await Message.find({
        chat: chatData?._id,
    })
        .sort({ createdAt: 1 })
        .populate("sender", "username profileImage");

    const data = {
        id: project._id,
        name: project.projectName,

        tasks: task,
        message: lastMessage,
        activitys: activity,

        developerName:
            project.developertaked?.username ||
            "لم يتم اختيار مبرمج بعد",

        developerAvatar:
            project.developertaked?.profileImage ||
            "https://ui-avatars.com/api/?name=Developer",

        ownerAvatar:
            project.owner?.profileImage || "",

        ownerName:
            project.owner?.username || "",

        developerId:
            project.developertaked?._id || null,

        status: project.status,
        progress: project.progress,

        startDate: project.startDate,
        dueDate: project.dueDate,

        amount: Number(cash?.budget || 0),

        paidAmount:
            Number(project.paidAmount || 0),

        remainingAmount:
            Number(cash?.budget || 0) -
            Number(project.paidAmount || 0),

        description: project.Description,

        lastUpdate: project.updatedAt,

        messages: 0,
        unreadMessages: 0,
    };

    return successresponse(
        res,
        "تم جلب المشروع بنجاح",
        200,
        {
            project: data,
        }
    );
});

// ==========================================
// 🛒 Marketplace
// ==========================================

export const getStoreProducts = asyncHandelr(async (req, res, next) => {
  const {
    page = 1,
    limit = 6,
    search = "",
    status = "all",
  } = req.query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  // ==========================================
  // 🔎 Filter
  // ==========================================

  const filter = {};

  // البحث باسم المشروع
  if (search.trim()) {
    filter.projectName = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  // حالة المنتج
  if (status === "active") {
    filter.public = "public";
  }

  if (status === "suspended") {
    filter.public = "suspended";
  }

  if (status === "private") {
    filter.public = "private";
  }

  // ==========================================
  // 📦 جلب المنتجات
  // ==========================================

  const [productsData, totalProducts] = await Promise.all([
    storeModel
      .find(filter)
      .populate("owner", "username profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber),

    storeModel.countDocuments(filter),
  ]);

  // ==========================================
  // 📊 تجهيز البيانات
  // ==========================================

  const products = productsData.map((product) => {
    const prices = [
      product.basic?.price,
      product.pro?.price,
      product.enterprise?.price,
    ].filter(
      (price) =>
        typeof price === "number" &&
        price > 0
    );

    const price =
      prices.length > 0
        ? Math.min(...prices)
        : 0;

    return {
      id: product._id,

      title: product.projectName,

      developer:
        product.owner?.username ||
        "غير معروف",

      developerId:
        product.owner?._id ||
        null,

      developerAvatar:
        product.owner?.profileImage ||
        "",

      sales:
        Number(product.salesCount || 0),

      revenue:
        Number(product.totalRevenue || 0),

      rating:
        Number(product.rating || 0),

      reviewsCount:
        Number(product.reviewsCount || 0),

      // الحالة الأصلية
      public:
        product.public,

      // الحالة بالعربي
      status:
        product.public === "public"
          ? "نشط"
          : product.public === "suspended"
          ? "معلق"
          : "خاص",

      tech:
        product.technologies?.[0] ||
        "غير محدد",

      technologies:
        product.technologies || [],

      price,

      category:
        product.category,

      shortDescription:
        product.shortDescription,

      views:
        Number(product.views || 0),

      images:
        product.images || [],

      videoUrl:
        product.videoUrl || "",

      demoUrl:
        product.demoUrl || "",

      githubUrl:
        product.githubUrl || "",

      createdAt:
        product.createdAt,

      updatedAt:
        product.updatedAt,
    };
  });

  // ==========================================
  // 📄 Pagination
  // ==========================================

  const totalPages =
    Math.ceil(
      totalProducts / limitNumber
    );

  return successresponse(
    res,
    "تم جلب منتجات المتجر بنجاح",
    200,
    {
      products,

      pagination: {
        page: pageNumber,
        limit: limitNumber,

        total:
          totalProducts,

        totalPages,

        hasNextPage:
          pageNumber < totalPages,

        hasPrevPage:
          pageNumber > 1,
      },
    }
  );
});

// ==========================================
// 📊 إحصائيات المتجر
// ==========================================

//جلب إحصائيات المتجر
export const getStoreStats = asyncHandelr(
  async (req, res, next) => {

    const stats =
      await storeModel.aggregate([
        {
          $group: {
            _id: null,

            totalProducts: {
              $sum: 1,
            },

            totalSales: {
              $sum: {
                $ifNull: [
                  "$salesCount",
                  0,
                ],
              },
            },

            totalRevenue: {
              $sum: {
                $ifNull: [
                  "$totalRevenue",
                  0,
                ],
              },
            },

            averageRating: {
              $avg: {
                $ifNull: [
                  "$rating",
                  0,
                ],
              },
            },
          },
        },
      ]);

    const data =
      stats[0] || {
        totalProducts: 0,
        totalSales: 0,
        totalRevenue: 0,
        averageRating: 0,
      };

    return successresponse(
      res,
      "تم جلب إحصائيات المتجر بنجاح",
      200,
      {
        stats: {
          totalProducts:
            data.totalProducts,

          totalSales:
            data.totalSales,

          totalRevenue:
            Number(
              data.totalRevenue || 0
            ),

          averageRating:
            Number(
              (
                data.averageRating ||
                0
              ).toFixed(1)
            ),
        },
      }
    );
  }
);




// ==========================================
// 🚫 تعليق / تفعيل منتج
// ==========================================

export const toggleStoreProduct = asyncHandelr(
  async (req, res, next) => {
    const { id } = req.params;

    const product = await storeModel.findById(id);

    if (!product) {
      return next(
        new Error("المنتج غير موجود")
      );
    }

    // public -> suspended
    // suspended -> public
    // private -> public
    if (product.public === "public") {
      product.public = "suspended";
    } else {
      product.public = "public";
    }

    await product.save();

    return successresponse(
      res,
      product.public === "public"
        ? "تم تفعيل المنتج بنجاح"
        : "تم تعليق المنتج بنجاح",
      200,
      {
        product: {
          id: product._id,
          public: product.public,
          status:
            product.public === "public"
              ? "نشط"
              : product.public === "suspended"
              ? "معلق"
              : "خاص",
        },
      }
    );
  }
);



// ==========================================
// 🗑️ حذف منتج
// ==========================================
export const deleteStoreProject = asyncHandelr(
  async (req, res, next) => {
    const { id } = req.params;

    // ==========================================
    // 🔎 جلب المشروع
    // ==========================================

    const project = await storeModel.findById(id);

    if (!project) {
      return next(
        new Error("المشروع غير موجود", {
          cause: 404,
        })
      );
    }

    // ==========================================
    // 🖼️ حذف صور المشروع من Cloudinary
    // ==========================================

    if (project.images?.length > 0) {
      for (const imageUrl of project.images) {
        try {
          if (!imageUrl) continue;

          const publicId = getCloudinaryPublicId(imageUrl);

          if (publicId) {
            await cloudinary.uploader.destroy(publicId, {
              resource_type: "image",
            });

            console.log(
              "✅ تم حذف الصورة من Cloudinary:",
              publicId
            );
          }
        } catch (error) {
          console.error(
            "❌ خطأ في حذف صورة Cloudinary:",
            error
          );
        }
      }
    }

    // ==========================================
    // 🎥 حذف الفيديو من R2
    // ==========================================

    if (project.videoUrl) {
      try {
        const videoKey = getR2Key(project.videoUrl);

        if (videoKey) {
          await deleteFromR2(videoKey);

          console.log(
            "✅ تم حذف الفيديو من R2:",
            videoKey
          );
        }
      } catch (error) {
        console.error(
          "❌ خطأ في حذف الفيديو:",
          error
        );
      }
    }

    // ==========================================
    // 📦 حذف ملف التحميل من R2
    // ==========================================

    if (project.downloadurl) {
      try {
        const downloadKey = getR2Key(
          project.downloadurl
        );

        if (downloadKey) {
          await deleteFromR2(downloadKey);

          console.log(
            "✅ تم حذف ملف التحميل من R2:",
            downloadKey
          );
        }
      } catch (error) {
        console.error(
          "❌ خطأ في حذف ملف التحميل:",
          error
        );
      }
    }

    // ==========================================
    // 🗑️ حذف المشروع من MongoDB
    // ==========================================

    await storeModel.findByIdAndDelete(id);

    // ==========================================
    // ✅ Response
    // ==========================================

    return successresponse(
      res,
      "تم حذف المشروع وجميع ملفاته بنجاح",
      200,
      {
        projectId: id,
      }
    );
  }
);

// 📊 Marketplace Sales
export const getMarketplaceSales = asyncHandelr(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    search = "",
  } = req.query;

  const currentPage = Math.max(Number(page), 1);
  const currentLimit = Math.min(Math.max(Number(limit), 1), 100);
  const skip = (currentPage - 1) * currentLimit;

  // ==========================================
  // 🔎 Search Regex
  // ==========================================

  const searchRegex = search
    ? new RegExp(search.trim(), "i")
    : null;

  // ==========================================
  // 📦 Base Match
  // ==========================================

  const match = {
    status: "paid",
  };

  // ==========================================
  // 📊 Statistics
  // ==========================================

  const statsResult = await Order.aggregate([
    {
      $match: match,
    },

    {
      $group: {
        _id: null,

        totalSales: {
          $sum: 1,
        },

        totalRevenue: {
          $sum: "$amount",
        },
      },
    },
  ]);

  const statsData = statsResult[0] || {
    totalSales: 0,
    totalRevenue: 0,
  };

  // ==========================================
  // ⭐ Average Rating
  // ==========================================

  const ratingResult = await Order.aggregate([
    {
      $match: match,
    },

    {
      $lookup: {
        from: "stores",
        localField: "project",
        foreignField: "_id",
        as: "store",
      },
    },

    {
      $unwind: "$store",
    },

    {
      $match: {
        "store.rating": {
          $gt: 0,
        },
      },
    },

    {
      $group: {
        _id: null,

        averageRating: {
          $avg: "$store.rating",
        },
      },
    },
  ]);

  const averageRating =
    ratingResult[0]?.averageRating || 0;

  // ==========================================
  // 👨‍💻 Top Sellers
  // ==========================================

  const topSellers = await Order.aggregate([
    {
      $match: match,
    },

    {
      $group: {
        _id: "$developer",

        sales: {
          $sum: 1,
        },

        revenue: {
          $sum: "$amount",
        },
      },
    },

    {
      $sort: {
        revenue: -1,
      },
    },

    {
      $limit: 3,
    },

    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "seller",
      },
    },

    {
      $unwind: {
        path: "$seller",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $project: {
        _id: 0,

        name: {
          $ifNull: [
            "$seller.username",
            "مستخدم",
          ],
        },

        sales: 1,

        revenue: 1,

        avatar: {
          $substrCP: [
            {
              $ifNull: [
                "$seller.username",
                "م",
              ],
            },
            0,
            1,
          ],
        },
      },
    },
  ]);

  // ==========================================
  // 🔥 Top Products
  // ==========================================

  const topProducts = await Order.aggregate([
    {
      $match: match,
    },

    {
      $group: {
        _id: "$project",

        sales: {
          $sum: 1,
        },

        revenue: {
          $sum: "$amount",
        },
      },
    },

    {
      $sort: {
        sales: -1,
      },
    },

    {
      $limit: 3,
    },

    {
      $lookup: {
        from: "stores",
        localField: "_id",
        foreignField: "_id",
        as: "store",
      },
    },

    {
      $unwind: {
        path: "$store",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $project: {
        _id: 0,

        name: {
          $ifNull: [
            "$store.projectName",
            "مشروع",
          ],
        },

        sales: 1,

        revenue: 1,
      },
    },
  ]);

  // ==========================================
  // 🧾 Sales Pipeline
  // ==========================================

  const salesPipeline = [
    {
      $match: match,
    },

    // 👨‍💻 Seller
    {
      $lookup: {
        from: "users",
        localField: "developer",
        foreignField: "_id",
        as: "seller",
      },
    },

    {
      $unwind: {
        path: "$seller",
        preserveNullAndEmptyArrays: true,
      },
    },

    // 👤 Buyer
    {
      $lookup: {
        from: "users",
        localField: "buyer",
        foreignField: "_id",
        as: "buyer",
      },
    },

    {
      $unwind: {
        path: "$buyer",
        preserveNullAndEmptyArrays: true,
      },
    },

    // 🛒 Store
    {
      $lookup: {
        from: "stores",
        localField: "project",
        foreignField: "_id",
        as: "store",
      },
    },

    {
      $unwind: {
        path: "$store",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  // ==========================================
  // 🔎 Search
  // ==========================================

  if (searchRegex) {
    salesPipeline.push({
      $match: {
        $or: [
          {
            "seller.username": searchRegex,
          },

          {
            "buyer.username": searchRegex,
          },

          {
            "store.projectName": searchRegex,
          },
        ],
      },
    });
  }

  // ==========================================
  // 📊 Total Search Results
  // ==========================================

  const countResult = await Order.aggregate([
    ...salesPipeline,

    {
      $count: "total",
    },
  ]);

  const total =
    countResult[0]?.total || 0;

  // ==========================================
  // 📄 Pagination
  // ==========================================

  salesPipeline.push(
    {
      $sort: {
        createdAt: -1,
      },
    },

    {
      $skip: skip,
    },

    {
      $limit: currentLimit,
    },

    {
      $project: {
        _id: 0,

        id: "$_id",

        project: {
          $ifNull: [
            "$store.projectName",
            "مشروع",
          ],
        },

        seller: {
          $ifNull: [
            "$seller.username",
            "مستخدم",
          ],
        },

        buyer: {
          $ifNull: [
            "$buyer.username",
            "مستخدم",
          ],
        },

        package: 1,

        price: "$amount",

        // 💰 العمولة حاليا صفر
        commission: {
          $literal: 0,
        },

        date: "$createdAt",
      },
    }
  );

  const sales =
    await Order.aggregate(salesPipeline);

  // ==========================================
  // 📤 Response
  // ==========================================

  return successresponse(
    res,
    "تم جلب مبيعات المتجر بنجاح",
    200,
    {
      sales,

      stats: {
        totalSales: statsData.totalSales,

        totalRevenue: statsData.totalRevenue,

        totalCommission: 0,

        averageRating: Number(
          averageRating.toFixed(1)
        ),
      },

      topSellers,

      topProducts,

      pagination: {
        page: currentPage,

        limit: currentLimit,

        total,

        totalPages: Math.ceil(
          total / currentLimit
        ),
      },
    }
  );
});

// ==========================================
// 📊 Admin Dashboard
// ==========================================

export const getDashboard = asyncHandelr(async (req, res, next) => {

  const now = new Date();

  // ==========================================
  // 📅 DATES
  // ==========================================

  // بداية الشهر الحالي
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  // بداية الشهر السابق
  const startOfPreviousMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  );

  // ==========================================
  // 👥 USERS
  // 🚫 استبعاد الأدمن
  // ==========================================

  const totalUsers = await Usermodel.countDocuments({
    userType: { $ne: "admin" },
    deleted: false,
  });

  // المستخدمين المسجلين هذا الشهر
  const currentMonthUsers = await Usermodel.countDocuments({
    userType: { $ne: "admin" },
    deleted: false,
    createdAt: {
      $gte: startOfMonth,
    },
  });

  // المستخدمين المسجلين الشهر السابق
  const previousMonthUsers = await Usermodel.countDocuments({
    userType: { $ne: "admin" },
    deleted: false,
    createdAt: {
      $gte: startOfPreviousMonth,
      $lt: startOfMonth,
    },
  });

  let usersChange = 0;

  if (previousMonthUsers > 0) {
    usersChange =
      ((currentMonthUsers - previousMonthUsers) /
        previousMonthUsers) *
      100;
  }

  // ==========================================
  // 📁 ACTIVE PROJECTS
  // ==========================================

  const activeProjects = await projects.countDocuments({
    status: {
      $in: [
        "pending",
        "in_progress",
        "review",
      ],
    },
  });

  const currentMonthProjects = await projects.countDocuments({
    createdAt: {
      $gte: startOfMonth,
    },
  });

  const previousMonthProjects = await projects.countDocuments({
    createdAt: {
      $gte: startOfPreviousMonth,
      $lt: startOfMonth,
    },
  });

  let projectsChange = 0;

  if (previousMonthProjects > 0) {
    projectsChange =
      ((currentMonthProjects - previousMonthProjects) /
        previousMonthProjects) *
      100;
  }

  // ==========================================
  // 💰 MONTHLY REVENUE
  // ==========================================

  const monthlyRevenueResult = await Order.aggregate([
    {
      $match: {
        status: "paid",
        createdAt: {
          $gte: startOfMonth,
        },
      },
    },

    {
      $group: {
        _id: null,

        revenue: {
          $sum: "$amount",
        },
      },
    },
  ]);

  const monthlyRevenue =
    monthlyRevenueResult[0]?.revenue || 0;

  // ==========================================
  // 💰 PREVIOUS MONTH REVENUE
  // ==========================================

  const previousMonthRevenueResult = await Order.aggregate([
    {
      $match: {
        status: "paid",
        createdAt: {
          $gte: startOfPreviousMonth,
          $lt: startOfMonth,
        },
      },
    },

    {
      $group: {
        _id: null,

        revenue: {
          $sum: "$amount",
        },
      },
    },
  ]);

  const previousMonthRevenue =
    previousMonthRevenueResult[0]?.revenue || 0;

  let revenueChange = 0;

  if (previousMonthRevenue > 0) {
    revenueChange =
      ((monthlyRevenue - previousMonthRevenue) /
        previousMonthRevenue) *
      100;
  }

  // ==========================================
  // 📈 REVENUE CHART
  // آخر 12 شهر
  // ==========================================

  const revenueData = await Order.aggregate([
    {
      $match: {
        status: "paid",

        createdAt: {
          $gte: new Date(
            now.getFullYear(),
            now.getMonth() - 11,
            1
          ),
        },
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

        revenue: {
          $sum: "$amount",
        },
      },
    },

    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);

  const arabicMonths = [
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

  const formattedRevenueData = revenueData.map(
    (item) => ({
      month:
        arabicMonths[item._id.month - 1],

      revenue: item.revenue,
    })
  );

  // ==========================================
  // 👥 USERS CHART
  // آخر 30 يوم
  // 🚫 استبعاد الأدمن
  // ==========================================

  const thirtyDaysAgo = new Date();

  thirtyDaysAgo.setDate(
    thirtyDaysAgo.getDate() - 29
  );

  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const usersData = await Usermodel.aggregate([
    {
      $match: {
        // 🚫 لا نحسب الأدمن
        userType: { $ne: "admin" },

        // لا نحسب المستخدم المحذوف
        deleted: false,

        createdAt: {
          $gte: thirtyDaysAgo,
        },
      },
    },

    {
      $group: {
        _id: {
          $dayOfMonth: "$createdAt",
        },

        users: {
          $sum: 1,
        },
      },
    },

    {
      $sort: {
        "_id": 1,
      },
    },
  ]);

  const formattedUsersData = usersData.map(
    (item) => ({
      day: String(item._id),
      users: item.users,
    })
  );

  // ==========================================
  // 🕐 RECENT ACTIVITY
  // 🚫 استبعاد Activity الخاصة بالأدمن
  // ==========================================

  const recentActivity = await UserActivity.find()
    .sort({
      createdAt: -1,
    })
    .limit(10)
    .populate({
      path: "user",
      select: "username profileImage userType",
    })
    .lean();

  // نشيل أي Activity صاحبها Admin
  const filteredRecentActivity =
    recentActivity.filter(
      (activity) =>
        activity.user &&
        activity.user.userType !== "admin"
    ).slice(0, 5);

  // ==========================================
  // ⚠️ ATTENTION ITEMS
  // ==========================================

  const reports = await reportModel.find({
    status: {
      $in: [
        "pending",
        "open",
      ],
    },
  })
    .sort({
      createdAt: -1,
    })
    .limit(5)
    .populate({
      path: "user",
      select: "username userType",
    })
    .lean();

  // ==========================================
  // 📤 RESPONSE
  // ==========================================

  return successresponse(
    res,
    "تم جلب بيانات لوحة التحكم بنجاح",
    200,
    {
      stats: {
        totalUsers,

        activeProjects,

        monthlyRevenue,

        openDisputes: reports.length,

        usersChange: Number(
          usersChange.toFixed(1)
        ),

        projectsChange: Number(
          projectsChange.toFixed(1)
        ),

        revenueChange: Number(
          revenueChange.toFixed(1)
        ),

        disputesChange: 0,
      },

      revenueData:
        formattedRevenueData,

      usersData:
        formattedUsersData,

      recentActivity:
        filteredRecentActivity,

      attentionItems:
        reports,
    }
  );
});
//ارسال اشعارات
export const sendBroadcastNotification = asyncHandelr(
  async (req, res, next) => {

    const {
      title,
      message,
      audience = "all",
      schedule = "now",
      scheduledDate,
    } = req.body;

    // ==========================================
    // Validation
    // ==========================================

    if (!title?.trim()) {
      return next(
        new Error("عنوان الرسالة مطلوب", { cause: 400 })
      );
    }

    if (!message?.trim()) {
      return next(
        new Error("محتوى الرسالة مطلوب", { cause: 400 })
      );
    }

    const allowedAudiences = [
      "all",
      "developers",
      "clients",
      "elite",
    ];

    if (!allowedAudiences.includes(audience)) {
      return next(
        new Error("الفئة المستهدفة غير صحيحة", { cause: 400 })
      );
    }

    // ==========================================
    // حاليًا هنفعل الإرسال الفوري فقط
    // ==========================================

    if (schedule === "later") {
      return next(
        new Error(
          "الإرسال المجدول غير متاح حاليًا",
          { cause: 400 }
        )
      );
    }

    // ==========================================
    // تحديد المستخدمين
    // ==========================================

    const filter = {
      deleted: { $ne: true },
      isBlocked: { $ne: true },
    };

    // مبرمجين
    if (audience === "developers") {
      filter.userType = "developer";
    }

    // عملاء
    if (audience === "clients") {
      filter.userType = "client";
    }

    // Elite
    if (audience === "elite") {
      filter.plan = "vip";
    }

    // ==========================================
    // جلب المستخدمين
    // ==========================================

    const users = await Usermodel.find(filter)
      .select("_id");

    if (!users.length) {
      return next(
        new Error(
          "لا يوجد مستخدمين في هذه الفئة",
          { cause: 404 }
        )
      );
    }

    // ==========================================
    // إرسال الإشعارات
    // ==========================================

    let sentCount = 0;

    for (const user of users) {

      const notification = await createNotification({
        receiver: user._id,
        sender: null,

        type: "system",

        title: title.trim(),

        body: message.trim(),

        metadata: {
          broadcast: true,
          audience,
        },
      });

      if (notification) {
        sentCount++;
      }
    }

    // ==========================================
    // Response
    // ==========================================

    return successresponse(
      res,

      "تم إرسال الإشعار الجماعي بنجاح",

      200,

      {
        sentCount,
        totalUsers: users.length,
        audience,
        title,
        message,
      }
    );
  }
);

export const sendNotificationToUser = asyncHandelr(
  async (req, res, next) => {

    const {
      userId,
      title,
      message,
    } = req.body;

    // ==========================================
    // Validation
    // ==========================================

    if (!userId) {
      return next(
        new Error("معرف المستخدم مطلوب", { cause: 400 })
      );
    }

    if (!title?.trim()) {
      return next(
        new Error("عنوان الرسالة مطلوب", { cause: 400 })
      );
    }

    if (!message?.trim()) {
      return next(
        new Error("محتوى الرسالة مطلوب", { cause: 400 })
      );
    }

    // ==========================================
    // البحث عن المستخدم
    // ==========================================

    const user = await Usermodel.findOne({
      _id: userId,
      deleted: { $ne: true },
      isBlocked: { $ne: true },
    }).select("_id username email");

    if (!user) {
      return next(
        new Error("المستخدم غير موجود أو محظور", { cause: 404 })
      );
    }

    // ==========================================
    // إنشاء الإشعار
    // ==========================================

    const notification = await createNotification({
      receiver: user._id,
      sender: null,

      type: "system",

      title: title.trim(),

      body: message.trim(),

      metadata: {
        personal: true,
      },
    });

    if (!notification) {
      return next(
        new Error("فشل في إنشاء الإشعار", { cause: 500 })
      );
    }

    // ==========================================
    // Response
    // ==========================================

    return successresponse(
      res,
      "تم إرسال الإشعار للمستخدم بنجاح",
      200,
      {
        sentCount: 1,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
        notification,
      }
    );
  }
);

export const getAdminTeam = asyncHandelr(
  async (req, res, next) => {

    const admins = await Usermodel.find({
      userType: "admin",
     
    })
      .select("-password -emailotp")
      .sort({ createdAt: -1 });


    return successresponse(

      res,

      "تم جلب أعضاء الإدارة بنجاح",

      200,

      {
        admins
      }

    );

  }
);

export const getAdminAuditLog = asyncHandelr(
  async (req, res, next) => {

    const logs = await AdminActivity.find()

      .populate({
        path: "user",
        select: "username email accses userType"
      })

      .sort({ createdAt: -1 });


    return successresponse(

      res,

      "تم جلب سجل العمليات بنجاح",

      200,

      {
        logs
      }

    );

  }
);

export const createAdmin = asyncHandelr(
  async (req, res, next) => {

    const {
      name,
      email,
      password,
      accses
    } = req.body;


    // ==============================
    // Validation
    // ==============================

    if (!name || !email || !password || !accses) {
      return next(
        new Error(
          "جميع الحقول مطلوبة",
          { cause: 400 }
        )
      );
    }


    // ==============================
    // Check Access
    // ==============================

    const allowedAccess = [
      "SuperAdmin",
      "FinanceAdmin",
      "ContentAdmin",
      "SupportAdmin"
    ];

    if (!allowedAccess.includes(accses)) {
      return next(
        new Error(
          "صلاحية الأدمن غير صحيحة",
          { cause: 400 }
        )
      );
    }


    // ==============================
    // Check Email
    // ==============================

    const user = await Usermodel.findOne({
      email
    });

    if (user) {
      return next(
        new Error(
          "الايميل موجود",
          { cause: 400 }
        )
      );
    }


    // ==============================
    // Hash Password
    // ==============================

    const hash = generatehash({
      planText: password
    });


    // ==============================
    // Create Admin
    // ==============================

    const admin = await Usermodel.create({

      username: name,

      email,

      password: hash,

      userType: "admin",

      accses,

      isConfirmed: true,

      isBlocked: false,

      deleted: false

    });


    // ==============================
    // Response
    // ==============================

    return successresponse(

      res,

      "تم إنشاء حساب الأدمن بنجاح",

      201,

      {
        admin: {
          _id: admin._id,
          username: admin.username,
          email: admin.email,
          userType: admin.userType,
          accses: admin.accses
        }
      }

    );

  }
);

export const deleteAdmin = asyncHandelr(
  async (req, res, next) => {

    const { userId } = req.params;

    // ==========================================
    // Validation
    // ==========================================

    if (!userId) {
      return next(
        new Error("معرف الأدمن مطلوب", {
          cause: 400
        })
      );
    }
if (req.user?.accses !== "SuperAdmin") {
      return next(
        new Error(
          "غير مسموح، هذه العملية متاحة للـ Super Admin فقط",
          { cause: 403 }
        )
      );
    }
    // ==========================================
    // Find Admin
    // ==========================================

    const admin = await Usermodel.findOne({
      _id: userId,
      userType: "admin",
      deleted: { $ne: true }
    });

    if (!admin) {
      return next(
        new Error("الأدمن غير موجود", {
          cause: 404
        })
      );
    }

    // ==========================================
    // Prevent deleting SuperAdmin
    // ==========================================

    if (admin.accses === "SuperAdmin") {
      return next(
        new Error(
          "لا يمكن حذف Super Admin",
          {
            cause: 403
          }
        )
      );
    }

    // ==========================================
    // Soft Delete
    // ==========================================

    admin.deleted = true;
    admin.deletedAt = new Date();

    await admin.save();

    // ==========================================
    // Admin Activity Log
    // ==========================================

    await logadminActivity({
      userId: req.user._id,

      action: "حذف أدمن",

      type: "profile",

      metadata: {
        deletedUserId: admin._id,
        deletedUsername: admin.username,
        deletedEmail: admin.email,
        deletedAccess: admin.accses,
           ip: req.user.accses === "SuperAdmin"? "الادمن لا يتم اخذ موقعه" : req.ip,
      }
    });

    // ==========================================
    // Response
    // ==========================================

    return successresponse(
      res,

      "تم حذف الأدمن بنجاح",

      200,

      {
        adminId: admin._id
      }
    );
  }
);

export const updateAdmin = asyncHandelr(
  async (req, res, next) => {

    // ==========================================
    // Params
    // ==========================================

    const { userId } = req.params;

    // ==========================================
    // Body
    // ==========================================

    const {
      name,
      email,
      password,
      accses,
      isBlocked,
      restore
    } = req.body;

    // ==========================================
    // Only SuperAdmin can update admins
    // ==========================================

    if (req.user?.accses !== "SuperAdmin") {
      return next(
        new Error(
          "غير مسموح، هذه العملية متاحة للـ Super Admin فقط",
          { cause: 403 }
        )
      );
    }

    // ==========================================
    // Check ID
    // ==========================================

    if (!userId) {
      return next(
        new Error(
          "معرف الأدمن مطلوب",
          { cause: 400 }
        )
      );
    }

    // ==========================================
    // Find Admin
    // ==========================================

    const admin = await Usermodel.findOne({
      _id: userId,
      userType: "admin"
    });

    if (!admin) {
      return next(
        new Error(
          "الأدمن غير موجود",
          { cause: 404 }
        )
      );
    }

    // ==========================================
    // Prevent modifying SuperAdmin
    // ==========================================

    if (admin.accses === "SuperAdmin") {
      return next(
        new Error(
          "لا يمكن تعديل حساب Super Admin",
          { cause: 403 }
        )
      );
    }

    // ==========================================
    // Restore Deleted Admin
    // ==========================================

    if (
      restore === true ||
      restore === "true"
    ) {

      // ------------------------------
      // Make sure admin is deleted
      // ------------------------------

      if (admin.deleted !== true) {
        return next(
          new Error(
            "الأدمن غير محذوف بالفعل",
            { cause: 400 }
          )
        );
      }

      // ------------------------------
      // Restore
      // ------------------------------

      admin.deleted = false;
      admin.deletedAt = null;

      await admin.save();

      // ------------------------------
      // Activity
      // ------------------------------

      await logadminActivity({
        userId: req.user._id,

        action: "استعادة أدمن",

        type: "profile",

        metadata: {
          restoredUserId: admin._id,
          restoredUsername: admin.username,
          restoredEmail: admin.email,
          restoredAccess: admin.accses,
          ip: req.user.accses === "SuperAdmin"? "الادمن لا يتم اخذ موقعه" : req.ip
        }
      });

      // ------------------------------
      // Response
      // ------------------------------

      return successresponse(
        res,

        "تم استعادة الأدمن بنجاح",

        200,

        {
          admin: {
            _id: admin._id,
            username: admin.username,
            email: admin.email,
            userType: admin.userType,
            accses: admin.accses,
            isBlocked: admin.isBlocked,
            deleted: admin.deleted,
            deletedAt: admin.deletedAt
          }
        }
      );
    }

    // ==========================================
    // Prevent Updating Deleted Admin
    // ==========================================

    if (admin.deleted === true) {
      return next(
        new Error(
          "الأدمن محذوف، قم باستعادته أولاً",
          { cause: 400 }
        )
      );
    }

    // ==========================================
    // Validate Access
    // ==========================================

    const allowedAccess = [
      "SuperAdmin",
      "FinanceAdmin",
      "ContentAdmin",
      "SupportAdmin"
    ];

    if (
      accses &&
      !allowedAccess.includes(accses)
    ) {
      return next(
        new Error(
          "صلاحية الأدمن غير صحيحة",
          { cause: 400 }
        )
      );
    }

    // ==========================================
    // Update Email
    // ==========================================

    if (email) {

      const newEmail =
        email.trim().toLowerCase();

      if (!newEmail) {
        return next(
          new Error(
            "البريد الإلكتروني غير صحيح",
            { cause: 400 }
          )
        );
      }

      // ------------------------------
      // Check if email changed
      // ------------------------------

      if (
        newEmail !==
        admin.email.toLowerCase()
      ) {

        const existingUser =
          await Usermodel.findOne({
            email: newEmail,
            _id: { $ne: userId }
          });

        if (existingUser) {
          return next(
            new Error(
              "الايميل مستخدم بالفعل",
              { cause: 400 }
            )
          );
        }

        admin.email = newEmail;
      }
    }

    // ==========================================
    // Update Name
    // ==========================================

    if (name?.trim()) {

      admin.username =
        name.trim();

    }

    // ==========================================
    // Update Access
    // ==========================================

    if (accses) {

      admin.accses =
        accses;

    }

    // ==========================================
    // Update Block Status
    // ==========================================

    if (
      typeof isBlocked === "boolean"
    ) {

      admin.isBlocked =
        isBlocked;

    }

    // ==========================================
    // Update Password
    // ==========================================

    if (password?.trim()) {

      if (password.length < 6) {
        return next(
          new Error(
            "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
            { cause: 400 }
          )
        );
      }

      admin.password =
        generatehash({
          planText: password
        });

    }

    // ==========================================
    // Save
    // ==========================================

    await admin.save();

    // ==========================================
    // Admin Activity
    // ==========================================

    await logadminActivity({

      userId: req.user._id,

      action: "تعديل بيانات أدمن",

      type: "profile",

      metadata: {

        updatedUserId:
          admin._id,

        updatedUsername:
          admin.username,

        updatedEmail:
          admin.email,

        updatedAccess:
          admin.accses,

        isBlocked:
          admin.isBlocked,

        ip:
          req.user.accses === "SuperAdmin"? "الادمن لا يتم اخذ موقعه" : req.ip

      }

    });

    // ==========================================
    // Response
    // ==========================================

    return successresponse(

      res,

      "تم تعديل بيانات الأدمن بنجاح",

      200,

      {

        admin: {

          _id:
            admin._id,

          username:
            admin.username,

          email:
            admin.email,

          userType:
            admin.userType,

          accses:
            admin.accses,

          isBlocked:
            admin.isBlocked,

          deleted:
            admin.deleted,

          deletedAt:
            admin.deletedAt

        }

      }

    );

  }
);



// =====================================================
// GET FINANCE DASHBOARD
// =====================================================
export const getFinanceDashboard =
  asyncHandelr(
    async (req, res, next) => {

      // =====================================================
      // QUERY
      // =====================================================

      const {
        period = "year",
        page = 1,
        limit = 10,
        search = "",
      } = req.query;


      // =====================================================
      // DATE FILTER
      // =====================================================

      const currentDate = new Date();

      let startDate;
      let endDate;

      if (period === "month") {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      } else {
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        endDate = new Date(currentDate.getFullYear() + 1, 0, 1);
      }


      // =====================================================
      // ALL PAYMENT REQUESTS IN RANGE (any status)
      // -> used for the transactions table / pagination, so the
      //    admin can still see pending/verifying/rejected rows.
      // =====================================================

      const allPayments = await PaymentRequest.find({
        createdAt: { $gte: startDate, $lt: endDate },
      })
        .populate("user", "username email")
        .populate("order")
        .sort({ createdAt: -1 })
        .lean();


      // =====================================================
      // PAID PAYMENT REQUESTS ONLY
      // -> used for summary totals, monthlyRevenue, revenueSources.
      //    Revenue must only count money that has actually been
      //    confirmed as paid, not pending/verifying/rejected requests.
      // =====================================================

      const paidPayments = allPayments.filter(
        (payment) => payment.status === "paid"
      );


      // =====================================================
      // TOTAL REVENUE
      // =====================================================

      let totalRevenue = 0;
      let subscriptionsRevenue = 0;
      let projectsRevenue = 0;
      let marketplaceRevenue = 0;
      let permanentHiringRevenue = 0;

      paidPayments.forEach((payment) => {
        const amount = Number(payment.amount) || 0;
        totalRevenue += amount;

        const type = String(payment.type || "").toLowerCase();

        if (type === "subscription" || type === "subscriptions") {
          subscriptionsRevenue += amount;
        } else if (type === "project" || type === "projects") {
          projectsRevenue += amount;
        } else if (
          type === "hiring" ||
          type === "permanenthiring" ||
          type === "permanent_hiring"
        ) {
          permanentHiringRevenue += amount;
        } else {
          marketplaceRevenue += amount;
        }
      });


      // =====================================================
      // MONTHLY REVENUE
      // =====================================================

      const monthNames = [
        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
      ];

      const monthlyRevenue = monthNames.map((month, index) => {
        let subscriptions = 0;
        let projects = 0;
        let marketplace = 0;
        let permanentHiring = 0;

        paidPayments.forEach((payment) => {
          const date = new Date(payment.createdAt);
          if (date.getMonth() !== index) return;

          const amount = Number(payment.amount) || 0;
          const type = String(payment.type || "").toLowerCase();

          if (type === "subscription" || type === "subscriptions") {
            subscriptions += amount;
          } else if (type === "project" || type === "projects") {
            projects += amount;
          } else if (
            type === "hiring" ||
            type === "permanenthiring" ||
            type === "permanent_hiring"
          ) {
            permanentHiring += amount;
          } else {
            marketplace += amount;
          }
        });

        return {
          month,
          subscriptions,
          projects,
          marketplace,
          total: subscriptions + projects + marketplace + permanentHiring,
        };
      });


      // =====================================================
      // REVENUE SOURCES
      // =====================================================

      const revenueSources = [
        { name: "اشتراكات", value: subscriptionsRevenue, color: "#6366f1" },
        { name: "عمولات مشاريع", value: projectsRevenue, color: "#10b981" },
        { name: "عمولات متجر", value: marketplaceRevenue, color: "#f59e0b" },
        { name: "توظيف دائم", value: permanentHiringRevenue, color: "#ec4899" },
      ];


      // =====================================================
      // SEARCH (over ALL payments, any status — this is the
      // transactions table, not the revenue numbers)
      // =====================================================

      let filteredPayments = allPayments;

      if (search && search.trim()) {
        const searchText = search.trim().toLowerCase();

        filteredPayments = allPayments.filter((payment) => {
          const username = payment.user?.username?.toLowerCase() || "";
          const email = payment.user?.email?.toLowerCase() || "";
          const reference = payment.reference?.toLowerCase() || "";
          const transactionId = payment.transactionId?.toLowerCase() || "";
          const type = payment.type?.toLowerCase() || "";
          const sender = payment.verification?.sender?.toLowerCase() || "";

          return (
            username.includes(searchText) ||
            email.includes(searchText) ||
            reference.includes(searchText) ||
            transactionId.includes(searchText) ||
            type.includes(searchText) ||
            sender.includes(searchText)
          );
        });
      }


      // =====================================================
      // PAGINATION
      // =====================================================

      const pageNumber = Math.max(Number(page) || 1, 1);
      const pageLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
      const totalTransactions = filteredPayments.length;
      const totalPages = Math.ceil(totalTransactions / pageLimit);
      const startIndex = (pageNumber - 1) * pageLimit;

      const paginatedPayments = filteredPayments.slice(
        startIndex,
        startIndex + pageLimit
      );


      // =====================================================
      // FORMAT TRANSACTIONS
      // =====================================================

      const transactions = paginatedPayments.map((payment) => {
        const type = String(payment.type || "").toLowerCase();

        let displayType = "عملية دفع";

        if (type === "subscription" || type === "subscriptions") {
          displayType = "اشتراك";
        } else if (type === "project" || type === "projects") {
          displayType = "عمولة مشروع";
        } else if (
          type === "hiring" ||
          type === "permanenthiring" ||
          type === "permanent_hiring"
        ) {
          displayType = "توظيف دائم";
        } else {
          displayType = "عملية متجر";
        }

        let details = payment.reference || "عملية دفع";

        if (payment.order?._id) {
          details = `طلب #${payment.order._id}`;
        }

        if (payment.transactionId) {
          details += ` - عملية ${payment.transactionId}`;
        }

        return {
          id: payment._id.toString(),
          type: displayType,
          user: payment.user?.username || payment.user?.email || "مستخدم",
          details,
          amount: `${Number(payment.amount || 0).toLocaleString("en-US")} ج.م`,
          amountNumber: Number(payment.amount || 0),
          date: payment.createdAt,
          status: payment.status,
          reference: payment.reference,
          transactionId: payment.transactionId || null,
          senderPhone: payment.senderPhone || null,
          sender: payment.verification?.sender || null,
          wallet: payment.paymentNumber || null,
        };
      });


      // =====================================================
      // RESPONSE
      // =====================================================

      return successresponse(res, "تم جلب بيانات لوحة الإيرادات بنجاح", 200, {
        summary: {
          totalRevenue,
          subscriptionsRevenue,
          projectsRevenue,
          marketplaceRevenue,
          permanentHiringRevenue,
        },
        revenueSources,
        monthlyRevenue,
        transactions,
        pagination: {
          page: pageNumber,
          limit: pageLimit,
          total: totalTransactions,
          pages: totalPages,
        },
      });
    }
  );

  
// ==========================================
// GET PENDING WITHDRAWALS
// ==========================================

export const getPendingWithdrawals =
    asyncHandelr(async (req, res, next) => {

        const withdrawals =
            await Withdraw.find({
                status: "pending",
            })
                .populate(
                    "developer",
                    "username profileImage"
                )
                .sort({
                    createdAt: -1,
                });


        return successresponse(
            res,
            "تم جلب طلبات السحب المعلقة بنجاح",
            200,
            {
                withdrawals,
            }
        );
    });
// ==========================================
// GET WITHDRAWAL HISTORY
// ==========================================

export const getWithdrawalHistory =
    asyncHandelr(async (req, res, next) => {

        const withdrawals =
            await Withdraw.find({
                status: {
                    $in: [
                        "completed",
                        "rejected",
                    ],
                },
            })
                .populate(
                    "developer",
                    "username profileImage"
                )
                .sort({
                    createdAt: -1,
                });


        return successresponse(
            res,
            "تم جلب سجل السحب بنجاح",
            200,
            {
                withdrawals,
            }
        );
    });
// ==========================================
// APPROVE WITHDRAWAL
// ==========================================

export const approveWithdrawal =
    asyncHandelr(async (req, res, next) => {

        const {
            withdrawalId,
        } = req.params;
if (req.user.accses !== "SuperAdmin" && req.user.accses !== "FinanceAdmin") {
  return next(
    new Error("غير مصرح لك بتنفيذ هذا الاجراء", {
      cause: 403, // الأفضل تخليها 403 (Forbidden) بدل 404 لأنها صلاحيات
    })
  );
}

        // ==========================================
        // FIND WITHDRAWAL
        // ==========================================

        const withdraw =
            await Withdraw.findById(
                withdrawalId
            );


        if (!withdraw) {
            return next(
                new Error(
                    "طلب السحب غير موجود",
                    {
                        cause: 404,
                    }
                )
            );
        }


        // ==========================================
        // CHECK STATUS
        // ==========================================

        if (
            withdraw.status !==
            "pending"
        ) {
            return next(
                new Error(
                    "طلب السحب تم التعامل معه بالفعل",
                    {
                        cause: 400,
                    }
                )
            );
        }


        // ==========================================
        // UPDATE
        // ==========================================

        withdraw.status =
            "completed";

        withdraw.completedAt =
            new Date();


        await withdraw.save();


        // ==========================================
        // LOG ACTIVITY
        // ==========================================

        await logadminActivity({
           adminId:
                req.user._id,
           

            type:
                "withdraw",

            metadata: {
               userId:
                withdraw.developer,

                amount:
                    withdraw.amount,

                type:
                    withdraw.method,

                status:
                    "completed",
                               ip: req.user.accses === "SuperAdmin"? "الادمن لا يتم اخذ موقعه" : req.ip,

            },
        });


        // ==========================================
        // RESPONSE
        // ==========================================

        return successresponse(
            res,
            "تم تنفيذ طلب السحب بنجاح",
            200,
            {
                withdraw,
            }
        );

    });

    // ==========================================
// REJECT WITHDRAWAL
// ==========================================

export const rejectWithdrawal =
    asyncHandelr(async (req, res, next) => {

        const {
            withdrawalId,
        } = req.params;


        const {
            note,
        } = req.body;


        // ==========================================
        // VALIDATION
        // ==========================================
if (req.user.accses !== "SuperAdmin" && req.user.accses !== "FinanceAdmin") {
  return next(
    new Error("غير مصرح لك بتنفيذ هذا الاجراء", {
      cause: 403, // الأفضل تخليها 403 (Forbidden) بدل 404 لأنها صلاحيات
    })
  );
}
        if (
            !note ||
            !note.trim()
        ) {
            return next(
                new Error(
                    "سبب الرفض مطلوب",
                    {
                        cause: 400,
                    }
                )
            );
        }


        // ==========================================
        // FIND WITHDRAWAL
        // ==========================================

        const withdraw =
            await Withdraw.findById(
                withdrawalId
            );


        if (!withdraw) {
            return next(
                new Error(
                    "طلب السحب غير موجود",
                    {
                        cause: 404,
                    }
                )
            );
        }


        // ==========================================
        // CHECK STATUS
        // ==========================================

        if (
            withdraw.status !==
            "pending"
        ) {
            return next(
                new Error(
                    "طلب السحب تم التعامل معه بالفعل",
                    {
                        cause: 400,
                    }
                )
            );
        }


        // ==========================================
        // UPDATE
        // ==========================================

        withdraw.status =
            "rejected";

        withdraw.note =
            note.trim();


        await withdraw.save();


        // ==========================================
        // LOG ACTIVITY
        // ==========================================
 

        await logadminActivity({
            adminId:
                req.user._id,

            type:
                "withdraw",

            metadata: {
                userId:
                withdraw.developer,
                amount:
                    withdraw.amount,
                type:
                    withdraw.method,

                status:
                    "rejected",

              ip: req.user.accses === "SuperAdmin"? "الادمن لا يتم اخذ موقعه" : req.ip,

            },
        });


        // ==========================================
        // RESPONSE
        // ==========================================

        return successresponse(
            res,
            "تم رفض طلب السحب",
            200,
            {
                withdraw,
            }
        );

    });

export const getAllActivities =
    asyncHandelr(async (req, res, next) => {

        // ==========================================
        // VALIDATION
        // ==========================================
if (req.user.accses !== "SuperAdmin" ) {
  return next(
    new Error("غير مصرح لك بتنفيذ هذا الاجراء", {
      cause: 403, // الأفضل تخليها 403 (Forbidden) بدل 404 لأنها صلاحيات
    })
  );
}
 const recentActivity = await UserActivity.find()
    .sort({
      createdAt: -1,
    })
    .populate({
      path: "user",
      select: "username profileImage userType",
    })
    .lean();

     
        // ==========================================
        // RESPONSE
        // ==========================================

        return successresponse(
            res,
            "تم جلب الانشطة ",
            200,
            {
                recentActivity,
            }
        );

    });

    

    //ارسال الايميل 

    export const sendBroadcastEmail = asyncHandelr(
    async (req, res, next) => {

        const {
            subject,
            title,
            message,
            audience = "all",
        } = req.body;

        // ==========================================
        // VALIDATION
        // ==========================================

        if (!subject?.trim()) {
            return next(
                new Error("عنوان البريد الإلكتروني مطلوب", {
                    cause: 400,
                })
            );
        }

        if (!title?.trim()) {
            return next(
                new Error("عنوان الرسالة مطلوب", {
                    cause: 400,
                })
            );
        }

        if (!message?.trim()) {
            return next(
                new Error("محتوى الرسالة مطلوب", {
                    cause: 400,
                })
            );
        }

        const allowedAudiences = [
            "all",
            "developers",
            "clients",
            "elite",
        ];

        if (!allowedAudiences.includes(audience)) {
            return next(
                new Error("الفئة المستهدفة غير صحيحة", {
                    cause: 400,
                })
            );
        }

        // ==========================================
        // تحديد المستخدمين
        // ==========================================

        const filter = {
            deleted: { $ne: true },
            isBlocked: { $ne: true },
            email: { $exists: true, $ne: "" },
        };

        // مبرمجين
        if (audience === "developers") {
            filter.userType = "developer";
        }

        // عملاء
        if (audience === "clients") {
            filter.userType = "client";
        }

        // Elite
        if (audience === "elite") {
            filter.plan = "vip";
        }

        // ==========================================
        // جلب المستخدمين
        // ==========================================

        const users = await Usermodel.find(filter)
            .select("_id username email")
            .lean();

        if (!users.length) {
            return next(
                new Error(
                    "لا يوجد مستخدمين في هذه الفئة",
                    {
                        cause: 404,
                    }
                )
            );
        }

        // ==========================================
        // تجهيز الإيميلات
        // ==========================================

        const emails = users
            .map((user) => user.email?.trim())
            .filter(Boolean);

        if (!emails.length) {
            return next(
                new Error(
                    "لا يوجد مستخدمين لديهم بريد إلكتروني صالح",
                    {
                        cause: 404,
                    }
                )
            );
        }

        // ==========================================
        // إنشاء القالب
        // ==========================================

        const html = broadcastEmailTemplate({
            username: "صديقنا",
            title: title.trim(),
            message: message.trim(),
        });

        // ==========================================
        // إرسال البريد الجماعي
        // ==========================================

        const result = await sendemail({
            to: emails,
            subject: subject.trim(),
            text: message.trim(),
            html,
        });

        // ==========================================
        // Response
        // ==========================================

        return successresponse(
            res,
            "تم إرسال البريد الإلكتروني الجماعي بنجاح",
            200,
            {
                sentCount: emails.length,
                totalUsers: users.length,
                audience,
                subject: subject.trim(),
                title: title.trim(),
                message: message.trim(),
                result,
            }
        );
    }
);
export const sendEmailToUser = asyncHandelr(
    async (req, res, next) => {

        const {
            userId,
            subject,
            title,
            message,
        } = req.body;

        // ==========================================
        // Validation
        // ==========================================

        if (!userId) {
            return next(
                new Error("معرف المستخدم مطلوب", {
                    cause: 400,
                })
            );
        }

        if (!subject?.trim()) {
            return next(
                new Error("عنوان البريد الإلكتروني مطلوب", {
                    cause: 400,
                })
            );
        }

        if (!title?.trim()) {
            return next(
                new Error("عنوان الرسالة مطلوب", {
                    cause: 400,
                })
            );
        }

        if (!message?.trim()) {
            return next(
                new Error("محتوى الرسالة مطلوب", {
                    cause: 400,
                })
            );
        }

        // ==========================================
        // البحث عن المستخدم
        // ==========================================

        const user = await Usermodel.findOne({
            _id: userId,
            deleted: { $ne: true },
            isBlocked: { $ne: true },
        })
            .select("_id username email")
            .lean();

        if (!user) {
            return next(
                new Error(
                    "المستخدم غير موجود أو محظور",
                    {
                        cause: 404,
                    }
                )
            );
        }

        // ==========================================
        // التأكد من وجود الإيميل
        // ==========================================

        if (!user.email?.trim()) {
            return next(
                new Error(
                    "المستخدم لا يمتلك بريدًا إلكترونيًا",
                    {
                        cause: 400,
                    }
                )
            );
        }

        // ==========================================
        // إنشاء القالب
        // ==========================================

        const html = broadcastEmailTemplate({
            username: user.username || "صديقنا",
            title: title.trim(),
            message: message.trim(),
        });

        // ==========================================
        // إرسال البريد
        // ==========================================

        const result = await sendemail({
            to: user.email,
            subject: subject.trim(),
            text: message.trim(),
            html,
        });

        // ==========================================
        // Response
        // ==========================================

        return successresponse(
            res,
            "تم إرسال البريد الإلكتروني للمستخدم بنجاح",
            200,
            {
                sentCount: 1,

                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                },

                subject: subject.trim(),
                title: title.trim(),
                message: message.trim(),

                result,
            }
        );
    }
);



export const createClientAndProject = asyncHandelr(
  async (req, res, next) => {

    const { data } = req.body;

    // =========================
    // Validate Data
    // =========================

    if (!Array.isArray(data) || data.length === 0) {
      return next(
        new Error("يجب إرسال قائمة العملاء والمشاريع", {
          cause: 400,
        })
      );
    }

    // Maximum 10
    if (data.length > 10) {
      return next(
        new Error("يمكن إنشاء 10 عملاء ومشاريع فقط في الطلب الواحد", {
          cause: 400,
        })
      );
    }

    const createdData = [];

    // =========================
    // Get Developers Once
    // =========================

    const developers = await Usermodel.find({
      userType: "developer",
    }).select("email username");

    // =========================
    // Create Clients + Projects
    // =========================

    for (const item of data) {

      const {
        client,
        project,
      } = item || {};

      // =========================
      // Client Data
      // =========================

      const {
        name,
        email,
        companyName,
      } = client || {};

      if (!name || !email || !companyName) {
        return next(
          new Error(
            `بيانات العميل غير مكتملة للعميل: ${email || "غير معروف"}`,
            {
              cause: 400,
            }
          )
        );
      }

      // =========================
      // Project Data
      // =========================

      const {
        name: projectName,
        desctption,
        type,
        skills,
        time,
        budget,
        deadline,
        currency,
        profileImage,
      } = project || {};

      if (
        !projectName ||
        !desctption ||
        !type ||
        !skills ||
        !time ||
        !budget ||
        !deadline ||
        !currency
      ) {
        return next(
          new Error(
            `بيانات المشروع غير مكتملة للعميل: ${email}`,
            {
              cause: 400,
            }
          )
        );
      }

      // =========================
      // Check Existing Client
      // =========================

      const existingUser = await Usermodel.findOne({
        email,
      });

      if (existingUser) {
        return next(
          new Error(`الإيميل موجود بالفعل: ${email}`, {
            cause: 400,
          })
        );
      }

      // =========================
      // Create Client
      // =========================

      const user = await Usermodel.create({
        username: name,
        email,
        userType: "client",
        companyName,
        profileImage: profileImage,
      });

      // =========================
      // Create Project
      // =========================

      const ptoject = await projects.create({
        owner: user._id,
        currency,
        category: type,
        projectName,
        Description: desctption,
        skills,
        time,
        budget,
        deadline,
      });

      // =========================
      // Save Created Data
      // =========================

      createdData.push({
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          companyName: user.companyName,
          userType: user.userType,
          profileImage: user.profileImage,
        },
        project: ptoject,
      });

      // =========================
      // Send Emails
      // =========================

      setImmediate(async () => {

        try {

          await Promise.all(
            developers.map((developer) =>
              sendemail({
                to: developer.email,
                subject: "🚀 مشروع جديد على Progzila",

                html: `
                  <div style="
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 40px 30px;
                    font-family: 'Segoe UI', Arial, sans-serif;
                    background: #f9fafb;
                    border-radius: 24px;
                    border: 1px solid #e5e7eb;
                  ">

                    <div style="
                      display: flex;
                      align-items: center;
                      gap: 10px;
                      margin-bottom: 28px;
                    ">

                      <span style="
                        font-size: 28px;
                        background: #eef2ff;
                        padding: 6px 12px;
                        border-radius: 40px;
                      ">
                        🚀
                      </span>

                      <h2 style="
                        margin: 0;
                        font-size: 24px;
                        color: #111827;
                      ">
                        تم نشر مشروع جديد
                      </h2>

                    </div>

                    <p style="
                      font-size: 16px;
                      color: #1f2937;
                    ">
                      مرحباً
                      <strong>${developer.username}</strong>
                      👋
                    </p>

                    <p style="
                      font-size: 15px;
                      color: #4b5563;
                      line-height: 1.6;
                    ">
                      تم نشر مشروع جديد يمكنك التقديم عليه الآن.
                    </p>

                    <hr style="
                      border: none;
                      border-top: 2px solid #e5e7eb;
                      margin: 28px 0;
                    ">

                    <div style="
                      background: #ffffff;
                      padding: 24px 28px;
                      border-radius: 16px;
                      border: 1px solid #e5e7eb;
                    ">

                      <h3 style="
                        margin: 0 0 8px 0;
                        font-size: 20px;
                        color: #111827;
                      ">
                        ${ptoject.projectName}
                      </h3>

                      <p style="
                        font-size: 15px;
                        color: #4b5563;
                        line-height: 1.7;
                      ">
                        ${ptoject.Description}
                      </p>

                      <a
                        href="https://progzila.com/dashboard/developer/project-proposals"
                        style="
                          display: inline-block;
                          padding: 12px 28px;
                          background: #4f46e5;
                          color: #ffffff;
                          font-weight: 600;
                          font-size: 15px;
                          text-decoration: none;
                          border-radius: 40px;
                        "
                      >
                        👀 مشاهدة المشروع
                      </a>

                    </div>

                    <div style="
                      font-size: 13px;
                      color: #9ca3af;
                      text-align: center;
                      border-top: 1px solid #e5e7eb;
                      padding-top: 22px;
                      margin-top: 30px;
                    ">

                      <strong>Progzila Team</strong>

                      <span style="
                        margin: 0 6px;
                      ">
                        •
                      </span>

                      جميع الحقوق محفوظة

                    </div>

                  </div>
                `,
              })
            )
          );

          console.log(
            `✅ Emails Sent For Project: ${ptoject.projectName}`
          );

        } catch (err) {

          console.error(
            "Project Email Error:",
            err
          );

        }

      });

    }

    // =========================
    // Response
    // =========================

    return successresponse(
      res,
      `تم إنشاء ${createdData.length} عملاء ومشاريع بنجاح`,
      201,
      {
        count: createdData.length,
        data: createdData,
      }
    );

  }
);