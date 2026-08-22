const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getMyResults,
  getAllResults,
} = require("../controllers/resultController");

router.get("/my", protect, roleMiddleware("candidate"), getMyResults);

router.get("/", protect, roleMiddleware("admin"), getAllResults);

module.exports = router;