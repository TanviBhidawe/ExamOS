const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  startExam,
  submitExam,
} = require("../controllers/examController");

router.post("/", protect, roleMiddleware("admin"), createExam);
router.get("/", protect, getExams);
router.get("/:id", protect, getExamById);

router.put("/:id", protect, roleMiddleware("admin"), updateExam);
router.delete("/:id", protect, roleMiddleware("admin"), deleteExam);

router.post("/:id/start", protect, roleMiddleware("candidate"), startExam);
router.post("/:id/submit", protect, roleMiddleware("candidate"), submitExam);

module.exports = router;
