const express = require("express");

const router = express.Router();

const {
  protect,
} = require("../middleware/authMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createNotification,
  getNotifications,
  deleteNotification,
  getCandidateNotifications,
  markAsRead,
} = require("../controllers/notificationController");

router.post(
  "/",
  protect,
  roleMiddleware("admin"),
  createNotification
);

router.get(
  "/",
  protect,
  roleMiddleware("admin"),
  getNotifications
);

router.delete(
  "/:id",
  protect,
  roleMiddleware("admin"),
  deleteNotification
);

router.get(
  "/candidate",
  protect,
  roleMiddleware("candidate"),
  getCandidateNotifications
);

router.put(
  "/:id/read",
  protect,
  roleMiddleware("candidate"),
  markAsRead
);

module.exports = router;