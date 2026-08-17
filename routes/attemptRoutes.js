const express = require("express");
const {
  submitAttempt,
  getMyAttempts,
  getAttemptById,
  getAllAttempts
} = require("../controllers/attemptController");
const { protect, adminOnly, candidateOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/my", protect, candidateOnly, getMyAttempts);
router.get("/:id", protect, getAttemptById);
router.post("/:attemptId/submit", protect, candidateOnly, submitAttempt);
router.get("/", protect, adminOnly, getAllAttempts);

module.exports = router;
