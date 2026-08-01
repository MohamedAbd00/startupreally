export const vervicaionemailtemplet = ({ code } = {}) => {

    return `
    <p>Hello,</p>
    <p>Your secure authentication code is: <strong>${code}</strong></p>
    <p>If you didn’t request this, please ignore this email.</p>
`

}







// 2. القالب العربي (تم تحسين الألوان، المسافات، وجعله أكثر أناقة)
export const emailtemplet = (code) => {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تأكيد الحساب | Progzila</title>
</head>

<body style="margin:0; padding:0; background-color:#f8fafc; font-family:'Segoe UI', Tahoma, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 15px;">
<tr>
<td align="center">

<table width="620" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.06);">

<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg, #0f172a, #334155); text-align:center; padding:40px 20px;">
<!-- يمكنك تغيير هذا الرابط بصورة لوجو Progzila الخاص بك لاحقاً -->
<img
src="https://res.cloudinary.com/dldmjxihf/image/upload/v1784406487/5bb742e6-175c-4a58-b1b5-4a5ccc978c21_d2udqh.png"
alt="Progzila Logo"
width="180"
style="display:block; margin:auto;"
>
</td>
</tr>

<!-- Content -->
<tr>
<td style="padding:50px 40px; text-align:center;">

<h1 style="margin:0 0 20px 0; color:#0f172a; font-size:28px; font-weight:700;">
مرحباً بك في Progzila 👋
</h1>

<p style="color:#475569; line-height:1.8; font-size:16px; margin:0 0 35px 0;">
يسعدنا انضمامك إلى مجتمعنا. يرجى استخدام رمز التحقق أدناه لإكمال عملية إنشاء حسابك بنجاح.
</p>

<!-- Code Box -->
<div style="background-color:#f1f5f9; border-radius:12px; padding:30px; margin:0 auto 35px auto; max-width:400px; border:1px solid #e2e8f0;">
<p style="margin:0 0 15px 0; color:#64748b; font-size:15px; font-weight:600;">
رمز التحقق الخاص بك
</p>
<div style="font-size:42px; font-weight:bold; color:#0f172a; letter-spacing:12px;">
${code}
</div>
</div>

<p style="color:#94a3b8; font-size:14px; margin:0;">
انسخ الكود وأدخله في صفحة التفعيل.<br>
إذا لم تقم بإنشاء حساب، يرجى تجاهل هذه الرسالة.
</p>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="background-color:#f8fafc; border-top:1px solid #f1f5f9; text-align:center; padding:25px;">
<p style="margin:0; color:#94a3b8; font-size:13px;">
&copy; ${new Date().getFullYear()} Progzila. جميع الحقوق محفوظة.
</p>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};


export const forgotPasswordTemplateAr = (code) => {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>إعادة تعيين كلمة المرور | Progzila</title>
</head>

<body style="margin:0; padding:0; background-color:#f8fafc; font-family:'Segoe UI', Tahoma, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 15px;">
<tr>
<td align="center">

<table width="620" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.06);">

<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg, #0f172a, #334155); text-align:center; padding:40px 20px;">
<img
src="https://res.cloudinary.com/dldmjxihf/image/upload/v1784406487/5bb742e6-175c-4a58-b1b5-4a5ccc978c21_d2udqh.png"
alt="Progzila Logo"
width="180"
style="display:block; margin:auto;"
>
</td>
</tr>

<!-- Content -->
<tr>
<td style="padding:50px 40px; text-align:center;">

<h1 style="margin:0 0 20px 0; color:#0f172a; font-size:26px; font-weight:700;">
إعادة تعيين كلمة المرور 🔒
</h1>

<p style="color:#475569; line-height:1.8; font-size:16px; margin:0 0 35px 0;">
مرحباً، لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك اليك كلمة السر الجديدة لاتشاركها مع احد<strong>Progzila</strong>. <br>
</p>

<!-- Code Box -->
<div style="background-color:#fff1f2; border-radius:12px; padding:30px; margin:0 auto 35px auto; max-width:400px; border:1px solid #fecdd3;">
<p style="margin:0 0 15px 0; color:#e11d48; font-size:15px; font-weight:600;">
كلمة المرو الجديدة</p>
<div style="font-size:42px; font-weight:bold; color:#be123c; letter-spacing:12px;">
${code}
</div>
</div>



</td>
</tr>

<!-- Footer -->
<tr>
<td style="background-color:#f8fafc; border-top:1px solid #f1f5f9; text-align:center; padding:25px;">
<p style="margin:0; color:#94a3b8; font-size:13px;">
&copy; ${new Date().getFullYear()} Progzila. جميع الحقوق محفوظة.
</p>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};

// templates/acceptedEmail.js

export const acceptedEmail = ({ developerName = "", projectUrl }) => {
  const date = new Date().toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const year = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تم قبول العرض</title>
</head>

<body style="
margin:0;
padding:40px 20px;
background:#f3f4f6;
font-family:Tahoma,Arial,sans-serif;
direction:rtl;
">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table role="presentation"
width="620"
cellpadding="0"
cellspacing="0"
style="
max-width:620px;
background:#ffffff;
border-radius:18px;
overflow:hidden;
box-shadow:0 8px 30px rgba(0,0,0,.12);
">

<!-- Header -->
<tr>
<td
align="center"
style="
padding:45px 30px;
background:linear-gradient(135deg,#4f46e5,#7c3aed,#ec4899);
color:#ffffff;
">

<div style="font-size:60px;">🚀</div>

<h1 style="
margin:10px 0 5px;
font-size:34px;
font-weight:bold;
">
Progzila
</h1>

<p style="
margin:0;
font-size:15px;
opacity:.9;
">
منصة المبرمجين العربية
</p>

</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:45px 35px;">

<div style="text-align:center;">

<div style="font-size:70px;">🎉</div>

<h2 style="
margin:15px 0;
font-size:30px;
color:#111827;
">
مبروك!
</h2>

<p style="
font-size:18px;
color:#374151;
line-height:1.9;
margin:0;
">
${developerName ? `مرحباً <strong>${developerName}</strong><br><br>` : ""}
لقد قام العميل بقبول العرض الذي قدمته.
<br>
يمكنك الآن البدء في تنفيذ المشروع.
</p>

</div>

<!-- Status Box -->

<table
role="presentation"
width="100%"
cellpadding="0"
cellspacing="0"
style="
margin-top:35px;
background:#f9fafb;
border:1px solid #e5e7eb;
border-radius:12px;
">

<tr>
<td style="padding:18px;">

<table width="100%">

<tr>

<td style="padding:6px 0;color:#6b7280;">
حالة العرض
</td>

<td align="left"
style="
padding:6px 0;
color:#16a34a;
font-weight:bold;
">
✅ مقبول
</td>

</tr>

<tr>

<td style="padding:6px 0;color:#6b7280;">
تاريخ القبول
</td>

<td align="left"
style="padding:6px 0;">
${date}
</td>

</tr>

<tr>

<td style="padding:6px 0;color:#6b7280;">
المنصة
</td>

<td align="left"
style="
padding:6px 0;
color:#4f46e5;
font-weight:bold;
">
🚀 Progzila
</td>

</tr>

</table>

</td>
</tr>

</table>

<!-- Button -->

<div style="text-align:center;margin-top:40px;">

<a
href="${projectUrl}"
style="
display:inline-block;
background:#4f46e5;
color:#ffffff;
text-decoration:none;
padding:18px 34px;
font-size:18px;
font-weight:bold;
border-radius:12px;
">
🚀 اذهب إلى مشاريعي
</a>

</div>

<!-- Footer -->

<div
style="
margin-top:45px;
padding-top:25px;
border-top:1px solid #eeeeee;
text-align:center;
">

<p style="
margin:0;
font-size:13px;
color:#6b7280;
">
شكراً لاستخدامك منصة
<strong style="color:#4f46e5;">Progzila</strong>
</p>

<p style="
margin-top:12px;
font-size:12px;
color:#9ca3af;
">
© ${year} Progzila. جميع الحقوق محفوظة.
</p>

</div>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};