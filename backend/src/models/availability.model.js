const mongoose = require("mongoose");
const { Schema } = mongoose;

// 🔹 Slot sub-schema
const slotSchema = new Schema(
  {
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

    isBooked: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

// 🔹 Main availability schema
const availabilitySchema = new Schema(
  {
    developerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    slots: {
      type: [slotSchema],
      validate: {
        validator: function (slots) {
          return slots.length > 0;
        },
        message: "At least one slot is required",
      },
    },
  },
  { timestamps: true },
);

// 🔥 Prevent duplicate availability for same developer + date
availabilitySchema.index({ developerId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Availability", availabilitySchema);
