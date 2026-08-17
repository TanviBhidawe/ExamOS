const User = require("../models/User");
const Exam = require("../models/Exam");
const Question = require("../models/Question");
const Attempt = require("../models/Attempt");

exports.dashboard = async (req, res, next) => {
  try {
    const [
      students,
      exams,
      questions,
      activeExams,
      attempts,
      passed
    ] = await Promise.all([
      User.countDocuments({ role: "candidate" }),
      Exam.countDocuments(),
      Question.countDocuments(),
      Exam.countDocuments({ status: "active" }),
      Attempt.countDocuments({ submittedAt: { $ne: null } }),
      Attempt.countDocuments({ submittedAt: { $ne: null }, passed: true })
    ]);

    const scoreData = await Attempt.aggregate([
      { $match: { submittedAt: { $ne: null } } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: "$percentage" },
          highestScore: { $max: "$percentage" }
        }
      }
    ]);

    const stats = scoreData[0] || {
      averageScore: 0,
      highestScore: 0
    };

    res.json({
      success: true,
      dashboard: {
        students,
        exams,
        questions,
        activeExams,
        attempts,
        passed,
        failed: attempts - passed,
        averageScore: Number((stats.averageScore || 0).toFixed(2)),
        highestScore: Number((stats.highestScore || 0).toFixed(2))
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getCandidates = async (req, res, next) => {
  try {
    const candidates = await User.find({ role: "candidate" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: candidates.length,
      candidates
    });
  } catch (error) {
    next(error);
  }
};

exports.analytics = async (req, res, next) => {
  try {
    const subjectAnalytics = await Attempt.aggregate([
      { $match: { submittedAt: { $ne: null } } },
      {
        $lookup: {
          from: "exams",
          localField: "exam",
          foreignField: "_id",
          as: "examData"
        }
      },
      { $unwind: "$examData" },
      {
        $group: {
          _id: "$examData.subject",
          averageScore: { $avg: "$percentage" },
          attempts: { $sum: 1 },
          passed: {
            $sum: { $cond: ["$passed", 1, 0] }
          }
        }
      },
      { $sort: { averageScore: -1 } }
    ]);

    res.json({
      success: true,
      subjectAnalytics
    });
  } catch (error) {
    next(error);
  }
};
