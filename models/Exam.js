const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["competitive", "internal", "mock", "aptitude"],
      default: "mock"
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: Number,
      required: true,
      min: 1
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1
    },
    passingMarks: {
      type: Number,
      required: true,
      min: 0
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
      }
    ],
    assignedCandidates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    startTime: Date,
    endTime: Date,
    status: {
      type: String,
      enum: ["draft", "upcoming", "active", "completed"],
      default: "draft"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exam", examSchema);
