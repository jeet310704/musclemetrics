const mongoose = require("mongoose");

const templateExerciseSchema = new mongoose.Schema(
  {
    muscleGroup: {
      type: String,
      required: true,
    },

    exercise: {
      type: String,
      required: true,
    },

    targetSets: {
      type: Number,
      default: 3,
    },

    targetReps: {
      type: Number,
      default: 10,
    },

    targetWeight: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const templateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    notes: {
      type: String,
      default: "",
    },

    exercises: {
      type: [templateExerciseSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Template", templateSchema);