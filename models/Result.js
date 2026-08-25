
const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    examSnapshot: {
      name: {
        type: String,
        required: true,
      },

      subject: {
        type: String,
        required: true,
      },

      type: {
        type: String,
        default: "",
      },

      totalMarks: {
        type: Number,
        default: 0,
      },

      passingMarks: {
        type: Number,
        default: 0,
      },
    },

    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },

        selectedAnswer: {
          type: String,
          default: "",
        },
      },
    ],

    score: {
      type: Number,
      default: 0,
    },

    percentage: {
      type: Number,
      default: 0,
    },

    correct: {
      type: Number,
      default: 0,
    },

    wrong: {
      type: Number,
      default: 0,
    },

    skipped: {
      type: Number,
      default: 0,
    },

    passed: {
      type: Boolean,
      default: false,
    },

    startedAt: Date,

    submittedAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Result", resultSchema);

