const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    message: { type: String, default: "" },
    type: { type: String, default: "general" },
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    fromUsername: { type: String, default: "" },
    read: { type: Boolean, default: false },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    username: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    profilePicture: { type: String, default: "" },
    profilePicturePublicId: { type: String, default: "" },

    isPrivate: { type: Boolean, default: false },

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    notifications: [notificationSchema],

    streak: { type: Number, default: 0 },
    lastWorkoutDate: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);