// ─── OTP Controller ───────────────────────────────────────────────────────────
// EMAIL OTP REMOVED — only phone OTP via Twilio
const { saveOTP, verifyOTP } = require("../utils/otp.utils");
const User = require("../models/User.model");

const sendOtp = async (req, res, next) => {
  try {
    const { identifier, type, purpose } = req.body;

    if (type === "email") {
      return res.status(400).json({
        success: false,
        message: "Email OTP is not supported. Please use phone verification.",
      });
    }

    const normalizePhone = (phone) => {
      let digits = phone.replace(/[^\d+]/g, "");
      if (digits.startsWith("+") && digits.length >= 10) return digits;
      digits = digits.replace(/\D/g, "");
      if (digits.length === 10 && /^[6-9]/.test(digits)) return "+91" + digits;
      if (digits.length === 12 && digits.startsWith("91")) return "+" + digits;
      if (digits.length === 10) return "+1" + digits;
      if (digits.length === 11 && digits.startsWith("1")) return "+" + digits;
      return "+" + digits;
    };

    const otp = await saveOTP(identifier, type, purpose || "registration");
    const toPhone = normalizePhone(identifier);
    console.log(`[OTP] Sending SMS to: ${toPhone}`);

    if (process.env.TWILIO_ACCOUNT_SID) {
      const twilio = require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      try {
        await twilio.messages.create({
          body: `Your SkillKwiz OTP is: ${otp}. Valid for 10 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER.trim(),
          to: toPhone,
        });
      } catch (twilioErr) {
        console.error("[Twilio Error]", twilioErr.message);
        console.log(`[DEV FALLBACK] OTP for ${toPhone}: ${otp}`);
      }
    } else {
      console.log(`[DEV] Phone OTP for ${toPhone}: ${otp}`);
    }

    res.json({ success: true, message: "OTP sent to your phone number" });
  } catch (err) {
    next(err);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { identifier, type, otp } = req.body;
    const result = await verifyOTP(identifier, type, otp);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }
    if (req.user && type === "phone") {
      await User.updateOne({ _id: req.user._id }, { isPhoneVerified: true });
    }
    res.json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
};

const Blog = require("../models/Blog.model");

const getBlogs = async (req, res, next) => {
  try {
    const { category, featured, page = 1, limit = 10, search } = req.query;
    const query = { status: "published" };
    if (category) query.category = category;
    if (featured === "true") query.featured = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query).populate("author", "name avatar").sort({ publishedAt: -1 }).skip(skip).limit(parseInt(limit)).select("-content");
    res.json({ success: true, data: { blogs, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } } });
  } catch (err) { next(err); }
};

const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: "published" }).populate("author", "name avatar");
    if (!blog) return res.status(404).json({ success: false, message: "Blog post not found" });
    await Blog.updateOne({ _id: blog._id }, { $inc: { views: 1 } });
    res.json({ success: true, data: { blog } });
  } catch (err) { next(err); }
};

const createBlog = async (req, res, next) => {
  try {
    const { title, excerpt, content, category, tags, featured } = req.body;
    const blog = await Blog.create({ title, excerpt, content, category, tags: tags || [], featured: featured || false, author: req.user._id, status: "draft" });
    res.status(201).json({ success: true, message: "Blog created", data: { blog } });
  } catch (err) { next(err); }
};

const publishBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, { status: "published", publishedAt: new Date() }, { new: true });
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    res.json({ success: true, message: "Blog published", data: { blog } });
  } catch (err) { next(err); }
};

const { Skill } = require("../models/Skill.model");

const getSkills = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: "i" };
    const skills = await Skill.find(query).sort({ name: 1 });
    res.json({ success: true, data: { skills } });
  } catch (err) { next(err); }
};

const createSkill = async (req, res, next) => {
  try {
    const { name, category, description } = req.body;
    const skill = await Skill.create({ name, category, description });
    res.status(201).json({ success: true, data: { skill } });
  } catch (err) { next(err); }
};

const Contact = require("../models/Contact.model");

const submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, company, inquiryType, message } = req.body;
    const contact = await Contact.create({ name, email, phone, company, inquiryType, message });
    if (process.env.RESEND_API_KEY) {
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.RESEND_FROM || "SkillKwiz <onboarding@resend.dev>", to: process.env.EMAIL_USER || "safuramariyam123@gmail.com", subject: `New Contact: ${inquiryType} from ${name}`, html: `<p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Message:</b> ${message}</p>` }),
      }).catch(console.error);
    }
    res.status(201).json({ success: true, message: "Thank you! We will get back to you soon.", data: { id: contact._id } });
  } catch (err) { next(err); }
};

const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/resumes/${req.file.filename}`;
    res.json({ success: true, message: "File uploaded successfully", data: { filename: req.file.filename, originalName: req.file.originalname, size: req.file.size, mimetype: req.file.mimetype, url: fileUrl } });
  } catch (err) { next(err); }
};

module.exports = { sendOtp, verifyOtp, getBlogs, getBlogBySlug, createBlog, publishBlog, getSkills, createSkill, submitContact, uploadResume };