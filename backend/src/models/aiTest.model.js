const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: String,

  options: [String], // MCQ only
  correctAnswer: String, // MCQ only

  userAnswer: String,
  aiFeedback: String,
  score: Number,
});

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["mcq", "long"],
      required: true,
    },

    role: String,

    questions: [questionSchema],

    currentQuestionIndex: {
      type: Number,
      default: 0,
    },

    totalScore: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["started", "completed"],
      default: "started",
    },

    summary: {
      strengths: String,
      weaknesses: String,
      overallFeedback: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AiTest", interviewSchema);
