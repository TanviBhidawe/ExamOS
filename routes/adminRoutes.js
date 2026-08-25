const express = require("express");

const router = express.Router();

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const {
  dashboard,
  getCandidates,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
} = require("../controllers/adminController");

router.get(
  "/dashboard",
  protect,
  adminOnly,
  dashboard
);

router.get(
  "/candidates",
  protect,
  adminOnly,
  getCandidates
);

router.get(
  "/profile",
  protect,
  adminOnly,
  getAdminProfile
);

router.put(
  "/profile",
  protect,
  adminOnly,
  updateAdminProfile
);

router.put(
  "/change-password",
  protect,
  adminOnly,
  changeAdminPassword
);

module.exports = router;