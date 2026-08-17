const express = require("express");
const {
  dashboard,
  getCandidates,
  analytics
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/dashboard", dashboard);
router.get("/candidates", getCandidates);
router.get("/analytics", analytics);

module.exports = router;
