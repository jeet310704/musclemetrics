const express = require("express");
const Workout = require("../models/Workout");

const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const workouts = await Workout.find({ userId }).sort({ createdAt: 1 });

    const exerciseMap = new Map();

    workouts.forEach((workout) => {
      const exerciseName = workout.exercise || "Unknown Exercise";

      if (!exerciseMap.has(exerciseName)) {
        exerciseMap.set(exerciseName, {
          exercise: exerciseName,
          muscleGroup: workout.muscleGroup || "Other",
          sessions: [],
          bestWeight: 0,
          bestVolume: 0,
          totalVolume: 0,
          totalSessions: 0,
        });
      }

      const entry = exerciseMap.get(exerciseName);

      const volume = Number(workout.volume || 0);
      const weight = Number(workout.weight || 0);
      const sets = Number(workout.sets || 0);
      const reps = Number(workout.reps || 0);

      entry.sessions.push({
        workoutId: workout._id,
        date: workout.createdAt,
        weight,
        volume,
        sets,
        reps,
        points: Number(workout.points || 0),
        setDetails: workout.setDetails || [],
      });

      entry.bestWeight = Math.max(entry.bestWeight, weight);
      entry.bestVolume = Math.max(entry.bestVolume, volume);
      entry.totalVolume += volume;
      entry.totalSessions += 1;
    });

    const exercises = Array.from(exerciseMap.values()).map((entry) => {
      const latestSession = entry.sessions[entry.sessions.length - 1] || null;
      const firstSession = entry.sessions[0] || null;

      const weightChange =
        latestSession && firstSession
          ? Number(latestSession.weight || 0) - Number(firstSession.weight || 0)
          : 0;

      const volumeChange =
        latestSession && firstSession
          ? Number(latestSession.volume || 0) - Number(firstSession.volume || 0)
          : 0;

      return {
        ...entry,
        latestSession,
        firstSession,
        weightChange,
        volumeChange,
      };
    });

    exercises.sort((a, b) => b.totalVolume - a.totalVolume);

    const totalWorkouts = workouts.length;

    const totalVolume = workouts.reduce((sum, workout) => {
      return sum + Number(workout.volume || 0);
    }, 0);

    const totalPoints = workouts.reduce((sum, workout) => {
      return sum + Number(workout.points || 0);
    }, 0);

    const bestOverallWeight = workouts.reduce((best, workout) => {
      return Math.max(best, Number(workout.weight || 0));
    }, 0);

    const recentWorkouts = workouts.slice(-7).reverse();

    const volumeByDateMap = new Map();

    workouts.forEach((workout) => {
      const dateKey = new Date(workout.createdAt).toISOString().split("T")[0];

      volumeByDateMap.set(
        dateKey,
        (volumeByDateMap.get(dateKey) || 0) + Number(workout.volume || 0)
      );
    });

    const volumeTrend = Array.from(volumeByDateMap.entries()).map(
      ([date, volume]) => ({
        date,
        volume,
      })
    );

    res.json({
      summary: {
        totalWorkouts,
        totalVolume,
        totalPoints,
        bestOverallWeight,
        trackedExercises: exercises.length,
      },
      exercises,
      recentWorkouts,
      volumeTrend,
    });
  } catch (error) {
    console.log("PROGRESS ROUTE ERROR:", error.message);

    res.status(500).json({
      message: "Error loading progress data.",
      error: error.message,
    });
  }
});

module.exports = router;