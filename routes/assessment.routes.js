const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.middleware");
const { scheduleAssessmentValidator } = require("../middleware/validate.middleware");
const { scheduleAssessment, getMyAssessments, getAssessmentById, cancelAssessment } = require("../controllers/assessment.controller");

router.post("/schedule", protect, authorize("employee"), scheduleAssessmentValidator, scheduleAssessment);
router.get("/my", protect, authorize("employee"), getMyAssessments);
router.get("/:id", protect, getAssessmentById);
router.patch("/:id/cancel", protect, authorize("employee"), cancelAssessment);

module.exports = router;
