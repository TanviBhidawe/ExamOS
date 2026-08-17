const express = require("express");
const {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  startExam
} = require("../controllers/examController");
const { protect, adminOnly, candidateOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getExams);
router.get("/:id", protect, getExamById);

router.post("/", protect, adminOnly, createExam);
router.put("/:id", protect, adminOnly, updateExam);
router.delete("/:id", protect, adminOnly, deleteExam);

router.post("/:id/start", protect, candidateOnly, startExam);

module.exports = router;
