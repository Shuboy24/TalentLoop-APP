import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn("SMTP credentials not configured. Email blocked:", { to, subject });
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"TalentLoop" <noreply@talentloop.example.com>',
      to,
      subject,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
