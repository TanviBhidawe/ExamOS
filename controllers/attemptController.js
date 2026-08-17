const mongoose = require("mongoose");
const Attempt = require("../models/Attempt");
const Exam = require("../models/Exam");
const Question = require("../models/Question");

exports.submitAttempt = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { answers = [] } = req.body;

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID"
      });
    }

    const attempt = await Attempt.findOne({
      _id: attemptId,
      candidate: req.user._id
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found"
      });
    }

    if (attempt.submittedAt) {
      return res.status(400).json({
        success: false,
        message: "Attempt already submitted"
      });
    }

    const exam = await Exam.findById(attempt.exam);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });
    }

    const questions = await Question.find({
      _id: { $in: exam.questions }
    });

    const answerMap = new Map(
      answers.map((item) => [String(item.questionId), item.selectedAnswer])
    );

    let score = 0;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    const evaluatedAnswers = [];

    for (const question of questions) {
      const selectedAnswer = answerMap.get(String(question._id)) ?? null;

      if (!selectedAnswer) {
        skipped++;
        evaluatedAnswers.push({
          question: question._id,
          selectedAnswer: null,
          isCorrect: false,
          marksObtained: 0
        });
        continue;
      }

      const isCorrect = selectedAnswer === question.correctAnswer;

      if (isCorrect) {
        correct++;
        score += question.marks;
      } else {
        wrong++;
        score -= question.negativeMarks;
      }

      evaluatedAnswers.push({
        question: question._id,
        selectedAnswer,
        isCorrect,
        marksObtained: isCorrect ? question.marks : -question.negativeMarks
      });
    }

    score = Math.max(0, Number(score.toFixed(2)));

    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    const percentage = totalMarks
      ? Number(((score / totalMarks) * 100).toFixed(2))
      : 0;

    attempt.answers = evaluatedAnswers;
    attempt.score = score;
    attempt.correct = correct;
    attempt.wrong = wrong;
    attempt.skipped = skipped;
    attempt.percentage = percentage;
    attempt.passed = score >= exam.passingMarks;
    attempt.submittedAt = new Date();

    await attempt.save();

    res.json({
      success: true,
      message: "Exam submitted successfully",
      result: {
        attemptId: attempt._id,
        exam: exam.name,
        score,
        totalMarks,
        percentage,
        correct,
        wrong,
        skipped,
        passed: attempt.passed
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyAttempts = async (req, res, next) => {
  try {
    const attempts = await Attempt.find({
      candidate: req.user._id
    })
      .populate("exam", "name subject type totalQuestions passingMarks")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: attempts.length,
      attempts
    });
  } catch (error) {
    next(error);
  }
};

exports.getAttemptById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID"
      });
    }

    const filter =
      req.user.role === "admin"
        ? { _id: req.params.id }
        : { _id: req.params.id, candidate: req.user._id };

    const attempt = await Attempt.findOne(filter)
      .populate("exam", "name subject type passingMarks totalQuestions")
      .populate("candidate", "fullName email")
      .populate("answers.question", "questionText options");

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found"
      });
    }

    res.json({
      success: true,
      attempt
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllAttempts = async (req, res, next) => {
  try {
    const attempts = await Attempt.find()
      .populate("exam", "name subject")
      .populate("candidate", "fullName email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: attempts.length,
      attempts
    });
  } catch (error) {
    next(error);
  }
};
