const express = require("express");
const Workout = require("../models/Workout");
const User = require("../models/User");

const router = express.Router();

const buildLeaderboard = async (startDate = null) => {
  const query = startDate ? { createdAt: { $gte: startDate } } : {};

  const workouts = await Workout.find(query).populate(
    "userId",
    "name username email profilePicture streak isPrivate"
  );

  const userMap = new Map();

  workouts.forEach((workout) => {
    if (!workout.userId) return;

    const user = workout.userId;
    const userId = user._id.toString();

    if (!userMap.has(userId)) {
      userMap.set(userId, {
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture || "",
          streak: user.streak || 0,
          isPrivate: user.isPrivate || false,
        },
        totalWorkouts: 0,
        totalPoints: 0,
        totalVolume: 0,
        muscleGroups: {},
      });
    }

    const entry = userMap.get(userId);

    entry.totalWorkouts += 1;
    entry.totalPoints += Number(workout.points || 0);
    entry.totalVolume += Number(workout.volume || 0);

    if (workout.muscleGroup) {
      entry.muscleGroups[workout.muscleGroup] =
        (entry.muscleGroups[workout.muscleGroup] || 0) + 1;
    }
  });

  const leaderboard = Array.from(userMap.values()).map((entry) => {
    const favoriteMuscle =
      Object.keys(entry.muscleGroups).sort(
        (a, b) => entry.muscleGroups[b] - entry.muscleGroups[a]
      )[0] || "None";

    return {
      ...entry,
      favoriteMuscle,
    };
  });

  leaderboard.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }

    if (b.totalVolume !== a.totalVolume) {
      return b.totalVolume - a.totalVolume;
    }

    return b.totalWorkouts - a.totalWorkouts;
  });

  return leaderboard.map((entry, index) => ({
    rank: index + 1,
    ...entry,
  }));
};

router.get("/", async (req, res) => {
  try {
    const now = new Date();

    const weeklyStart = new Date(now);
    weeklyStart.setDate(now.getDate() - 7);
    weeklyStart.setHours(0, 0, 0, 0);

    const monthlyStart = new Date(now);
    monthlyStart.setDate(now.getDate() - 30);
    monthlyStart.setHours(0, 0, 0, 0);

    const [weekly, monthly, allTime] = await Promise.all([
      buildLeaderboard(weeklyStart),
      buildLeaderboard(monthlyStart),
      buildLeaderboard(null),
    ]);

    const totalUsers = await User.countDocuments();
    const totalWorkouts = await Workout.countDocuments();

    res.json({
      weekly,
      monthly,
      allTime,
      summary: {
        totalUsers,
        totalWorkouts,
      },
    });
  } catch (error) {
    console.log("LEADERBOARD ERROR:", error.message);

    res.status(500).json({
      message: "Error loading leaderboard.",
      error: error.message,
    });
  }
});

module.exports = router;