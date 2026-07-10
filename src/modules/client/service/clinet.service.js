profileImage
import { asyncHandelr } from "../../../utlis/response/error.response.js";
import { successresponse } from "../../../utlis/response/success.response.js";
import Usermodel from "../../../DB/models/usermodel.js";
import profileImage from "../../../DB/models/profileImage.js";
import projects from "../../../DB/models/projects.js";
import proposal from "../../../DB/models/proposal.js";
import chat from "../../../DB/models/chat.js";
import Payment from "../../../DB/models/Payment .js";
import { createProjectActivity } from "../../../utlis/activity/projectActivity.js";
import storeModel from "../../../DB/models/store.js";
 import {createNotification} from "../../../utlis/activity/createNotification.js"
  import ProductViews from "../../../DB/models/ProductViews.js"


//تسجيل الدخول

//استكمال البيانات
export const compliteprofileclient = asyncHandelr(async (req, res, next) => {
  const { email, profileImage, coverImage } = req.body;

  if (!email) {
    return next(new Error("جميع الحقول مطلوبة", { cause: 400 }));
  }

  const user = await Usermodel.findOneAndUpdate(
    { email },
    { profileImage, coverImage , compleytprofile : true },
    { new: true }
  );

  if (!user) {
    return next(new Error("المستخدم غير موجود", { cause: 404 }));
  }

  return successresponse(
    res,
    "تم تحديث البيانات بنجاح",
    200,
  
  );
});

//جلب الصور الي هيختار منها العميل
export const getAllImages = asyncHandelr(async (req, res, next) => {

  const image = await profileImage.find()

  return successresponse(
    res,
    "تم جلب الصور بنجاح",
    200,
    {images:image}
  
  );
});
//انشاء مشروع
export const createproject = asyncHandelr(async (req, res, next) => {
  const{name , desctption , type , skills ,time ,budget, deadline} = req.body;
 const owner = req.user?._id;

 const ptoject = await projects.create({
  owner,
category: type,
projectName: name,
Description: desctption,
skills,
time,
budget,
deadline

 })

  return successresponse(
    res,
    "تم انشاء المشروع  بنجاح",
    200,
    {ptoject}
  
  );
});
//جلب جميع المشاريع
export const getClientProjects = asyncHandelr(async (req, res, next) => {
  const owner = req.user?._id;

  if (!owner) {
    return next(new Error("التوكن مطلوب", { cause: 401 }));
  }

  const projectsData = await projects
    .find({ owner })
    .populate("developertaked", "username profileImage")
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

    developerId: project.developertaked?._id || null,

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

//جلب جميع عروض العميل
export const getProjectProposals = asyncHandelr(async (req, res, next) => {


  const userId = req.user._id;

  const proposals = await proposal.find({
    owner: userId,
  })
    .populate(
      "developer",
      "username profileImage rate completedProjects"
    ).populate("project" , "projectName")
    .sort({ createdAt: -1 });

  return successresponse(res, "Done", 200, {
    proposals,
  });
});

//قبول عرض المبرمج
export const acceptProposal = asyncHandelr(async (req, res, next) => {

  const { proposalId } = req.params;
  const userId = req.user._id;

  const ProposalData = await proposal.findById(proposalId);

  if (!ProposalData)
    return next(new Error("العرض غير موجود", { cause: 404 }));

  const Project = await projects.findById(ProposalData.project);


  if (!Project)
    return next(new Error("المشروع غير موجود", { cause: 404 }));

  if (Project.owner.toString() !== userId.toString())
    return next(new Error("غير مصرح", { cause: 403 }));

  if (Project.developertaked)
    return next(new Error("تم اختيار مبرمج بالفعل", { cause: 400 }));
const acceptedProposal = await proposal.findOne({
  project: Project._id,
  status: "accepted",
});

if (acceptedProposal) {
  return next(
    new Error("تم قبول عرض آخر لهذا المشروع", {
      cause: 400,
    })
  );
}
  // قبول العرض
  ProposalData.status = "accepted";
  await ProposalData.save();

  // رفض باقي العروض
  await proposal.updateMany(
    {
      project: Project._id,
      _id: { $ne: ProposalData._id }
    },
    {
      status: "rejected"
    }
  );

  // تحديث المشروع
  Project.developertaked = ProposalData.developer;
  Project.status = "in_progress";
  Project.startDate = new Date();

  await Project.save();

  // إنشاء الشات إذا لم يكن موجوداً
  let chats = await chat.findOne({
    project: Project._id,
  });

  if (!chats) {
    chats = await chat.create({
      project: Project._id,
      client: Project.owner,
      developer: ProposalData.developer,
    });
  }
  await createNotification({
    receiver: userId,
    sender: ProposalData.developer,
    type: "project",
    title: "لقد تم قبول عرضك",
    body: ProposalData.coverLetter,
    project: projectId,
});
  return successresponse(res, "تم قبول العرض", 200, {
    proposal: ProposalData,
    chatId: chat._id,
  });

});

//رفض عرض المبرمج
export const rejectProposal = asyncHandelr(async (req, res, next) => {

  const { proposalId } = req.params;
  const userId = req.user._id;

  const ProposalData = await proposal.findById(proposalId);

  if (!ProposalData)
    return next(new Error("العرض غير موجود", { cause: 404 }));

  const Project = await projects.findById(ProposalData.project);

  if (!Project)
    return next(new Error("المشروع غير موجود", { cause: 404 }));

  if (Project.owner.toString() !== userId.toString())
    return next(new Error("غير مصرح", { cause: 403 }));

  if (ProposalData.status !== "pending")
    return next(new Error("تم التعامل مع العرض بالفعل", { cause: 400 }));

  ProposalData.status = "rejected";

  await ProposalData.save();
  await createNotification({
    receiver: userId,
    sender: ProposalData.developer,
    type: "project",
    title: "لقد تم رفض عرضك",
    body: ProposalData.coverLetter,
    project: projectId,
});
  return successresponse(res, "تم رفض العرض", 200, ProposalData);

});

//اضافة دفعة لمشروع معين
export const Addbatch = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;
  const { projectid } = req.params;
  const {name , amount , type , phone} = req.body;

if(!userId || !projectid || !name || !amount || !type || !phone ){
      return next(new Error("جميع الحقول مطلوبة", { cause: 404 }));

}

const project = await projects.findById(projectid)
if(!project){
        return next(new Error("المشروع غير موجود", { cause: 404 }));

}
 if (project.clientApproved) {
    return next(
      new Error("تم الانتهاء من المشروع لايمكنك التعديل", { cause: 404 })
    );
  }
  if (project.owner.toString() !== userId.toString()) {
    return next(
      new Error("غير مصرح لك", { cause: 403 })
    );
  }

  const donePayment = await Payment.create({
    project: projectid ,
    createdBy : userId,
    namePayment: name,
     amount , 
    transferNumber :phone,
typewallet: type
  })
  await createProjectActivity({
  project: projectid,
  user: userId,
  action: "payment_added",
  targetType: "payment",
  targetId: donePayment._id,
  metadata: {
    taskTitle: "payment_added",
    amount
  },
});
  await createNotification({
    receiver:project.developertaked ,
    sender:userId ,
    type: "payment",
    title: "لقد تم اضافة دفعة جديدة وهي الان تحت المراجعة",
    body: amount,
    project: projectid,
});
  return successresponse(res, "تم ارسال طلب الدفع", 200);

})

// إضافة هدف جديدة
export const addObjective = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;
  const { projectId } = req.params;
  const { objective } = req.body;

  if (!objective || !objective.trim()) {
    return next(
      new Error("الميزة مطلوبة", { cause: 400 })
    );
  }

  const project = await projects.findById(projectId);

  if (!project) {
    return next(
      new Error("المشروع غير موجود", { cause: 404 })
    );
  }
 if (project.clientApproved) {
    return next(
      new Error("تم الانتهاء من المشروع لايمكنك التعديل", { cause: 404 })
    );
  }
  // السماح فقط للمبرمج المسؤول
  if (project.owner.toString() !== userId.toString()) {
    return next(
      new Error("غير مصرح لك", { cause: 403 })
    );
  }

  project.Objectives.push(objective.trim());

  await project.save();
await createProjectActivity({
  project: projectId,
  user: userId,
  action: "Objective_created",
  targetType: "Objective",
  targetId: objective._id,
  metadata: {
    taskTitle: objective,
  },
});
  return successresponse(
    res,
    "تم إضافة الميزة بنجاح",
    201,
    {
      Objectives: project.Objectives,
    }
  );
});
// إضافة ميزة جديدة
export const addfeatures = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;
  const { projectId } = req.params;
  const { feature } = req.body;

  if (!feature || !feature.trim()) {
    return next(
      new Error("الميزة مطلوبة", { cause: 400 })
    );
  }

  const project = await projects.findById(projectId);

  if (!project) {
    return next(
      new Error("المشروع غير موجود", { cause: 404 })
    );
  }
   if (project.clientApproved) {
    return next(
      new Error("تم الانتهاء من المشروع لايمكنك التعديل", { cause: 404 })
    );
  }

  // السماح فقط للمبرمج المسؤول
  if (project.owner.toString() !== userId.toString()) {
    return next(
      new Error("غير مصرح لك", { cause: 403 })
    );
  }

  project.features.push(feature.trim());

  await project.save();
await createProjectActivity({
  project: projectId,
  user: userId,
  action: "feature_created",
  targetType: "feature",
  targetId: feature._id,
  metadata: {
    taskTitle: feature,
  },
});
  return successresponse(
    res,
    "تم إضافة الميزة بنجاح",
    201,
    {
      Objectives: project.features,
    }
  );
});
//الموافقة علي المشروع
export const clinetapprove = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;
  const { projectId } = req.params;

  

  const project = await projects.findById(projectId);

  if (!project) {
    return next(
      new Error("المشروع غير موجود", { cause: 404 })
    );
  }

  if (project.owner.toString() !== userId.toString()) {
    return next(
      new Error("غير مصرح لك", { cause: 403 })
    );
  }
await projects.findByIdAndUpdate({_id:projectId },{clientApproved : true, status:"completed"}) 
await createProjectActivity({
  project: projectId,
  user: userId,
  action: "clientApproved",
  targetType: "Approved",
  targetId: projectId,
  metadata: {
    taskTitle: "clientApproved",
  },
});
  await createNotification({
    receiver: userId,
    sender: project.developertaked,
    type: "project",
    title: "لقد وافق العميل علي مشروعك تم الانتهاء منه",
    body: "المشروع منتهي",
    project: projectId,
});
  return successresponse(
    res,
    "تم الموافقة علي المشروع",
    200,
    
  );
});

//احصائيات لوحة تحكم العميل
export const clinetdashboard = asyncHandelr(async (req, res, next) => {
  const userId = req.user._id;

  // ==========================
  // آخر المشاريع
  // ==========================
  const recentProjects = await projects
    .find({ owner: userId })
    .sort({ createdAt: -1 })
    .limit(4);

  // ==========================
  // آخر العروض
  // ==========================
  const pendingProposals = await proposal
    .find({
      owner: userId,
      status: "pending",
    }).populate("developer", "username").populate("project","projectName")
    .sort({ createdAt: -1 })
    .limit(3);

  // ==========================
  // مبرمجين مميزين
  // ==========================
const featuredDevelopers = await Usermodel.aggregate([
  {
    $match: {
      userType: "developer",
    },
  },
  {
    $addFields: {
      planOrder: {
        $switch: {
          branches: [
            { case: { $eq: ["$plan", "vip"] }, then: 1 },
            { case: { $eq: ["$plan", "basic"] }, then: 2 },
            { case: { $eq: ["$plan", "free"] }, then: 3 },
          ],
          default: 4,
        },
      },
    },
  },
  {
    $sort: {
      planOrder: 1,
      createdAt: -1,
    },
  },
  {
    $limit: 3,
  },
  {
    $project: {
      username: 1,
      profileImage: 1,
      rate: 1,
      plan: 1,
      track:1,
      hourlyRate:1,
      completedProjects:1
    },
  },
]);
  // ==========================
  // عدد المشاريع
  // ==========================
  const activeProjects = await projects.countDocuments({
    owner: userId,
    status: "in_progress",
  });

  const completedProjects = await projects.countDocuments({
    owner: userId,
    status: "completed",
  });

  // ==========================
  // عدد العروض المنتظرة
  // ==========================
  const pendingOffers = await proposal.countDocuments({
    owner: userId,
    status: "pending",
  });

  // ==========================
  // إجمالي ميزانية المشاريع
  // ==========================
const projectBudget = await projects.aggregate([
  {
    $match: {
      owner: userId,
      status: "in_progress"
      
    },
  },
  {
    $group: {
      _id: null,
      total: {
        $sum: {
          $toDouble: "$budget",
        },
      },
    },
  },
]);

  const totalProjectBudget = projectBudget[0]?.total || 0;
  // ==========================
  // إجمالي المقبول من العروض
  // ==========================
  const acceptedBudget = await proposal.aggregate([
    {
      $match: {
        owner: userId,
        status: "accepted",
      },
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$budget",
        },
      },
    },
  ]);

  const totalAcceptedBudget = acceptedBudget[0]?.total || 0;

  // ==========================
  // إجمالي المدفوع
  // ==========================
  const payments = await Payment.aggregate([
    {
      $match: {
        client: userId,
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

  const totalSpent = payments[0]?.total || 0;

  // ==========================
  // المبلغ الموفر
  // ==========================
  const savedAmount = totalProjectBudget - totalAcceptedBudget;

  return successresponse(res, "تم جلب بيانات لوحة التحكم", 200, {
    stats: {
      activeProjects,
      completedProjects,
      pendingOffers,
      totalSpent,
      savedAmount,
    },

    recentProjects,

    featuredDevelopers,

    pendingProposals,
  });
});
//جلب بروافيل المبرمج
export const getdevprofile = asyncHandelr(async (req, res, next) => {
  const {id} = req.params;


  const user = await Usermodel
    .findOne({_id :id});
    
if (!user) {
   return next(
      new Error("المستخدم غير موجود", { cause: 404 })
    );
}
    const project= await storeModel.find({
      owner : id
    })

     const activeProjects = await projects.countDocuments({
    developertaked: id,
    status: "in_progress",
  });
   const allprojects = await projects.countDocuments({
    developertaked: id,
    
  });
  const completprojects = await projects.countDocuments({
    developertaked: id,
    status: "completed",
    
  });
       
   console.log(allprojects)
   console.log(activeProjects)
console.log(completprojects)

  return successresponse(
    res,
    "تم جلب البروفايل بنجاح",
    200,
    {
      userdata: user,
      projects : project,
      countallproject: allprojects,
      crunetprojects: activeProjects,
      completproject: completprojects
     
    }
  );
});
//جلب حميع المبرمجين
export const getalldev = asyncHandelr(async (req, res, next) => {


 
const alldev = await Usermodel.find({
  userType : "developer"
});
  return successresponse(
    res,
    "تم جلب المبرمجين بنجاح",
    200,
    {
      dev: alldev,
     
     
    }
  );
});
//جلب المتجر
export const getstore = asyncHandelr(async (req, res, next) => {


const stors = await storeModel.find().populate("owner", "username profileImage");
  return successresponse(
    res,
    "تم جلب المتجر بنجاح",
    200,
    {
      stores: stors,
     
     
    }
  );
});

//جلب تفاصيل حساب العميل
export const getClientSettings = asyncHandelr(async (req, res, next) => {
  const user = await Usermodel.findById(req.user._id).select(
    "companyName email phone location website language timezone currency notificationSettings"
  );

  return successresponse(
    res,
    "تم جلب الإعدادات",
    200,
    user
  );
});
//تعديل معلومات الحساب
export const updateAccountSettings = asyncHandelr(async (req, res) => {

  const updates = {};

  const fields = [
    "companyName",
    "email",
    "phone",
    "location",
    "website",
    "language",
    "timezone",
    "currency",
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await Usermodel.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
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
//حذف الحساب
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

//جلب بيانات مشروع معين
export const getdetilsproject = asyncHandelr(async (req, res) => {
const {id} = req.params
 const project = await storeModel.findById(id).populate("owner" , "username profileImage");
if(!project){
        new Error("المشروع غير موجود", { cause: 404 })

}

const reviw = await ProductViews.findOne({user:req.user._id  })

if (!reviw) {
 await ProductViews.create({
  project: id,
  user: req.user._id ,
  ip: req.ip
 })

}
const countprojects = await  storeModel.find({owner:project.owner }).countDocuments();
const views = await ProductViews.countDocuments()
  return successresponse(
    res,
    "تم جلب المشروع بنجاح",
    200,
 {
  project,
  views,
  countprojects
}
  );
});