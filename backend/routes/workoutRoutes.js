const express = require("express");
const Workout = require("../models/Workout");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const getDateKey = (date) => {
  return new Date(date).toISOString().split("T")[0];
};

const calculatePoints = (workout) => {
  const sets = Number(workout.sets || 0);
  const reps = Number(workout.reps || 0);
  const weight = Number(workout.weight || 0);
  const volume = sets * reps * weight;

  let points = sets * 10;

  if (volume > 0) {
    points += Math.floor(volume / 100);
  }

  return points;
};

const updateUserStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const todayKey = getDateKey(new Date());
  const lastWorkoutKey = user.lastWorkoutDate
    ? getDateKey(user.lastWorkoutDate)
    : null;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getDateKey(yesterday);

  if (lastWorkoutKey === todayKey) return user;

  if (lastWorkoutKey === yesterdayKey) {
    user.streak = Number(user.streak || 0) + 1;
  } else {
    user.streak = 1;
  }

  user.lastWorkoutDate = new Date();
  await user.save();

  return user;
};

router.post("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      splitId,
      splitName,
      exercise,
      muscleGroup,
      sets,
      reps,
      weight,
      setDetails,
      duration,
    } = req.body;

    if (!exercise || !muscleGroup) {
      return res.status(400).json({
        message: "Exercise and muscle group are required.",
      });
    }

    const cleanSets = Number(sets || 1);
    const cleanReps = Number(reps || 1);
    const cleanWeight = Number(weight || 0);
    const volume = cleanSets * cleanReps * cleanWeight;

    const workoutData = {
      userId,
      splitId: splitId || null,
      splitName: splitName || "No Split",
      exercise,
      muscleGroup,
      sets: cleanSets,
      reps: cleanReps,
      weight: cleanWeight,
      setDetails: Array.isArray(setDetails) ? setDetails : [],
      duration: Number(duration || 1),
      volume,
    };

    workoutData.points = calculatePoints(workoutData);

    const workout = new Workout(workoutData);
    const savedWorkout = await workout.save();

    await updateUserStreak(userId);

    const io = req.app.get("io");

    if (io) {
      io.emit("workoutLogged", {
        userId,
        workout: savedWorkout,
      });

      io.emit("leaderboardUpdated");
      io.emit("feedUpdated");
      io.emit("analyticsUpdated");
    }

    res.status(201).json(savedWorkout);
  } catch (error) {
    console.log("CREATE WORKOUT ERROR:", error.message);

    res.status(500).json({
      message: "Error saving workout.",
      error: error.message,
    });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    const workouts = await Workout.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(workouts);
  } catch (error) {
    console.log("GET MY WORKOUTS ERROR:", error.message);

    res.status(500).json({
      message: "Error loading workouts.",
      error: error.message,
    });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const workouts = await Workout.find({
      userId: req.params.userId,
    }).sort({ createdAt: -1 });

    res.json(workouts);
  } catch (error) {
    console.log("GET WORKOUTS ERROR:", error.message);

    res.status(500).json({
      message: "Error loading workouts.",
      error: error.message,
    });
  }
});

router.delete("/:workoutId", protect, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.workoutId);

    if (!workout) {
      return res.status(404).json({
        message: "Workout not found.",
      });
    }

    if (String(workout.userId) !== String(req.user._id)) {
      return res.status(403).json({
        message: "You can only delete your own workouts.",
      });
    }

    await Workout.findByIdAndDelete(req.params.workoutId);

    const io = req.app.get("io");

    if (io) {
      io.emit("workoutDeleted", {
        workoutId: req.params.workoutId,
      });

      io.emit("leaderboardUpdated");
      io.emit("feedUpdated");
      io.emit("analyticsUpdated");
    }

    res.json({
      message: "Workout deleted.",
    });
  } catch (error) {
    console.log("DELETE WORKOUT ERROR:", error.message);

    res.status(500).json({
      message: "Error deleting workout.",
      error: error.message,
    });
  }
});

module.exports = router;