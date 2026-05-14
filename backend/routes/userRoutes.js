const express = require("express");
const User = require("../models/User");
const Workout = require("../models/Workout");
const cloudinary = require("../config/cloudinary");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const getDisplayUser = (user) => ({
  _id: user._id,
  id: user._id,
  name: user.name || "",
  username: user.username || user.email?.split("@")[0] || "user",
  email: user.email || "",
  profilePicture: user.profilePicture || "",
  profilePicturePublicId: user.profilePicturePublicId || "",
  isPrivate: user.isPrivate || false,
  streak: user.streak || 0,
  lastWorkoutDate: user.lastWorkoutDate || null,
  followers: user.followers || [],
  following: user.following || [],
  friends: user.friends || [],
  notifications: user.notifications || [],
});

router.get("/:userId/profile", protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const viewerId = req.user._id;

    const user = await User.findById(userId)
      .populate("followers", "name username email profilePicture streak")
      .populate("following", "name username email profilePicture streak")
      .populate("friends", "name username email profilePicture streak");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isOwnProfile = String(viewerId) === String(userId);
    const isPrivate = user.isPrivate || false;

    const isFollower = user.followers?.some((id) => {
      return String(id._id || id) === String(viewerId);
    });

    const canViewWorkouts = !isPrivate || isOwnProfile || isFollower;

    const workouts = canViewWorkouts
      ? await Workout.find({ userId }).sort({ createdAt: -1 })
      : [];

    res.json({
      user: getDisplayUser(user),
      workouts,
      isPrivate,
      isOwnProfile,
      isFollower,
      canViewWorkouts,
    });
  } catch (error) {
    console.log("GET USER PROFILE ERROR:", error.message);
    res.status(500).json({
      message: "Error loading user profile.",
      error: error.message,
    });
  }
});

router.put("/profile-picture", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { profilePicture } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!profilePicture) {
      if (user.profilePicturePublicId) {
        await cloudinary.uploader.destroy(user.profilePicturePublicId);
      }

      user.profilePicture = "";
      user.profilePicturePublicId = "";
      await user.save();

      req.app.get("io")?.emit("profileUpdated", { userId });

      return res.json({
        message: "Profile picture removed.",
        user: getDisplayUser(user),
      });
    }

    if (user.profilePicturePublicId) {
      await cloudinary.uploader.destroy(user.profilePicturePublicId);
    }

    const uploadResult = await cloudinary.uploader.upload(profilePicture, {
      folder: "musclemetrics/profile-pictures",
      public_id: `user_${userId}_${Date.now()}`,
      overwrite: true,
      resource_type: "image",
      transformation: [
        {
          width: 500,
          height: 500,
          crop: "fill",
          gravity: "face",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    });

    user.profilePicture = uploadResult.secure_url;
    user.profilePicturePublicId = uploadResult.public_id;

    await user.save();

    req.app.get("io")?.emit("profileUpdated", { userId });

    res.json({
      message: "Profile picture updated.",
      user: getDisplayUser(user),
    });
  } catch (error) {
    console.log("PROFILE PICTURE ERROR:", error.message);
    res.status(500).json({
      message: "Error updating profile picture.",
      error: error.message,
    });
  }
});

router.put("/toggle-private", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.isPrivate = !user.isPrivate;
    await user.save();

    req.app.get("io")?.emit("profileUpdated", { userId });

    res.json({
      message: user.isPrivate
        ? "Profile set to private."
        : "Profile set to public.",
      user: getDisplayUser(user),
    });
  } catch (error) {
    console.log("TOGGLE PRIVATE ERROR:", error.message);
    res.status(500).json({
      message: "Error updating privacy.",
      error: error.message,
    });
  }
});

router.post("/follow", protect, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({
        message: "targetUserId is required.",
      });
    }

    if (String(currentUserId) === String(targetUserId)) {
      return res.status(400).json({
        message: "You cannot follow yourself.",
      });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (!Array.isArray(currentUser.following)) currentUser.following = [];
    if (!Array.isArray(targetUser.followers)) targetUser.followers = [];
    if (!Array.isArray(targetUser.notifications)) targetUser.notifications = [];

    const currentUsername =
      currentUser.username || currentUser.email?.split("@")[0] || "user";

    const alreadyFollowing = currentUser.following.some(
      (id) => String(id) === String(targetUserId)
    );

    const io = req.app.get("io");

    if (targetUser.isPrivate && !alreadyFollowing) {
      const alreadyRequested = targetUser.notifications.some((n) => {
        return (
          String(n.fromUserId || "") === String(currentUserId) &&
          n.type === "follow_request" &&
          !n.resolved
        );
      });

      if (!alreadyRequested) {
        targetUser.notifications.unshift({
          message: `@${currentUsername} requested to follow you.`,
          type: "follow_request",
          fromUserId: currentUserId,
          fromUsername: currentUsername,
          read: false,
          resolved: false,
          createdAt: new Date(),
        });

        await targetUser.save();
      }

      io?.to(String(targetUserId)).emit("newNotification", {
        message: `@${currentUsername} requested to follow you.`,
      });

      io?.emit("socialUpdated");

      return res.json({
        message: "Follow request sent.",
        requestSent: true,
        following: false,
      });
    }

    if (alreadyFollowing) {
      currentUser.following = currentUser.following.filter(
        (id) => String(id) !== String(targetUserId)
      );

      targetUser.followers = targetUser.followers.filter(
        (id) => String(id) !== String(currentUserId)
      );
    } else {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);

      targetUser.notifications.unshift({
        message: `@${currentUsername} followed you.`,
        type: "follow",
        fromUserId: currentUserId,
        fromUsername: currentUsername,
        read: false,
        createdAt: new Date(),
      });
    }

    await currentUser.save();
    await targetUser.save();

    io?.to(String(targetUserId)).emit("newNotification", {
      message: alreadyFollowing
        ? `@${currentUsername} unfollowed you.`
        : `@${currentUsername} followed you.`,
    });

    io?.emit("socialUpdated");
    io?.emit("profileUpdated", { userId: currentUserId });
    io?.emit("profileUpdated", { userId: targetUserId });

    res.json({
      message: alreadyFollowing ? "Unfollowed user." : "Followed user.",
      following: !alreadyFollowing,
      requestSent: false,
    });
  } catch (error) {
    console.log("FOLLOW ERROR:", error.message);
    res.status(500).json({
      message: "Error following user.",
      error: error.message,
    });
  }
});

router.put("/:userId/follow-request/:notificationId", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;
    const { action } = req.body;

    if (!["accept", "decline"].includes(action)) {
      return res.status(400).json({ message: "Invalid action." });
    }

    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const notification = targetUser.notifications.id(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Follow request not found." });
    }

    if (notification.type !== "follow_request") {
      return res.status(400).json({
        message: "This is not a follow request.",
      });
    }

    if (notification.resolved) {
      return res.status(400).json({
        message: "This request is already resolved.",
      });
    }

    const requesterId = notification.fromUserId;
    const requester = await User.findById(requesterId);

    if (!requester) {
      notification.resolved = true;
      notification.read = true;
      await targetUser.save();

      return res.status(404).json({
        message: "Requester user not found.",
      });
    }

    if (!Array.isArray(requester.following)) requester.following = [];
    if (!Array.isArray(targetUser.followers)) targetUser.followers = [];
    if (!Array.isArray(requester.notifications)) requester.notifications = [];

    const targetUsername =
      targetUser.username || targetUser.email?.split("@")[0] || "user";

    if (action === "accept") {
      const alreadyFollowing = requester.following.some(
        (id) => String(id) === String(userId)
      );

      const alreadyFollower = targetUser.followers.some(
        (id) => String(id) === String(requesterId)
      );

      if (!alreadyFollowing) requester.following.push(userId);
      if (!alreadyFollower) targetUser.followers.push(requesterId);

      requester.notifications.unshift({
        message: `@${targetUsername} accepted your follow request.`,
        type: "follow_request_accepted",
        fromUserId: userId,
        read: false,
        resolved: false,
        createdAt: new Date(),
      });

      notification.message = `${notification.message} Accepted.`;
    }

    if (action === "decline") {
      requester.notifications.unshift({
        message: `@${targetUsername} declined your follow request.`,
        type: "follow_request_declined",
        fromUserId: userId,
        read: false,
        resolved: false,
        createdAt: new Date(),
      });

      notification.message = `${notification.message} Declined.`;
    }

    notification.resolved = true;
    notification.read = true;

    await requester.save();
    await targetUser.save();

    const io = req.app.get("io");

    io?.to(String(requesterId)).emit("newNotification", {
      message:
        action === "accept"
          ? "Your follow request was accepted."
          : "Your follow request was declined.",
    });

    io?.to(String(userId)).emit("notificationsRead");
    io?.emit("socialUpdated");
    io?.emit("profileUpdated", { userId });
    io?.emit("profileUpdated", { userId: requesterId });

    res.json({
      message:
        action === "accept"
          ? "Follow request accepted."
          : "Follow request declined.",
    });
  } catch (error) {
    console.log("FOLLOW REQUEST ACTION ERROR:", error.message);
    res.status(500).json({
      message: "Error handling follow request.",
      error: error.message,
    });
  }
});

router.get("/:userId/notifications", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("notifications");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const notifications = [...(user.notifications || [])].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    res.json(notifications);
  } catch (error) {
    console.log("GET NOTIFICATIONS ERROR:", error.message);
    res.status(500).json({
      message: "Error loading notifications.",
      error: error.message,
    });
  }
});

router.put("/:userId/notifications/read-all", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.notifications = (user.notifications || []).map((n) => {
      n.read = true;
      return n;
    });

    await user.save();

    req.app.get("io")?.to(String(userId)).emit("notificationsRead");

    res.json({
      message: "Notifications marked as read.",
      notifications: user.notifications,
    });
  } catch (error) {
    console.log("READ ALL NOTIFICATIONS ERROR:", error.message);
    res.status(500).json({
      message: "Error updating notifications.",
      error: error.message,
    });
  }
});

module.exports = router;