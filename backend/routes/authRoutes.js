const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const cleanUser = (user) => ({
  _id: user._id,
  id: user._id,
  name: user.name || "",
  username: user.username || user.email?.split("@")[0] || "user",
  email: user.email,
  profilePicture: user.profilePicture || "",
  isPrivate: user.isPrivate || false,
  streak: user.streak || 0,
});

router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email or username.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name || "",
      username: username || email.split("@")[0],
      email,
      password: hashedPassword,
    });

    const token = createToken(user._id);

    res.status(201).json({
      message: "User registered successfully.",
      token,
      user: cleanUser(user),
    });
  } catch (error) {
    console.log("REGISTER ERROR:", error.message);

    res.status(500).json({
      message: "Error registering user.",
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if ((!email && !username) || !password) {
      return res.status(400).json({
        message: "Email/username and password are required.",
      });
    }

    const user = await User.findOne({
      $or: [{ email }, { username }, { email: username }],
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid login credentials.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid login credentials.",
      });
    }

    const token = createToken(user._id);

    res.json({
      message: "Login successful.",
      token,
      user: cleanUser(user),
    });
  } catch (error) {
    console.log("LOGIN ERROR:", error.message);

    res.status(500).json({
      message: "Error logging in.",
      error: error.message,
    });
  }
});

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.json({
      user: cleanUser(user),
    });
  } catch (error) {
    res.status(401).json({
      message: "Invalid token.",
      error: error.message,
    });
  }
});

module.exports = router;