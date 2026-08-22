import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["client", "admin"],
      default: "client",
    },

    barberId: {
      type: Number,
      default: null,
    },

    cancelCount: {
      type: Number,
      default: 0,
    },

    cancelCountMonth: {
      type: Number,
      default: null,
    },

    cancelCountYear: {
      type: Number,
      default: null,
    },

    blockedUntil: {
      type: Date,
      default: null,
    },

    resetCodeHash: {
      type: String,
      default: null,
    },

    resetCodeExpiresAt: {
      type: Date,
      default: null,
    },

    resetCodeAttempts: {
      type: Number,
      default: 0,
    },

    resetTokenHash: {
      type: String,
      default: null,
    },

    resetTokenExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", userSchema);
