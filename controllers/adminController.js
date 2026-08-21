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

    const totalResults = await Result.countDocuments();

    res.json({
      success: true,
      dashboard: {
        totalCandidates,
        totalAdmins,
        totalQuestions,
        totalExams,
        totalResults,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
  }
};