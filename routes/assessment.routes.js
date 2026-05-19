const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.middleware");
const { scheduleAssessmentValidator } = require("../middleware/validate.middleware");
const { scheduleAssessment, getMyAssessments, getAssessmentById, cancelAssessment, requestAssessment } = require("../controllers/assessment.controller");
const { assessmentRequestValidator } = require("../middleware/validate.middleware");

// Employee routes
router.post("/schedule", protect, authorize("employee"), scheduleAssessmentValidator, scheduleAssessment);
router.get("/my", protect, authorize("employee"), getMyAssessments);
router.get("/:id", protect, getAssessmentById);
router.patch("/:id/cancel", protect, authorize("employee"), cancelAssessment);

// Employer route — POST /api/assessments/request
router.post("/request", protect, authorize("employer"), assessmentRequestValidator, requestAssessment);

module.exports = router;