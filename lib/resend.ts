import { Resend } from "resend";
import * as React from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured. Email blocked:", { to, subject });
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || "TalentLoop <noreply@talentloop.example.com>",
      to,
      subject,
      react,
    });
    
    if (data.error) {
      console.error("Resend error:", data.error);
      return { success: false, error: data.error };
    }

    return { success: true, messageId: data.data?.id };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
