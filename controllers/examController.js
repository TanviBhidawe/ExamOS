const mongoose = require("mongoose");
const Exam = require("../models/Exam");
const Question = require("../models/Question");
const Attempt = require("../models/Attempt");
const User = require("../models/User");

const validObjectIds = (ids) =>
  Array.isArray(ids) &&
  ids.every((id) => mongoose.Types.ObjectId.isValid(id));

exports.createExam = async (req, res, next) => {
  try {
    const {
      name,
      type,
      subject,
      duration,
      totalQuestions,
      passingMarks,
      questions = [],
      assignedCandidates = [],
      startTime,
      endTime
    } = req.body;

    if (!name || !subject || !duration || !totalQuestions || passingMarks === undefined) {
      return res.status(400).json({
        success: false,
        message: "name, subject, duration, totalQuestions and passingMarks are required"
      });
    }

    if (!validObjectIds(questions) || !validObjectIds(assignedCandidates)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question or candidate ID"
      });
    }

    if (questions.length !== Number(totalQuestions)) {
      return res.status(400).json({
        success: false,
        message: `Exactly ${totalQuestions} question IDs are required`
      });
    }

    const questionCount = await Question.countDocuments({
      _id: { $in: questions }
    });

    if (questionCount !== questions.length) {
      return res.status(400).json({
        success: false,
        message: "One or more question IDs do not exist"
      });
    }

    if (assignedCandidates.length > 0) {
      const candidateCount = await User.countDocuments({
        _id: { $in: assignedCandidates },
        role: "candidate"
      });

      if (candidateCount !== assignedCandidates.length) {
        return res.status(400).json({
          success: false,
          message: "One or more candidate IDs are invalid"
        });
      }
    }

    const now = new Date();
    let status = "draft";

    if (startTime && new Date(startTime) > now) status = "upcoming";
    if (startTime && new Date(startTime) <= now && (!endTime || new Date(endTime) > now)) status = "active";
    if (endTime && new Date(endTime) <= now) status = "completed";

    const exam = await Exam.create({
      name,
      type,
      subject,
      duration,
      totalQuestions,
      passingMarks,
      questions,
      assignedCandidates,
      startTime,
      endTime,
      status,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Exam created",
      exam
    });
  } catch (error) {
    next(error);
  }
};

exports.getExams = async (req, res, next) => {
  try {
    const { search, status, subject } = req.query;

    const filter = {};

    if (search) filter.name = { $regex: search, $options: "i" };
    if (status) filter.status = status;
    if (subject) filter.subject = { $regex: subject, $options: "i" };

    if (req.user.role === "candidate") {
      filter.$or = [
        { assignedCandidates: req.user._id },
        { assignedCandidates: { $size: 0 } }
      ];
    }

    const exams = await Exam.find(filter)
      .select("-questions")
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: exams.length,
      exams
    });
  } catch (error) {
    next(error);
  }
};

exports.getExamById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID"
      });
    }

    const exam = await Exam.findById(req.params.id)
      .populate({
        path: "questions",
        select: "questionText options subject difficulty marks negativeMarks"
      })
      .populate("assignedCandidates", "fullName email")
      .populate("createdBy", "fullName email");

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });
    }

    if (
      req.user.role === "candidate" &&
      exam.assignedCandidates.length > 0 &&
      !exam.assignedCandidates.some(
        (candidate) => candidate._id.toString() === req.user._id.toString()
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this exam"
      });
    }

    res.json({
      success: true,
      exam
    });
  } catch (error) {
    next(error);
  }
};

exports.updateExam = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID"
      });
    }

    const allowed = [
      "name", "type", "subject", "duration", "totalQuestions",
      "passingMarks", "questions", "assignedCandidates",
      "startTime", "endTime", "status"
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.questions !== undefined) {
      if (!validObjectIds(updates.questions)) {
        return res.status(400).json({
          success: false,
          message: "Invalid question ID"
        });
      }

      const count = await Question.countDocuments({
        _id: { $in: updates.questions }
      });

      if (count !== updates.questions.length) {
        return res.status(400).json({
          success: false,
          message: "One or more question IDs do not exist"
        });
      }
    }

    if (updates.assignedCandidates !== undefined && !validObjectIds(updates.assignedCandidates)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID"
      });
    }

    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });
    }

    res.json({
      success: true,
      message: "Exam updated",
      exam
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteExam = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID"
      });
    }

    const exam = await Exam.findByIdAndDelete(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });
    }

    await Attempt.deleteMany({ exam: exam._id });

    res.json({
      success: true,
      message: "Exam and related attempts deleted"
    });
  } catch (error) {
    next(error);
  }
};

exports.startExam = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID"
      });
    }

    const exam = await Exam.findById(id).populate(
      "questions",
      "questionText options subject difficulty marks negativeMarks"
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });
    }

    if (exam.status !== "active") {
      return res.status(400).json({
        success: false,
        message: `Exam is ${exam.status}, not active`
      });
    }

    if (
      exam.assignedCandidates.length > 0 &&
      !exam.assignedCandidates.some(
        (candidate) => candidate.toString() === req.user._id.toString()
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this exam"
      });
    }

    const existing = await Attempt.findOne({
      exam: id,
      candidate: req.user._id
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already started or submitted this exam",
        attemptId: existing._id
      });
    }

    const attempt = await Attempt.create({
      exam: id,
      candidate: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Exam started",
      attemptId: attempt._id,
      duration: exam.duration,
      questions: exam.questions
    });
  } catch (error) {
    next(error);
  }
};
