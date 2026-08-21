const Exam = require("../models/Exam");
const Result = require("../models/Result");

exports.createExam = async (req, res) => {
  try {
    const exam = await Exam.create(req.body);

    res.status(201).json({
      success: true,
      message: "Exam created successfully",
      exam,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find().populate("questions");

    res.json({
      success: true,
      exams,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate("questions");

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
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      message: "Exam updated successfully",
      exam,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.startExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate("questions");

    if (!exam || exam.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Exam is not active",
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

    res.json({
      success: true,
      startedAt: new Date(),
      exam,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitExam = async (req, res) => {
  try {
    const { answers, startedAt } = req.body;

    const exam = await Exam.findById(req.params.id).populate("questions");

    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    answers.forEach((answer) => {
      const question = exam.questions.find(
        (q) => q._id.toString() === answer.questionId
      );

      if (!answer.selectedAnswer) skipped++;
      else if (question.correctAnswer === answer.selectedAnswer) correct++;
      else wrong++;
    });

    const score = correct;
    const percentage = (score / exam.totalQuestions) * 100;
    const passed = score >= exam.passingMarks;

    const result = await Result.create({
      candidate: req.user._id,
      exam: exam._id,
      answers: answers.map((a) => ({
        question: a.questionId,
        selectedAnswer: a.selectedAnswer,
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

    res.json({
      success: true,
      message: "Exam submitted successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};