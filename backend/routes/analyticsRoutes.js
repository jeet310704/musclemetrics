const express = require("express");
const Workout = require("../models/Workout");

const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const workouts = await Workout.find({ userId }).sort({ createdAt: 1 });

    const totalWorkouts = workouts.length;

    const totalVolume = workouts.reduce((sum, workout) => {
      return sum + Number(workout.volume || 0);
    }, 0);

    const totalPoints = workouts.reduce((sum, workout) => {
      return sum + Number(workout.points || 0);
    }, 0);

    const muscleMap = {};
    const exerciseMap = {};
    const weeklyMap = {};
    const monthlyMap = {};

    workouts.forEach((workout) => {
      const muscle = workout.muscleGroup || "Other";
      const exercise = workout.exercise || "Unknown Exercise";

      if (!muscleMap[muscle]) {
        muscleMap[muscle] = {
          muscleGroup: muscle,
          workouts: 0,
          volume: 0,
          points: 0,
        };
      }

      muscleMap[muscle].workouts += 1;
      muscleMap[muscle].volume += Number(workout.volume || 0);
      muscleMap[muscle].points += Number(workout.points || 0);

      if (!exerciseMap[exercise]) {
        exerciseMap[exercise] = {
          exercise,
          muscleGroup: muscle,
          workouts: 0,
          volume: 0,
          bestWeight: 0,
          bestVolume: 0,
        };
      }

      exerciseMap[exercise].workouts += 1;
      exerciseMap[exercise].volume += Number(workout.volume || 0);
      exerciseMap[exercise].bestWeight = Math.max(
        exerciseMap[exercise].bestWeight,
        Number(workout.weight || 0)
      );
      exerciseMap[exercise].bestVolume = Math.max(
        exerciseMap[exercise].bestVolume,
        Number(workout.volume || 0)
      );

      const date = new Date(workout.createdAt);

      const weekKey = `${date.getFullYear()}-W${Math.ceil(
        (date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) /
          7
      )}`;

      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!weeklyMap[weekKey]) {
        weeklyMap[weekKey] = {
          period: weekKey,
          workouts: 0,
          volume: 0,
          points: 0,
        };
      }

      weeklyMap[weekKey].workouts += 1;
      weeklyMap[weekKey].volume += Number(workout.volume || 0);
      weeklyMap[weekKey].points += Number(workout.points || 0);

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          period: monthKey,
          workouts: 0,
          volume: 0,
          points: 0,
        };
      }

      monthlyMap[monthKey].workouts += 1;
      monthlyMap[monthKey].volume += Number(workout.volume || 0);
      monthlyMap[monthKey].points += Number(workout.points || 0);
    });

    const muscleBreakdown = Object.values(muscleMap).sort(
      (a, b) => b.volume - a.volume
    );

    const exerciseBreakdown = Object.values(exerciseMap).sort(
      (a, b) => b.volume - a.volume
    );

    const weeklyTrend = Object.values(weeklyMap);
    const monthlyTrend = Object.values(monthlyMap);

    const strongestExercise =
      exerciseBreakdown.length > 0 ? exerciseBreakdown[0] : null;

    const mostTrainedMuscle =
      muscleBreakdown.length > 0 ? muscleBreakdown[0] : null;

    const weakestMuscle =
      muscleBreakdown.length > 0
        ? muscleBreakdown[muscleBreakdown.length - 1]
        : null;

    const averageVolume =
      totalWorkouts > 0 ? Math.round(totalVolume / totalWorkouts) : 0;

    const averagePoints =
      totalWorkouts > 0 ? Math.round(totalPoints / totalWorkouts) : 0;

    const insights = [];

    if (mostTrainedMuscle) {
      insights.push({
        type: "Most Trained Muscle",
        title: mostTrainedMuscle.muscleGroup,
        description: `You train ${mostTrainedMuscle.muscleGroup} the most with ${mostTrainedMuscle.workouts} workouts.`,
        icon: "💪",
      });
    }

    if (weakestMuscle && muscleBreakdown.length > 1) {
      insights.push({
        type: "Least Trained Muscle",
        title: weakestMuscle.muscleGroup,
        description: `${weakestMuscle.muscleGroup} has the lowest training volume. Consider adding more work here.`,
        icon: "⚖️",
      });
    }

    if (strongestExercise) {
      insights.push({
        type: "Strongest Exercise",
        title: strongestExercise.exercise,
        description: `Your top exercise by volume is ${strongestExercise.exercise}.`,
        icon: "🏆",
      });
    }

    if (averageVolume > 0) {
      insights.push({
        type: "Average Volume",
        title: averageVolume.toLocaleString(),
        description: `Your average workout volume is ${averageVolume.toLocaleString()}.`,
        icon: "📊",
      });
    }

    res.json({
      summary: {
        totalWorkouts,
        totalVolume,
        totalPoints,
        averageVolume,
        averagePoints,
        trackedMuscles: muscleBreakdown.length,
        trackedExercises: exerciseBreakdown.length,
      },
      muscleBreakdown,
      exerciseBreakdown,
      weeklyTrend,
      monthlyTrend,
      insights,
    });
  } catch (error) {
    console.log("ANALYTICS ERROR:", error.message);

    res.status(500).json({
      message: "Error loading analytics.",
      error: error.message,
    });
  }
});

module.exports = router;