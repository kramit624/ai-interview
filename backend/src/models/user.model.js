const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["fresher", "developer"],
      default: "fresher",
      required: true,
    },

    avatar: { type: String },
    bio: { type: String },

    linkedin: { type: String },
    github: { type: String },

    achievements: {
      type: [
        {
          title: { type: String, required: true },
          description: { type: String },
          link: { type: String },
          date: { type: Date, default: Date.now },
        },
      ],
      default: undefined,
    },

    skills: {
      type: [String],
      default: undefined,
    },

    refreshToken: {
      type: String,
      default: null,
    },

    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true },
);

//  FIXED pre-save hook
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return ;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
});



module.exports = mongoose.model("User", userSchema);
