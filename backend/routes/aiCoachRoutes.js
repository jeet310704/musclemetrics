const express = require("express");
const Workout = require("../models/Workout");
const User = require("../models/User");

const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("streak username name email");
    const workouts = await Workout.find({ userId }).sort({ createdAt: -1 });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const totalWorkouts = workouts.length;

    if (totalWorkouts === 0) {
      return res.json({
        summary: {
          totalWorkouts: 0,
          streak: user.streak || 0,
        },
        recommendations: [
          {
            type: "Starter Plan",
            title: "Start with 3 workouts this week",
            message:
              "Log 3 simple workouts this week: Push, Pull, and Legs. Keep the weight comfortable and focus on consistency.",
            priority: "high",
          },
        ],
        nextWorkout: {
          title: "Beginner Full Body",
          exercises: [
            "Bench Press",
            "Lat Pulldown",
            "Leg Press",
            "Shoulder Press",
            "Cable Crunch",
          ],
        },
      });
    }

    const muscleCounts = {};
    const exerciseMap = {};
    const weeklyMap = {};

    workouts.forEach((workout) => {
      const muscle = workout.muscleGroup || "Other";
      const exercise = workout.exercise || "Unknown";
      const date = new Date(workout.createdAt);
      const weekKey = `${date.getFullYear()}-${Math.ceil(
        ((date - new Date(date.getFullYear(), 0, 1)) / 86400000 + 1) / 7
      )}`;

      muscleCounts[muscle] = (muscleCounts[muscle] || 0) + 1;

      if (!exerciseMap[exercise]) {
        exerciseMap[exercise] = [];
      }

      exerciseMap[exercise].push({
        weight: Number(workout.weight || 0),
        volume: Number(workout.volume || 0),
        reps: Number(workout.reps || 0),
        sets: Number(workout.sets || 0),
        createdAt: workout.createdAt,
      });

      if (!weeklyMap[weekKey]) {
        weeklyMap[weekKey] = {
          workouts: 0,
          volume: 0,
        };
      }

      weeklyMap[weekKey].workouts += 1;
      weeklyMap[weekKey].volume += Number(workout.volume || 0);
    });

    const muscleEntries = Object.entries(muscleCounts).sort((a, b) => b[1] - a[1]);

    const strongestMuscle = muscleEntries[0]?.[0] || "None";
    const leastTrainedMuscle = muscleEntries[muscleEntries.length - 1]?.[0] || "None";

    const recommendations = [];

    if ((user.streak || 0) < 2) {
      recommendations.push({
        type: "Consistency",
        title: "Build your streak first",
        message:
          "Your first goal should be consistency. Try to log at least 3 workouts this week before worrying about heavy PRs.",
        priority: "high",
      });
    }

    if (leastTrainedMuscle !== "None" && muscleEntries.length > 1) {
      recommendations.push({
        type: "Muscle Balance",
        title: `Train ${leastTrainedMuscle} more`,
        message: `${leastTrainedMuscle} is your least trained muscle group. Add 2–3 exercises for it in your next few workouts.`,
        priority: "medium",
      });
    }

    Object.entries(exerciseMap).forEach(([exercise, sessions]) => {
      const sorted = sessions.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      if (sorted.length < 3) return;

      const lastThree = sorted.slice(-3);
      const weights = lastThree.map((s) => s.weight);
      const volumes = lastThree.map((s) => s.volume);

      const weightFlat = weights.every((w) => w === weights[0]);
      const volumeFlat = volumes.every((v) => v === volumes[0]);

      if (weightFlat && volumeFlat && weights[0] > 0) {
        recommendations.push({
          type: "Plateau Detection",
          title: `${exercise} may be plateauing`,
          message: `Your recent ${exercise} sessions look flat. Try adding 5 lbs, 1 extra rep per set, or one extra set next time.`,
          priority: "high",
        });
      } else {
        const latest = sorted[sorted.length - 1];
        const previous = sorted[sorted.length - 2];

        if (latest.weight >= previous.weight && latest.volume >= previous.volume) {
          recommendations.push({
            type: "Progressive Overload",
            title: `Push ${exercise} slightly harder`,
            message: `Your latest ${exercise} performance is stable or improving. Next time, try +5 lbs or +1 rep per set if form is good.`,
            priority: "medium",
          });
        }
      }
    });

    const recentWorkout = workouts[0];
    const recentMuscle = recentWorkout?.muscleGroup || strongestMuscle;

    const nextMuscle =
      leastTrainedMuscle !== "None" && leastTrainedMuscle !== recentMuscle
        ? leastTrainedMuscle
        : strongestMuscle === "Chest"
        ? "Back"
        : strongestMuscle === "Back"
        ? "Legs"
        : strongestMuscle === "Legs"
        ? "Chest"
        : leastTrainedMuscle;

    const exerciseSuggestions = {
      Chest: ["Bench Press", "Incline Dumbbell Press", "Cable Fly", "Dips"],
      Back: ["Lat Pulldown", "Barbell Row", "Seated Cable Row", "Face Pull"],
      Legs: ["Squat", "Leg Press", "Romanian Deadlift", "Leg Extension"],
      Shoulders: ["Overhead Press", "Lateral Raise", "Rear Delt Fly", "Shrugs"],
      Arms: ["Barbell Curl", "Hammer Curl", "Tricep Pushdown", "Skull Crushers"],
      Core: ["Cable Crunch", "Hanging Leg Raises", "Plank", "Russian Twists"],
      Cardio: ["Treadmill", "StairMaster", "Rowing", "Jump Rope"],
      FullBody: ["Clean and Press", "Kettlebell Swing", "Farmer Carry", "Burpees"],
    };

    if (recommendations.length === 0) {
      recommendations.push({
        type: "General Coaching",
        title: "Keep progressing steadily",
        message:
          "Your training looks balanced. Focus on adding small improvements each week: more reps, slightly more weight, or better control.",
        priority: "medium",
      });
    }

    res.json({
      summary: {
        totalWorkouts,
        streak: user.streak || 0,
        strongestMuscle,
        leastTrainedMuscle,
      },
      recommendations: recommendations.slice(0, 8),
      nextWorkout: {
        title: `${nextMuscle} Focus`,
        muscleGroup: nextMuscle,
        exercises: exerciseSuggestions[nextMuscle] || [
          "Bench Press",
          "Lat Pulldown",
          "Leg Press",
        ],
      },
    });
  } catch (error) {
    console.log("AI COACH ERROR:", error.message);

    res.status(500).json({
      message: "Error loading AI coach.",
      error: error.message,
    });
  }
});

module.exports = router;