
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Exam = require("../models/Exam");
const Question = require("../models/Question");
const Result = require("../models/Result");


exports.dashboard = async (req, res) => {
  try {
    const totalCandidates = await User.countDocuments({
      role: "candidate",
    });

    const totalAdmins = await User.countDocuments({
      role: "admin",
    });

    const totalQuestions = await Question.countDocuments();

    const totalExams = await Exam.countDocuments();

    const activeExams = await Exam.countDocuments({
      status: "active",
    });

    const completedExams = await Exam.countDocuments({
      status: "completed",
    });

    const totalResults = await Result.countDocuments();

    res.json({
      success: true,
      dashboard: {
        totalCandidates,
        totalAdmins,
        totalQuestions,
        totalExams,
        activeExams,
        completedExams,
        totalResults,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getCandidates = async (req, res) => {
  try {
    const candidates = await User.find({
      role: "candidate",
    }).select("-password");

    res.json({
      success: true,
      candidates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select(
      "-password"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      user: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    const { fullName, email } = req.body;

    const admin = await User.findById(req.user._id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    if (fullName) {
      admin.fullName = fullName.trim();
    }

    if (email) {
      admin.email = email.trim().toLowerCase();
    }

    await admin.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.changeAdminPassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const admin = await User.findById(req.user._id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      admin.password
    );

    if (!passwordMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    admin.password = await bcrypt.hash(
      newPassword,
      10
    );

    await admin.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

