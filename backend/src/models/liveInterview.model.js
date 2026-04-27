const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["ai", "user"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const liveInterviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
    },

    messages: [messageSchema],

    status: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
    },

    summary: {
      communication: String,
      technicalDepth: String,
      strengths: String,
      weaknesses: String,
      hireRecommendation: String,
    },
  },
  { timestamps: true },
);

// 🔥 important index
liveInterviewSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("LiveInterview", liveInterviewSchema);
