const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ─── Send OTP Email ───────────────────────────────────────────────────────────
const sendOtpEmail = async (to, otp) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `SkillKwiz <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Your SkillKwiz OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #00418d;">SkillKwiz</h2>
        </div>
        <h3 style="color: #333;">Your Verification Code</h3>
        <p style="color: #555;">Use the following OTP to verify your email address. This code is valid for <strong>10 minutes</strong>.</p>
        <div style="background: #f0f4ff; border: 2px dashed #00418d; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 36px; font-weight: bold; color: #00418d; letter-spacing: 8px;">${otp}</span>
        </div>
        <p style="color: #888; font-size: 12px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  };
  return transporter.sendMail(mailOptions);
};

// ─── Send Welcome Email ───────────────────────────────────────────────────────
const sendWelcomeEmail = async (to, name, role) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `SkillKwiz <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Welcome to SkillKwiz!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #00418d;">Welcome to SkillKwiz, ${name}!</h2>
        <p>Your ${role} account has been successfully created.</p>
        <p>You can now login and start ${role === "employer" ? "finding top talent" : "showcasing your skills"}.</p>
        <a href="${process.env.CLIENT_URL}/login" style="display:inline-block; padding: 12px 24px; background: #f73e5d; color: white; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px;">
          Get Started
        </a>
        <p style="color: #888; font-size: 12px; margin-top: 24px;">SkillKwiz Team</p>
      </div>
    `,
  };
  return transporter.sendMail(mailOptions);
};

// ─── Send Assessment Confirmation ─────────────────────────────────────────────
const sendAssessmentConfirmation = async (to, name, details) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `SkillKwiz <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Assessment Scheduled - SkillKwiz",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #00418d;">Assessment Confirmed!</h2>
        <p>Hi ${name}, your assessment has been scheduled.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr><td style="padding: 8px; border: 1px solid #eee; color: #888;">Company</td><td style="padding: 8px; border: 1px solid #eee; font-weight: bold; text-transform: capitalize;">${details.company}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #eee; color: #888;">Date</td><td style="padding: 8px; border: 1px solid #eee;">${details.date}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #eee; color: #888;">Time</td><td style="padding: 8px; border: 1px solid #eee;">${details.time}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #eee; color: #888;">Centre</td><td style="padding: 8px; border: 1px solid #eee;">${details.centre}</td></tr>
        </table>
        <p style="margin-top: 16px;">Please arrive 15 minutes early. Bring a valid photo ID.</p>
      </div>
    `,
  };
  return transporter.sendMail(mailOptions);
};

// ─── Send Assessment Request Notification ────────────────────────────────────
const sendAssessmentRequestNotification = async (to, candidateName, employerCompany, skills) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `SkillKwiz <${process.env.EMAIL_FROM}>`,
    to,
    subject: `Assessment Invitation from ${employerCompany} - SkillKwiz`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #00418d;">You've Been Invited for an Assessment!</h2>
        <p>Hi ${candidateName},</p>
        <p><strong>${employerCompany}</strong> has requested you to take a skill assessment for the following skills:</p>
        <ul>${skills.map((s) => `<li>${s}</li>`).join("")}</ul>
        <p>Log in to SkillKwiz to schedule your assessment.</p>
        <a href="${process.env.CLIENT_URL}/dashboard" style="display:inline-block; padding: 12px 24px; background: #f73e5d; color: white; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px;">
          View Invitation
        </a>
      </div>
    `,
  };
  return transporter.sendMail(mailOptions);
};

// ─── Send Exam Booking Confirmation ───────────────────────────────────────────
const sendExamConfirmationEmail = async (to, name, booking) => {
  const transporter = createTransporter();

  const companyInfo = {
    microsoft: "Microsoft Technical Assessment",
    google: "Google Skills Assessment",
    amazon: "Amazon Technical Assessment",
    meta: "Meta Technical Assessment",
    infosys: "Infosys Skills Assessment",
    other: "Technical Assessment"
  };

  const mailOptions = {
    from: `SkillKwiz <${process.env.EMAIL_FROM}>`,
    to,
    subject: `Exam Booked Successfully - ${booking.bookingReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #00418d;">SkillKwiz</h2>
        </div>
        <h3 style="color: #333;">Exam Booking Confirmation</h3>
        <p>Dear ${name},</p>
        <p>Your exam has been successfully booked! Here are the details:</p>

        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h4 style="color: #00418d; margin: 0 0 15px 0;">📋 Booking Details</h4>
          <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
          <p><strong>Company:</strong> ${companyInfo[booking.company] || booking.company}</p>
          <p><strong>Skills:</strong> ${booking.skills.join(", ")}</p>
          <p><strong>Date:</strong> ${booking.formattedDate}</p>
          <p><strong>Time:</strong> ${booking.formattedTime}</p>
          <p><strong>Centre:</strong> ${booking.centre}</p>
          <p><strong>Location:</strong> ${booking.country} - ${booking.zipCode}</p>
        </div>

        <div style="background: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0;">
          <h4 style="color: #2e7d32; margin: 0 0 10px 0;">📍 Important Instructions</h4>
          <ul style="color: #333; margin: 0; padding-left: 20px;">
            <li>Arrive at the centre 30 minutes before your scheduled time</li>
            <li>Bring a valid government-issued ID proof</li>
            <li>Ensure your device meets the technical requirements</li>
            <li>Check your email for any additional instructions</li>
          </ul>
        </div>

        <p style="color: #666; font-size: 14px;">
          If you need to reschedule or cancel your exam, please contact our support team at least 24 hours in advance.
        </p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.CLIENT_URL}/dashboard" style="background: #00418d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View My Bookings
          </a>
        </div>
      </div>
    `,
  };
  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendOtpEmail,
  sendWelcomeEmail,
  sendAssessmentConfirmation,
  sendAssessmentRequestNotification,
  sendExamConfirmationEmail,
};
