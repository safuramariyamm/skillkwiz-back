const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.middleware");
const { uploadResume } = require("../middleware/upload.middleware");
const { employerRegisterValidator, assessmentRequestValidator } = require("../middleware/validate.middleware");
const {
  registerEmployer,
  getMyProfile,
  updateMyProfile,
  submitAssessmentRequest,
  getMyAssessmentRequests,
} = require("../controllers/employer.controller");

// GET /api/employers/me
router.get("/me", protect, authorize("employer"), getMyProfile);

// POST /api/employers/register
router.post("/register", protect, authorize("employer"), employerRegisterValidator, registerEmployer);

// PUT /api/employers/me
router.put("/me", protect, authorize("employer"), updateMyProfile);

// POST /api/employers/assessment-request
router.post(
  "/assessment-request",
  protect,
  authorize("employer"),
  uploadResume.single("resume"),
  assessmentRequestValidator,
  submitAssessmentRequest
);

// GET /api/employers/assessment-requests
router.get("/assessment-requests", protect, authorize("employer"), getMyAssessmentRequests);

module.exports = router;
