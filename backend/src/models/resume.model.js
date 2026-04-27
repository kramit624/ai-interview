const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resumeUrl: {
      type: String,
      required: true,
    },

    rawText: {
      type: String,
    },

    structuredData: {
      skills: [String],
      projects: [
        {
          _id: false,
          name: String,
          description: String,
        },
      ],
      experience: String,
      education: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Resume", resumeSchema);
