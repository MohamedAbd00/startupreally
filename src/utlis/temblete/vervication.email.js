export const vervicaionemailtemplet = ({ code } = {}) => {

    return `
    <p>Hello,</p>
    <p>Your secure authentication code is: <strong>${code}</strong></p>
    <p>If you didn’t request this, please ignore this email.</p>
`

}





export const emailtemplet = (code) => {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تأكيد الحساب</title>
</head>

<body style="
    margin:0;
    padding:0;
    background:#f4f7fb;
    font-family:'Segoe UI',Tahoma,sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:40px 15px;">

<table width="620" cellpadding="0" cellspacing="0" style="
    background:#ffffff;
    border-radius:24px;
    overflow:hidden;
    box-shadow:0 10px 30px rgba(0,0,0,.08);
">

<!-- Header -->
<tr>
<td style="
    background:linear-gradient(135deg,#0B3364,#1B5FAF);
    text-align:center;
    padding:35px 20px;
">
<img
src="https://e.top4top.io/p_3647alr4r1.png"
alt="Gofzeail"
width="200"
style="display:block;margin:auto;"
>
</td>
</tr>

<!-- Content -->
<tr>
<td style="padding:45px 35px;text-align:center;">

<h1 style="
    margin:0;
    color:#0B3364;
    font-size:30px;
">
مرحباً بك في godzeial 👋
</h1>

<p style="
    color:#666;
    line-height:1.9;
    font-size:16px;
    margin:25px 0;
">
يسعدنا انضمامك إلينا.
استخدم رمز التحقق التالي لإكمال إنشاء حسابك وتفعيل البريد الإلكتروني.
</p>

<!-- Code Box -->
<div style="
    background:#f8fafc;
    border:2px dashed #0B3364;
    border-radius:16px;
    padding:25px;
    margin:30px 0;
">

<p style="
    margin:0 0 12px 0;
    color:#888;
    font-size:14px;
">
رمز التحقق الخاص بك
</p>

<div style="
    font-size:34px;
    font-weight:700;
    color:#0B3364;
    letter-spacing:8px;
">
${code}
</div>

</div>

<p style="
    color:#888;
    font-size:14px;
">
انسخ الكود وأدخله في صفحة التفعيل.
</p>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="
    background:#fafafa;
    border-top:1px solid #eee;
    text-align:center;
    padding:25px;
">

<p style="
    margin:0;
    color:#999;
    font-size:13px;
">
© 2026 Boss Social. جميع الحقوق محفوظة.
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

