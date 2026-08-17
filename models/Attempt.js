const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true
    },
    selectedAnswer: {
      type: String,
      default: null
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    marksObtained: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    answers: [answerSchema],
    score: {
      type: Number,
      default: 0
    },
    correct: {
      type: Number,
      default: 0
    },
    wrong: {
      type: Number,
      default: 0
    },
    skipped: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    passed: {
      type: Boolean,
      default: false
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    submittedAt: Date
  },
  { timestamps: true }
);

attemptSchema.index({ exam: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model("Attempt", attemptSchema);
