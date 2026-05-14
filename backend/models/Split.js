const mongoose = require("mongoose");

const splitExerciseSchema = new mongoose.Schema(
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
      required: true,
    },
    targetReps: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const splitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    exercises: {
      type: [splitExerciseSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Split", splitSchema);