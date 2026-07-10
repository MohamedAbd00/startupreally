import nodemailer from "nodemailer";
import { emailtemplet } from "../temblete/vervication.email.js";

export const sendemail = async (email , code) => {
  console.log("email")
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // ايميل الجيميل
      pass: process.env.EMAIL_PASS, // App Password
    },
  });

  const mailOptions = {
    from: `"Booking app" <${process.env.EMAIL_USER}>`, // اسم الموقع
    to: email, // الايميل اللي هيستقبل
    subject: "رسالة من موقع booking app 🐺",
    html: emailtemplet(code),
  };

  await transporter.sendMail(mailOptions);
  console.log("✅ Email sent successfully");
};

