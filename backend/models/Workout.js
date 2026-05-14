const mongoose = require("mongoose");

const setDetailSchema = new mongoose.Schema(
  {
    setNumber: Number,
    reps: Number,
    weight: Number,
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    username: String,
    text: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const workoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    splitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Split",
      default: null,
    },

    splitName: {
      type: String,
      default: "No Split",
    },

    exercise: {
      type: String,
      required: true,
    },

    muscleGroup: {
      type: String,
      required: true,
    },

    sets: {
      type: Number,
      required: true,
    },

    reps: {
      type: Number,
      required: true,
    },

    weight: {
      type: Number,
      required: true,
    },

    setDetails: {
      type: [setDetailSchema],
      default: [],
    },

    duration: {
      type: Number,
      required: true,
    },

    volume: {
      type: Number,
      required: true,
    },

    points: {
      type: Number,
      required: true,
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    comments: {
      type: [commentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workout", workoutSchema);