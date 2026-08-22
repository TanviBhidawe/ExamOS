const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  dashboard,
  getCandidates,
} = require("../controllers/adminController");

router.get(
  "/dashboard",
  protect,
  roleMiddleware("admin"),
  dashboard
);

router.get(
  "/candidates",
  protect,
  roleMiddleware("admin"),
  getCandidates
);

module.exports = router;
