// utils/email.utils.js

const sendEmail = async ({ to, subject, html }) => {
  // ───── Brevo (Primary) ─────
  if (process.env.BREVO_API_KEY) {
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: "SkillKwiz",
            email:
              process.env.EMAIL_FROM || "safuramariyam123@gmail.com",
          },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Brevo Error:", data);
        return { success: false, error: data.message };
      }

      console.log(`Brevo email sent to ${to}`);
      return { success: true };
    } catch (error) {
      console.error("Brevo Fetch Error:", error.message);
    }
  }

  // ───── Resend Fallback ─────
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from:
            process.env.RESEND_FROM ||
            process.env.EMAIL_FROM ||
            "onboarding@resend.dev",
          to,
          subject,
          html,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Resend Error:", data);
        return { success: false, error: data.message };
      }

      console.log(`Resend email sent to ${to}`);
      return { success: true };
    } catch (error) {
      console.error("Resend Fetch Error:", error.message);
      return { success: false, error: error.message };
    }
  }

  console.log(`DEV MODE → Email to: ${to}`);
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

        <div style="
          font-size:32px;
          font-weight:bold;
          letter-spacing:6px;
          color:#00418d;
          margin:20px 0;
        ">
          ${otp}
        </div>

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

        <p>
          Your <strong>${role}</strong> account has been created successfully.
        </p>

        <a
          href="${process.env.CLIENT_URL ||
      "https://skillkwiz-frontend.vercel.app"
      }"
          style="
            display:inline-block;
            padding:12px 24px;
            background:#f73e5d;
            color:white;
            text-decoration:none;
            border-radius:6px;
            margin-top:16px;
          "
        >
          Get Started
        </a>
      </div>
    `,
  });

// ───── Assessment Confirmation ─────
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
      </div>
    `,
  });

// ───── Assessment Invitation ─────
const sendAssessmentRequestNotification = (
  to,
  candidateName,
  employerCompany,
  skills
) =>
  sendEmail({
    to,
    subject: `Assessment Invitation from ${employerCompany}`,
    html: `
      <div style="font-family:Arial;padding:20px;">
        <h2>Assessment Invitation</h2>

        <p>Hi ${candidateName},</p>

        <p>
          <strong>${employerCompany}</strong> invited you for an assessment.
        </p>

        <p>
          Skills: <strong>${(skills || []).join(", ")}</strong>
        </p>
      </div>
    `,
  });

module.exports = {
  sendOtpEmail,
  sendWelcomeEmail,
  sendAssessmentConfirmation,
  sendAssessmentRequestNotification,
};