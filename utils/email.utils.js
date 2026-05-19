const nodemailer = require("nodemailer");

// Create transporter with Railway-compatible settings
const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: "SSLv3",
    },
    // Generous timeouts for Railway's network
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    // Force IPv4 — Railway IPv6 causes Gmail SMTP timeouts
    family: 4,
  });
};

// Safe send — NEVER throws, always resolves
const safeSend = async (mailOptions) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Sent to ${mailOptions.to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email] Failed to send to ${mailOptions.to}:`, err.message);
    return { success: false, error: err.message };
  }
};

// Send OTP Email
const sendOtpEmail = (to, otp) =>
  safeSend({
    from: `SkillKwiz <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject: "Your SkillKwiz OTP Code",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px;">
        <h2 style="color:#00418d;text-align:center;">SkillKwiz</h2>
        <h3 style="color:#333;">Your Verification Code</h3>
        <p style="color:#555;">Use this OTP to verify your email. Valid for <strong>10 minutes</strong>.</p>
        <div style="background:#f0f4ff;border:2px dashed #00418d;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
          <span style="font-size:36px;font-weight:bold;color:#00418d;letter-spacing:8px;">${otp}</span>
        </div>
        <p style="color:#888;font-size:12px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  });

// Send Welcome Email
const sendWelcomeEmail = (to, name, role) =>
  safeSend({
    from: `SkillKwiz <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject: "Welcome to SkillKwiz!",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">
        <h2 style="color:#00418d;">Welcome to SkillKwiz, ${name}!</h2>
        <p>Your <strong>${role}</strong> account has been successfully created.</p>
        <a href="${process.env.CLIENT_URL || "https://skillkwiz-frontend.vercel.app"}/services"
           style="display:inline-block;padding:12px 24px;background:#f73e5d;color:white;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:16px;">
          Get Started
        </a>
      </div>
    `,
  });

// Send Assessment Confirmation
const sendAssessmentConfirmation = (to, name, details) =>
  safeSend({
    from: `SkillKwiz <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject: "Assessment Scheduled - SkillKwiz",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">
        <h2 style="color:#00418d;">Assessment Confirmed!</h2>
        <p>Hi ${name}, your assessment has been scheduled.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <tr><td style="padding:8px;border:1px solid #eee;color:#888;">Company</td><td style="padding:8px;border:1px solid #eee;font-weight:bold;text-transform:capitalize;">${details.company}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;color:#888;">Date</td><td style="padding:8px;border:1px solid #eee;">${details.date}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;color:#888;">Time</td><td style="padding:8px;border:1px solid #eee;">${details.time}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;color:#888;">Centre</td><td style="padding:8px;border:1px solid #eee;">${details.centre}</td></tr>
        </table>
      </div>
    `,
  });

// Send Assessment Request Notification
const sendAssessmentRequestNotification = (to, candidateName, employerCompany, skills) =>
  safeSend({
    from: `SkillKwiz <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject: `Assessment Invitation from ${employerCompany} - SkillKwiz`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">
        <h2 style="color:#00418d;">You've Been Invited for an Assessment!</h2>
        <p>Hi ${candidateName},</p>
        <p><strong>${employerCompany}</strong> has requested a skill assessment for: ${(skills || []).join(", ")}</p>
        <a href="${process.env.CLIENT_URL || "https://skillkwiz-frontend.vercel.app"}/services"
           style="display:inline-block;padding:12px 24px;background:#f73e5d;color:white;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:16px;">
          View Invitation
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