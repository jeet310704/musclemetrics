const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.get("/search/:query/:userId", async (req, res) => {
  try {
    const { query, userId } = req.params;

    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { username: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
      ],
    }).select("name username email friends friendRequestsReceived friendRequestsSent");

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Error searching users.",
      error: error.message,
    });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("friends", "name username email")
      .populate("friendRequestsReceived", "name username email")
      .populate("friendRequestsSent", "name username email");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({
      friends: user.friends,
      received: user.friendRequestsReceived,
      sent: user.friendRequestsSent,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching friends.",
      error: error.message,
    });
  }
});

router.post("/request", async (req, res) => {
  try {
    const { fromUserId, toUserId } = req.body;

    if (fromUserId === toUserId) {
      return res.status(400).json({ message: "You cannot add yourself." });
    }

    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);

    if (!fromUser || !toUser) {
      return res.status(404).json({ message: "User not found." });
    }

    if (fromUser.friends.some((id) => id.toString() === toUserId)) {
      return res.status(400).json({ message: "Already friends." });
    }

    if (
      toUser.friendRequestsReceived.some(
        (id) => id.toString() === fromUserId
      )
    ) {
      return res.status(400).json({ message: "Request already sent." });
    }

    fromUser.friendRequestsSent.push(toUserId);
    toUser.friendRequestsReceived.push(fromUserId);

    await fromUser.save();
    await toUser.save();

    res.json({ message: "Friend request sent." });
  } catch (error) {
    res.status(500).json({
      message: "Error sending friend request.",
      error: error.message,
    });
  }
});

router.post("/accept", async (req, res) => {
  try {
    const { userId, requestUserId } = req.body;

    const user = await User.findById(userId);
    const requestUser = await User.findById(requestUserId);

    if (!user || !requestUser) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.friends.some((id) => id.toString() === requestUserId)) {
      user.friends.push(requestUserId);
    }

    if (!requestUser.friends.some((id) => id.toString() === userId)) {
      requestUser.friends.push(userId);
    }

    user.friendRequestsReceived = user.friendRequestsReceived.filter(
      (id) => id.toString() !== requestUserId
    );

    requestUser.friendRequestsSent = requestUser.friendRequestsSent.filter(
      (id) => id.toString() !== userId
    );

    await user.save();
    await requestUser.save();

    res.json({ message: "Friend request accepted." });
  } catch (error) {
    res.status(500).json({
      message: "Error accepting request.",
      error: error.message,
    });
  }
});

router.post("/decline", async (req, res) => {
  try {
    const { userId, requestUserId } = req.body;

    const user = await User.findById(userId);
    const requestUser = await User.findById(requestUserId);

    if (!user || !requestUser) {
      return res.status(404).json({ message: "User not found." });
    }

    user.friendRequestsReceived = user.friendRequestsReceived.filter(
      (id) => id.toString() !== requestUserId
    );

    requestUser.friendRequestsSent = requestUser.friendRequestsSent.filter(
      (id) => id.toString() !== userId
    );

    await user.save();
    await requestUser.save();

    res.json({ message: "Friend request declined." });
  } catch (error) {
    res.status(500).json({
      message: "Error declining request.",
      error: error.message,
    });
  }
});

module.exports = router;