const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getProfile,
  updateProfile,
} = require("../controllers/usercontroller");

router.get(
  "/profile",
  protect,
  roleMiddleware("candidate"),
  getProfile
);

router.put(
  "/profile",
  protect,
  roleMiddleware("candidate"),
  updateProfile
);

module.exports = router;