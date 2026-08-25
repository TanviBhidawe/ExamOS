const Notification = require("../models/Notification");

exports.createNotification = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    const notification = await Notification.create({
      title,
      message,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Notification sent successfully",
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "fullName email");

    res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(
      req.params.id
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getCandidateNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .select("title message createdAt readBy");

    const formattedNotifications = notifications.map(
      (notification) => ({
        _id: notification._id,
        title: notification.title,
        message: notification.message,
        createdAt: notification.createdAt,
        read: notification.readBy.some(
          (id) => id.toString() === req.user._id.toString()
        ),
      })
    );

    res.json({
      success: true,
      notifications: formattedNotifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(
      req.params.id
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    const alreadyRead = notification.readBy.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      notification.readBy.push(req.user._id);
      await notification.save();
    }

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};