const express = require("express");
const User = require("../models/User");
const Workout = require("../models/Workout");

const router = express.Router();

const getDateKey = (date) => {
  return new Date(date).toISOString().split("T")[0];
};

const getStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const getStartOfWeek = () => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
};

const calculateCurrentStreak = (workoutDates) => {
  if (workoutDates.length === 0) return 0;

  const uniqueDates = Array.from(new Set(workoutDates)).sort().reverse();

  let streak = 0;
  const today = getStartOfToday();

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);

    const key = getDateKey(checkDate);

    if (uniqueDates.includes(key)) {
      streak += 1;
    } else if (i === 0) {
      continue;
    } else {
      break;
    }
  }

  return streak;
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

    const workoutDateKeys = workouts.map((workout) =>
      getDateKey(workout.createdAt)
    );

    const uniqueWorkoutDates = Array.from(new Set(workoutDateKeys));

    const calculatedStreak = calculateCurrentStreak(uniqueWorkoutDates);

    const startOfWeek = getStartOfWeek();

    const weeklyWorkouts = workouts.filter((workout) => {
      return new Date(workout.createdAt) >= startOfWeek;
    });

    const weeklyGoal = 4;
    const weeklyProgress = Math.min(weeklyWorkouts.length, weeklyGoal);

    const totalWorkouts = workouts.length;

    const totalPoints = workouts.reduce((sum, workout) => {
      return sum + Number(workout.points || 0);
    }, 0);

    const totalVolume = workouts.reduce((sum, workout) => {
      return sum + Number(workout.volume || 0);
    }, 0);

    const level = Math.floor(totalPoints / 500) + 1;
    const xpIntoLevel = totalPoints % 500;
    const xpForNextLevel = 500;

    const badges = [
      {
        id: "first_day",
        title: "First Day",
        icon: "🏁",
        description: "Log your first workout.",
        unlocked: totalWorkouts >= 1,
        progress: Math.min(totalWorkouts, 1),
        target: 1,
      },
      {
        id: "three_streak",
        title: "3-Day Fire",
        icon: "🔥",
        description: "Hit a 3-day streak.",
        unlocked: calculatedStreak >= 3,
        progress: Math.min(calculatedStreak, 3),
        target: 3,
      },
      {
        id: "seven_streak",
        title: "Week Warrior",
        icon: "⚡",
        description: "Hit a 7-day streak.",
        unlocked: calculatedStreak >= 7,
        progress: Math.min(calculatedStreak, 7),
        target: 7,
      },
      {
        id: "weekly_goal",
        title: "Weekly Goal",
        icon: "🗓️",
        description: "Complete 4 workouts this week.",
        unlocked: weeklyWorkouts.length >= weeklyGoal,
        progress: weeklyProgress,
        target: weeklyGoal,
      },
      {
        id: "ten_workouts",
        title: "10 Sessions",
        icon: "💪",
        description: "Log 10 workouts.",
        unlocked: totalWorkouts >= 10,
        progress: Math.min(totalWorkouts, 10),
        target: 10,
      },
      {
        id: "fifty_workouts",
        title: "50 Sessions",
        icon: "👑",
        description: "Log 50 workouts.",
        unlocked: totalWorkouts >= 50,
        progress: Math.min(totalWorkouts, 50),
        target: 50,
      },
      {
        id: "volume_beast",
        title: "Volume Beast",
        icon: "🦍",
        description: "Reach 100,000 total volume.",
        unlocked: totalVolume >= 100000,
        progress: Math.min(totalVolume, 100000),
        target: 100000,
      },
      {
        id: "level_five",
        title: "Level 5",
        icon: "⭐",
        description: "Reach level 5.",
        unlocked: level >= 5,
        progress: Math.min(level, 5),
        target: 5,
      },
    ];

    const calendar = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const key = getDateKey(date);

      calendar.push({
        date: key,
        completed: uniqueWorkoutDates.includes(key),
      });
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture || "",
      },
      stats: {
        currentStreak: calculatedStreak,
        storedStreak: user.streak || 0,
        lastWorkoutDate: user.lastWorkoutDate,
        weeklyGoal,
        weeklyProgress,
        totalWorkouts,
        totalPoints,
        totalVolume,
        level,
        xpIntoLevel,
        xpForNextLevel,
        unlockedBadges: badges.filter((badge) => badge.unlocked).length,
        totalBadges: badges.length,
      },
      badges,
      calendar,
    });
  } catch (error) {
    console.log("STREAK ROUTE ERROR:", error.message);

    res.status(500).json({
      message: "Error loading streak system.",
      error: error.message,
    });
  }
});

module.exports = router;