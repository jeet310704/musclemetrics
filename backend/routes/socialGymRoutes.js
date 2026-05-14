const express = require("express");
const User = require("../models/User");
const Workout = require("../models/Workout");

const router = express.Router();

const getDateKey = (date) => {
  return new Date(date).toISOString().split("T")[0];
};

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const currentUser = await User.findById(userId)
      .populate("following", "name username email profilePicture streak")
      .populate("followers", "name username email profilePicture streak")
      .populate("friends", "name username email profilePicture streak");

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const followingIds = (currentUser.following || []).map((user) => user._id);
    const friendIds = (currentUser.friends || []).map((user) => user._id);

    const socialUserIds = Array.from(
      new Set([...followingIds, ...friendIds].map((id) => id.toString()))
    );

    const todayKey = getDateKey(new Date());

    const recentFriendWorkouts = await Workout.find({
      userId: { $in: socialUserIds },
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate("userId", "name username email profilePicture streak");

    const todayWorkouts = recentFriendWorkouts.filter((workout) => {
      return getDateKey(workout.createdAt) === todayKey;
    });

    const weeklyStart = new Date();
    weeklyStart.setDate(weeklyStart.getDate() - 7);
    weeklyStart.setHours(0, 0, 0, 0);

    const weeklyWorkouts = await Workout.find({
      userId: { $in: socialUserIds },
      createdAt: { $gte: weeklyStart },
    }).populate("userId", "name username email profilePicture streak");

    const friendStatsMap = new Map();

    [...(currentUser.following || []), ...(currentUser.friends || [])].forEach(
      (user) => {
        friendStatsMap.set(user._id.toString(), {
          user: {
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture || "",
            streak: user.streak || 0,
          },
          weeklyWorkouts: 0,
          weeklyVolume: 0,
          weeklyPoints: 0,
          trainedToday: false,
          favoriteMuscle: "None",
          muscleCounts: {},
        });
      }
    );

    weeklyWorkouts.forEach((workout) => {
      if (!workout.userId) return;

      const id = workout.userId._id.toString();

      if (!friendStatsMap.has(id)) return;

      const entry = friendStatsMap.get(id);

      entry.weeklyWorkouts += 1;
      entry.weeklyVolume += Number(workout.volume || 0);
      entry.weeklyPoints += Number(workout.points || 0);

      if (getDateKey(workout.createdAt) === todayKey) {
        entry.trainedToday = true;
      }

      if (workout.muscleGroup) {
        entry.muscleCounts[workout.muscleGroup] =
          (entry.muscleCounts[workout.muscleGroup] || 0) + 1;
      }
    });

    const friendStats = Array.from(friendStatsMap.values()).map((entry) => {
      const favoriteMuscle =
        Object.keys(entry.muscleCounts).sort(
          (a, b) => entry.muscleCounts[b] - entry.muscleCounts[a]
        )[0] || "None";

      return {
        ...entry,
        favoriteMuscle,
      };
    });

    friendStats.sort((a, b) => {
      if (b.weeklyPoints !== a.weeklyPoints) {
        return b.weeklyPoints - a.weeklyPoints;
      }

      return b.weeklyWorkouts - a.weeklyWorkouts;
    });

    const activityCards = recentFriendWorkouts.map((workout) => {
      const user = workout.userId;

      let headline = "completed a workout";

      if (Number(workout.volume || 0) >= 10000) {
        headline = "moved serious weight";
      }

      if (Number(workout.points || 0) >= 100) {
        headline = "crushed a high-point workout";
      }

      return {
        _id: workout._id,
        headline,
        createdAt: workout.createdAt,
        user: user
          ? {
              _id: user._id,
              name: user.name,
              username: user.username,
              email: user.email,
              profilePicture: user.profilePicture || "",
              streak: user.streak || 0,
            }
          : null,
        workout: {
          exercise: workout.exercise,
          muscleGroup: workout.muscleGroup,
          sets: workout.sets,
          reps: workout.reps,
          weight: workout.weight,
          volume: workout.volume,
          points: workout.points,
        },
      };
    });

    res.json({
      summary: {
        followingCount: currentUser.following?.length || 0,
        followersCount: currentUser.followers?.length || 0,
        friendsCount: currentUser.friends?.length || 0,
        trainedTodayCount: todayWorkouts.length,
        weeklySocialWorkouts: weeklyWorkouts.length,
      },
      friendStats,
      activityCards,
    });
  } catch (error) {
    console.log("SOCIAL GYM ERROR:", error.message);

    res.status(500).json({
      message: "Error loading gym social data.",
      error: error.message,
    });
  }
});

module.exports = router;