const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/questionController");

router.post("/", protect, roleMiddleware("admin"), createQuestion);
router.get("/", protect, getQuestions);
router.get("/:id", protect, getQuestionById);
router.put("/:id", protect, roleMiddleware("admin"), updateQuestion);
router.delete("/:id", protect, roleMiddleware("admin"), deleteQuestion);

module.exports = router;
