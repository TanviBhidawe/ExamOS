
const Exam = require("../models/Exam");
const Result = require("../models/Result");
const User = require("../models/User");

exports.createExam = async (req, res) => {
  try {
    const exam = await Exam.create(req.body);

    res.status(201).json({
      success: true,
      message: "Exam created successfully",
      exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find().populate("questions");

    const candidateCount = await User.countDocuments({
      role: "candidate",
    });

    res.json({
      success: true,
      exams,
      candidateCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(
      req.params.id
    ).populate("questions");

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    res.json({
      success: true,
      exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    res.json({
      success: true,
      message: "Exam updated successfully",
      exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    await Exam.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.startExam = async (req, res) => {
  try {
    const exam = await Exam.findById(
      req.params.id
    ).populate("questions");

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);

    if (now < startTime) {
      return res.status(400).json({
        success: false,
        message: "Exam has not started yet",
      });
    }

    if (now > endTime) {
      return res.status(400).json({
        success: false,
        message: "Exam has already ended",
      });
    }

    if (exam.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Exam has already been completed",
      });
    }

    if (!exam.questions || exam.questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "This exam has no questions",
      });
    }

    const alreadyAttempted = await Result.findOne({
      candidate: req.user._id,
      exam: exam._id,
    });

    if (alreadyAttempted) {
      return res.status(400).json({
        success: false,
        message: "You have already attempted this exam",
      });
    }

    exam.status = "active";
    await exam.save();

    res.json({
      success: true,
      message: "Exam started successfully",
      startedAt: new Date(),
      exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.submitExam = async (req, res) => {
  try {
    const {
      answers,
      startedAt,
    } = req.body;

    const exam = await Exam.findById(
      req.params.id
    ).populate("questions");

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Answers are required",
      });
    }

    let score = 0;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    answers.forEach((answer) => {
      const question = exam.questions.find(
        (q) =>
          q._id.toString() === answer.questionId
      );

      if (!question) {
        return;
      }

      const selectedAnswer =
        answer.selectedAnswer
          ?.trim()
          .toLowerCase() || "";

      const correctAnswer =
        question.correctAnswer
          ?.trim()
          .toLowerCase() || "";

      if (!selectedAnswer) {
        skipped++;
        return;
      }

      let correctOption = correctAnswer;

      if (/^[a-d]$/.test(correctAnswer)) {
        const optionIndex =
          correctAnswer.charCodeAt(0) - 97;

        correctOption =
          question.options?.[optionIndex]
            ?.trim()
            .toLowerCase() || "";
      }

      if (selectedAnswer === correctOption) {
        correct++;
        score += question.marks || 1;
      } else {
        wrong++;
      }
    });

    const percentage =
      exam.totalMarks > 0
        ? (score / exam.totalMarks) * 100
        : 0;

    const passed =
      score >= exam.passingMarks;

    const result = await Result.create({
      candidate: req.user._id,

      exam: exam._id,

      examSnapshot: {
        name: exam.name,
        subject: exam.subject,
        type: exam.type,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
      },

      answers: answers.map((answer) => ({
        question: answer.questionId,
        selectedAnswer:
          answer.selectedAnswer || "",
      })),

      score,
      percentage,
      correct,
      wrong,
      skipped,
      passed,

      startedAt,
      submittedAt: new Date(),
    });

    exam.status = "completed";
    await exam.save();

    res.json({
      success: true,
      message: "Exam submitted successfully",
      result,
    });
  } catch (error) {
    console.error("Submit exam error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
