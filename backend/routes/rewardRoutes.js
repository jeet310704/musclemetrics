const express = require("express");
const User = require("../models/User");
const Workout = require("../models/Workout");

const router = express.Router();

const getBadgeStatus = ({ streak, totalWorkouts, totalPoints, weeklyWorkouts }) => {
  return [
    {
      id: "first_workout",
      title: "First Workout",
      description: "Log your first workout.",
      icon: "🏁",
      unlocked: totalWorkouts >= 1,
      progress: Math.min(totalWorkouts, 1),
      target: 1,
    },
    {
      id: "three_day_streak",
      title: "3 Day Streak",
      description: "Train 3 days in a row.",
      icon: "🔥",
      unlocked: streak >= 3,
      progress: Math.min(streak, 3),
      target: 3,
    },
    {
      id: "seven_day_streak",
      title: "7 Day Streak",
      description: "Train 7 days in a row.",
      icon: "⚡",
      unlocked: streak >= 7,
      progress: Math.min(streak, 7),
      target: 7,
    },
    {
      id: "ten_workouts",
      title: "10 Workouts",
      description: "Log 10 total workouts.",
      icon: "💪",
      unlocked: totalWorkouts >= 10,
      progress: Math.min(totalWorkouts, 10),
      target: 10,
    },
    {
      id: "twenty_five_workouts",
      title: "25 Workouts",
      description: "Log 25 total workouts.",
      icon: "🏋️",
      unlocked: totalWorkouts >= 25,
      progress: Math.min(totalWorkouts, 25),
      target: 25,
    },
    {
      id: "hundred_workouts",
      title: "100 Workouts",
      description: "Log 100 total workouts.",
      icon: "👑",
      unlocked: totalWorkouts >= 100,
      progress: Math.min(totalWorkouts, 100),
      target: 100,
    },
    {
      id: "weekly_warrior",
      title: "Weekly Warrior",
      description: "Log 4 workouts this week.",
      icon: "🗓️",
      unlocked: weeklyWorkouts >= 4,
      progress: Math.min(weeklyWorkouts, 4),
      target: 4,
    },
    {
      id: "point_collector",
      title: "Point Collector",
      description: "Reach 1,000 total points.",
      icon: "⭐",
      unlocked: totalPoints >= 1000,
      progress: Math.min(totalPoints, 1000),
      target: 1000,
    },
  ];
};

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
      "name username email profilePicture streak lastWorkoutDate"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const workouts = await Workout.find({ userId }).sort({ createdAt: -1 });

    const totalWorkouts = workouts.length;

    const totalPoints = workouts.reduce((sum, workout) => {
      return sum + Number(workout.points || 0);
    }, 0);

    const totalVolume = workouts.reduce((sum, workout) => {
      return sum + Number(workout.volume || 0);
    }, 0);

    const now = new Date();

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyWorkouts = workouts.filter((workout) => {
      return new Date(workout.createdAt) >= startOfWeek;
    }).length;

    const streak = Number(user.streak || 0);

    const badges = getBadgeStatus({
      streak,
      totalWorkouts,
      totalPoints,
      weeklyWorkouts,
    });

    const unlockedBadges = badges.filter((badge) => badge.unlocked).length;

    let nextGoal = badges.find((badge) => !badge.unlocked) || null;

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture || "",
      },
      stats: {
        streak,
        totalWorkouts,
        totalPoints,
        totalVolume,
        weeklyWorkouts,
        unlockedBadges,
        totalBadges: badges.length,
        lastWorkoutDate: user.lastWorkoutDate,
      },
      badges,
      nextGoal,
    });
  } catch (error) {
    console.log("GET REWARDS ERROR:", error.message);

    res.status(500).json({
      message: "Error loading rewards.",
      error: error.message,
    });
  }
});

module.exports = router;