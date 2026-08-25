
const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  register,
  login,
  adminLogin,
  forgotPassword,
  resetPassword,
  me,
  updateCandidateProfile,
  changeCandidatePassword,
} = require("../controllers/authController");

router.post("/register", register);

router.post("/login", login);

router.post("/admin-login", adminLogin);

router.post("/forgot-password", forgotPassword);

router.put(
  "/reset-password/:token",
  resetPassword
);

router.get("/me", protect, me);

router.put(
  "/profile",
  protect,
  updateCandidateProfile
);

router.put(
  "/change-password",
  protect,
  changeCandidatePassword
);

module.exports = router;
