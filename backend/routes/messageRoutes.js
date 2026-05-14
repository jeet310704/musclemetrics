const express = require("express");
const Message = require("../models/Message");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/search-users/:query/:currentUserId", protect, async (req, res) => {
  try {
    const { query } = req.params;
    const currentUserId = req.user._id;

    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { name: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    }).select("name username email profilePicture isPrivate streak");

    res.json(users);
  } catch (error) {
    console.log("SEARCH USERS ERROR:", error.message);
    res.status(500).json({
      message: "Error searching users.",
      error: error.message,
    });
  }
});

router.get("/chats/:userId", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate("senderId", "name username email profilePicture")
      .populate("receiverId", "name username email profilePicture")
      .sort({ createdAt: -1 });

    const chatMap = new Map();

    messages.forEach((message) => {
      const sender = message.senderId;
      const receiver = message.receiverId;

      const otherUser =
        String(sender._id) === String(userId) ? receiver : sender;

      if (!otherUser) return;

      if (!chatMap.has(String(otherUser._id))) {
        chatMap.set(String(otherUser._id), {
          user: otherUser,
          lastMessage: message.text || message.message || "",
          lastMessageAt: message.createdAt,
        });
      }
    });

    res.json(Array.from(chatMap.values()));
  } catch (error) {
    console.log("GET CHATS ERROR:", error.message);
    res.status(500).json({
      message: "Error loading chats.",
      error: error.message,
    });
  }
});

router.get("/conversation/:userId/:otherUserId", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    })
      .populate("senderId", "name username email profilePicture")
      .populate("receiverId", "name username email profilePicture")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.log("GET CONVERSATION ERROR:", error.message);
    res.status(500).json({
      message: "Error loading conversation.",
      error: error.message,
    });
  }
});

router.post("/send", protect, async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, text, message } = req.body;

    if (!receiverId || (!text && !message)) {
      return res.status(400).json({
        message: "Receiver and message text are required.",
      });
    }

    const savedMessage = await Message.create({
      senderId,
      receiverId,
      text: text || message,
      message: text || message,
    });

    const populatedMessage = await Message.findById(savedMessage._id)
      .populate("senderId", "name username email profilePicture")
      .populate("receiverId", "name username email profilePicture");

    const io = req.app.get("io");

    if (io) {
      io.to(String(receiverId)).emit("newMessage", {
        message: populatedMessage,
      });

      io.to(String(senderId)).emit("newMessage", {
        message: populatedMessage,
      });
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.log("SEND MESSAGE ERROR:", error.message);
    res.status(500).json({
      message: "Error sending message.",
      error: error.message,
    });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, text, message } = req.body;

    if (!receiverId || (!text && !message)) {
      return res.status(400).json({
        message: "Receiver and message text are required.",
      });
    }

    const savedMessage = await Message.create({
      senderId,
      receiverId,
      text: text || message,
      message: text || message,
    });

    res.status(201).json(savedMessage);
  } catch (error) {
    console.log("CREATE MESSAGE ERROR:", error.message);
    res.status(500).json({
      message: "Error sending message.",
      error: error.message,
    });
  }
});

module.exports = router;