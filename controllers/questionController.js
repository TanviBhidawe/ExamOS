const mongoose = require("mongoose");
const Question = require("../models/Question");

exports.createQuestion = async (req, res, next) => {
  try {
    const { questionText, options, correctAnswer, subject, difficulty, marks, negativeMarks } = req.body;

    if (!questionText || !Array.isArray(options) || options.length !== 4 || !correctAnswer || !subject) {
      return res.status(400).json({
        success: false,
        message: "questionText, 4 options, correctAnswer and subject are required"
      });
    }

    if (!options.includes(correctAnswer)) {
      return res.status(400).json({
        success: false,
        message: "correctAnswer must match one of the options"
      });
    }

    const question = await Question.create({
      questionText,
      options,
      correctAnswer,
      subject,
      difficulty,
      marks,
      negativeMarks,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Question created",
      question
    });
  } catch (error) {
    next(error);
  }
};

exports.getQuestions = async (req, res, next) => {
  try {
    const { search, subject, difficulty } = req.query;

    const filter = {};

    if (search) {
      filter.questionText = { $regex: search, $options: "i" };
    }

    if (subject) filter.subject = subject;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.find(filter)
      .select("-correctAnswer")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: questions.length,
      questions
    });
  } catch (error) {
    next(error);
  }
};

exports.getQuestionById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID"
      });
    }

    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    res.json({ success: true, question });
  } catch (error) {
    next(error);
  }
};

exports.updateQuestion = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID"
      });
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    res.json({
      success: true,
      message: "Question updated",
      question
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteQuestion = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID"
      });
    }

    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    res.json({
      success: true,
      message: "Question deleted"
    });
  } catch (error) {
    next(error);
  }
};
