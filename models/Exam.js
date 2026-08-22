const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["mock", "practice", "final"],
      default: "mock",
    },

    subject: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    duration: {
      type: Number,
      required: true,
    },

    totalQuestions: {
      type: Number,
      required: true,
    },

    totalMarks: {
      type: Number,
      required: true,
    },

    passingMarks: {
      type: Number,
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],

    assignedCandidates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    status: {
      type: String,
      enum: ["draft", "upcoming", "active", "completed"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Exam", examSchema);