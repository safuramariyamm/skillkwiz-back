// utils/email.utils.js
// Uses Resend API — no SMTP ports, works perfectly on Railway

const sendEmail = async ({ to, subject, html }) => {
  // ───── Resend (Primary — works on Railway, no port issues) ─────
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "SkillKwiz <onboarding@resend.dev>",
          to,
          subject,
          html,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("[Resend Error]", data);
        return { success: false, error: data.message };
      }

      console.log(`[Email] Sent via Resend to ${to}`);
      return { success: true };
    } catch (error) {
      console.error("[Resend Fetch Error]", error.message);
    }
  }

  // ───── Brevo Fallback ─────
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
            email: process.env.EMAIL_FROM || "noreply@skillkwiz.com",
          },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("[Brevo Error]", data);
        return { success: false, error: data.message };
      }

      console.log(`[Email] Sent via Brevo to ${to}`);
      return { success: true };
    } catch (error) {
      console.error("[Brevo Fetch Error]", error.message);
    }
  }

  // ───── Dev fallback — log to console ─────
  console.log(`[DEV EMAIL] To: ${to} | Subject: ${subject}`);
  return { success: true };
};

// ───── Welcome Email ─────
const sendWelcomeEmail = (to, name, role) =>
  sendEmail({
    to,
    subject: "Welcome to SkillKwiz! 🎉",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9;">
        <div style="background:#00418d;padding:30px;border-radius:10px 10px 0 0;text-align:center;">
          <h1 style="color:white;margin:0;font-size:28px;">Welcome to SkillKwiz!</h1>
        </div>
        <div style="background:white;padding:30px;border-radius:0 0 10px 10px;">
          <p style="font-size:16px;color:#333;">Hi <strong>${name}</strong>,</p>
          <p style="color:#555;line-height:1.6;">
            Your <strong style="color:#00418d;">${role}</strong> account has been created successfully.
            You're now part of the world's largest skill assessment platform.
          </p>
          <div style="background:#f0f7ff;border-left:4px solid #00418d;padding:15px;margin:20px 0;border-radius:4px;">
            <p style="margin:0;color:#00418d;font-weight:bold;">What's next?</p>
            <p style="margin:8px 0 0;color:#555;font-size:14px;">
              ${role === "employee"
        ? "Complete your profile and schedule your first skill assessment."
        : "Set up your company profile and start managing candidates."
      }
            </p>
          </div>
          <div style="text-align:center;margin:30px 0;">
            <a href="${process.env.CLIENT_URL || "https://skillkwiz-olive.vercel.app"}/services"
              style="display:inline-block;padding:14px 32px;background:#f73e5d;color:white;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">
              Go to Dashboard →
            </a>
          </div>
          <p style="color:#999;font-size:12px;text-align:center;margin-top:20px;">
            If you didn't create this account, please ignore this email.
          </p>
        </div>
      </div>
    `,
  });

// ───── Assessment Booking Confirmation ─────
const sendAssessmentConfirmation = (to, name, details) =>
  sendEmail({
    to,
    subject: "✅ Assessment Slot Booked - SkillKwiz",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9;">
        <div style="background:#00418d;padding:30px;border-radius:10px 10px 0 0;text-align:center;">
          <h1 style="color:white;margin:0;font-size:24px;">Assessment Confirmed! ✅</h1>
        </div>
        <div style="background:white;padding:30px;border-radius:0 0 10px 10px;">
          <p style="font-size:16px;color:#333;">Hi <strong>${name}</strong>,</p>
          <p style="color:#555;line-height:1.6;">
            Your assessment slot has been booked successfully. Here are the details:
          </p>
          <div style="background:#f0f7ff;border-radius:8px;padding:20px;margin:20px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;color:#666;font-size:14px;width:40%;">Company</td>
                <td style="padding:8px 0;color:#333;font-weight:bold;font-size:14px;text-transform:capitalize;">${details.company}</td>
              </tr>
              <tr style="border-top:1px solid #eee;">
                <td style="padding:8px 0;color:#666;font-size:14px;">Date</td>
                <td style="padding:8px 0;color:#333;font-weight:bold;font-size:14px;">${details.date}</td>
              </tr>
              <tr style="border-top:1px solid #eee;">
                <td style="padding:8px 0;color:#666;font-size:14px;">Time</td>
                <td style="padding:8px 0;color:#333;font-weight:bold;font-size:14px;">${details.time}</td>
              </tr>
              <tr style="border-top:1px solid #eee;">
                <td style="padding:8px 0;color:#666;font-size:14px;">Centre</td>
                <td style="padding:8px 0;color:#333;font-weight:bold;font-size:14px;">${details.centre}</td>
              </tr>
              ${details.skills ? `
              <tr style="border-top:1px solid #eee;">
                <td style="padding:8px 0;color:#666;font-size:14px;">Skills</td>
                <td style="padding:8px 0;color:#333;font-weight:bold;font-size:14px;">${Array.isArray(details.skills) ? details.skills.join(", ") : details.skills}</td>
              </tr>` : ""}
            </table>
          </div>
          <p style="color:#555;font-size:14px;line-height:1.6;">
            Please arrive 15 minutes early. Bring a valid government-issued photo ID.
          </p>
          <div style="text-align:center;margin:25px 0;">
            <a href="${process.env.CLIENT_URL || "https://skillkwiz-olive.vercel.app"}/services"
              style="display:inline-block;padding:14px 32px;background:#00418d;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">
              View My Bookings
            </a>
          </div>
          <p style="color:#999;font-size:12px;text-align:center;">
            Need to reschedule? Contact us at support@skillkwiz.com
          </p>
        </div>
      </div>
    `,
  });

// ───── Assessment Request Notification (for candidate) ─────
const sendAssessmentRequestNotification = (to, candidateName, employerCompany, skills) =>
  sendEmail({
    to,
    subject: `📋 Assessment Invitation from ${employerCompany} - SkillKwiz`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9;">
        <div style="background:#00418d;padding:30px;border-radius:10px 10px 0 0;text-align:center;">
          <h1 style="color:white;margin:0;font-size:24px;">Assessment Invitation 📋</h1>
        </div>
        <div style="background:white;padding:30px;border-radius:0 0 10px 10px;">
          <p style="font-size:16px;color:#333;">Hi <strong>${candidateName}</strong>,</p>
          <p style="color:#555;line-height:1.6;">
            <strong style="color:#00418d;">${employerCompany}</strong> has requested a skill assessment for you on SkillKwiz.
          </p>
          <div style="background:#f0f7ff;border-radius:8px;padding:20px;margin:20px 0;">
            <p style="margin:0 0 8px;color:#666;font-size:14px;">Skills to be assessed:</p>
            <p style="margin:0;color:#333;font-weight:bold;font-size:16px;">${(skills || []).join(", ")}</p>
          </div>
          <div style="text-align:center;margin:25px 0;">
            <a href="${process.env.CLIENT_URL || "https://skillkwiz-olive.vercel.app"}/services"
              style="display:inline-block;padding:14px 32px;background:#f73e5d;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">
              Schedule Your Assessment
            </a>
          </div>
        </div>
      </div>
    `,
  });

module.exports = {
  sendWelcomeEmail,
  sendAssessmentConfirmation,
  sendAssessmentRequestNotification,
};