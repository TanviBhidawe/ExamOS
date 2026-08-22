const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  register,
  login,
  adminLogin,
  resetPassword,
  me,
} = require("../controllers/authController");

router.post("/register", register);

router.post("/login", login);

router.post("/admin-login", adminLogin);

router.put("/reset-password", resetPassword);

router.get("/me", protect, me);

module.exports = router;