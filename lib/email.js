// /lib/email.js

import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, html }) {
  // ✅ Configure transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // ✅ Send email
  const info = await transporter.sendMail({
    from: `"Car Trade Hub" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  return info;
}