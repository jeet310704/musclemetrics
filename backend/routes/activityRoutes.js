const express = require("express");
const Workout = require("../models/Workout");
const User = require("../models/User");

const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const followingIds = currentUser.following || [];

    if (followingIds.length === 0) {
      return res.json([]);
    }

    const workouts = await Workout.find({
      userId: { $in: followingIds },
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate(
        "userId",
        "name username email profilePicture streak"
      );

    const activities = workouts.map((workout) => {
      const user = workout.userId;

      let activityText = `completed a ${workout.muscleGroup} workout`;

      if (Number(workout.points || 0) >= 100) {
        activityText = `crushed a huge ${workout.muscleGroup} workout`;
      }

      if (Number(workout.volume || 0) >= 10000) {
        activityText = `moved massive weight in ${workout.muscleGroup}`;
      }

      return {
        _id: workout._id,
        type: "workout",
        createdAt: workout.createdAt,
        activityText,
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture || "",
          streak: user.streak || 0,
        },
        stats: {
          muscleGroup: workout.muscleGroup,
          points: workout.points || 0,
          volume: workout.volume || 0,
          duration: workout.duration || 0,
        },
      };
    });

    res.json(activities);
  } catch (error) {
    console.log("ACTIVITY FEED ERROR:", error.message);

    res.status(500).json({
      message: "Error loading activity feed.",
      error: error.message,
    });
  }
});

module.exports = router;