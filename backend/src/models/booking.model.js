const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    fresherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    developerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
      trim: true,
    },

    endTime: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
    cancelledBy: {
      type: String,
      enum: ["fresher", "developer"],
    },
  },
  { timestamps: true },
);

// 🔥 Optional but useful index for faster queries
bookingSchema.index({ fresherId: 1 });
bookingSchema.index({ developerId: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
