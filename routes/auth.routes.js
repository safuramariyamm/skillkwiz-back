const express = require("express");
const passport = require("passport");
const router = express.Router();
require("../config/passport");

const { register, login, refreshToken, getMe, logout, googleCallback, changePassword } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const { registerValidator, loginValidator } = require("../middleware/validate.middleware");

// POST /api/auth/register
router.post("/register", registerValidator, register);

// POST /api/auth/login
router.post("/login", loginValidator, login);

// POST /api/auth/refresh-token
router.post("/refresh-token", refreshToken);

// GET /api/auth/me
router.get("/me", protect, getMe);

// POST /api/auth/logout
router.post("/logout", protect, logout);

// PUT /api/auth/change-password
router.put("/change-password", protect, changePassword);

// GET /api/auth/google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

// GET /api/auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed` }),
  googleCallback
);

module.exports = router;
