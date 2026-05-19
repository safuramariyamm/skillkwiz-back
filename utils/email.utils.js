// utils/email.utils.js

const sendEmail = async ({ to, subject, html }) => {
  // ───── Brevo (Primary) ─────
  if (process.env.BREVO_API_KEY) {
    try {
      const senderEmail = process.env.EMAIL_FROM || "safuramariyam123@gmail.com";
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "SkillKwiz", email: senderEmail },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`[Brevo Error] status=${response.status} sender=${senderEmail} to=${to}`, JSON.stringify(data));
        // Fall through to Resend
      } else {
        console.log(`[Email] Sent via Brevo to ${to}`);
        return { success: true };
      }
    } catch (error) {
      console.error("[Brevo Fetch Error]:", error.message);
    }
  }

  // ───── Resend (Fallback) ─────
  if (process.env.RESEND_API_KEY) {
    try {
      const from = process.env.RESEND_FROM || "onboarding@resend.dev";
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to, subject, html }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`[Resend Error] status=${response.status} from=${from} to=${to}`, JSON.stringify(data));
        return { success: false, error: data.message };
      }

      console.log(`[Email] Sent via Resend to ${to}`);
      return { success: true };
    } catch (error) {
      console.error("[Resend Fetch Error]:", error.message);
      return { success: false, error: error.message };
    }
  }

  console.log(`[Email] DEV MODE — would send to: ${to} | subject: ${subject}`);
  return { success: true };
};

// ───── OTP Email ─────
const sendOtpEmail = (to, otp) =>
  sendEmail({
    to,
    subject: "Your SkillKwiz OTP Code",
    html: `
      <div style="font-family:Arial;padding:20px;">
        <h2>SkillKwiz OTP Verification</h2>
        <p>Your OTP code is:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#00418d;margin:20px 0;">${otp}</div>
        <p>This OTP is valid for 10 minutes.</p>
      </div>
    `,
  });

// ───── Welcome Email ─────
const sendWelcomeEmail = (to, name, role) =>
  sendEmail({
    to,
    subject: "Welcome to SkillKwiz!",
    html: `
      <div style="font-family:Arial;padding:20px;">
        <h2>Welcome, ${name}!</h2>
        <p>Your <strong>${role}</strong> account has been created successfully.</p>
        <a href="${process.env.CLIENT_URL_PROD || process.env.CLIENT_URL || "https://skillkwiz-olive.vercel.app"}"
           style="display:inline-block;padding:12px 24px;background:#f73e5d;color:white;text-decoration:none;border-radius:6px;margin-top:16px;">
          Get Started
        </a>
      </div>
    `,
  });

// ───── Assessment Confirmation (sent to candidate after booking) ─────
const sendAssessmentConfirmation = (to, name, details) =>
  sendEmail({
    to,
    subject: "Assessment Scheduled - SkillKwiz",
    html: `
      <div style="font-family:Arial;padding:20px;">
        <h2>Assessment Confirmed</h2>
        <p>Hello ${name}, your assessment has been scheduled.</p>
        <ul>
          <li><strong>Company:</strong> ${details.company}</li>
          <li><strong>Date:</strong> ${details.date}</li>
          <li><strong>Time:</strong> ${details.time}</li>
          <li><strong>Centre:</strong> ${details.centre}</li>
        </ul>
        <p>Please arrive 15 minutes early. Good luck!</p>
      </div>
    `,
  });

// ───── Assessment Request Notification (sent to candidate by employer) ─────
const sendAssessmentRequestNotification = (to, candidateName, employerCompany, skills) =>
  sendEmail({
    to,
    subject: `Assessment Invitation from ${employerCompany} - SkillKwiz`,
    html: `
      <div style="font-family:Arial;padding:20px;">
        <h2>You have been invited for an Assessment</h2>
        <p>Hi ${candidateName},</p>
        <p><strong>${employerCompany}</strong> has invited you to take a skill assessment on SkillKwiz.</p>
        <p><strong>Skills to be assessed:</strong> ${(skills || []).join(", ")}</p>
        <p>Log in to your SkillKwiz account to schedule your assessment slot.</p>
        <a href="${process.env.CLIENT_URL_PROD || process.env.CLIENT_URL || "https://skillkwiz-olive.vercel.app"}"
           style="display:inline-block;padding:12px 24px;background:#4ECDC4;color:white;text-decoration:none;border-radius:6px;margin-top:16px;">
          Book Your Slot
        </a>
      </div>
    `,
  });

module.exports = {
  sendOtpEmail,
  sendWelcomeEmail,
  sendAssessmentConfirmation,
  sendAssessmentRequestNotification,
};