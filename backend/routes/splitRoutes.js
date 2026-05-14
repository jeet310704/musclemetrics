const express = require("express");
const Split = require("../models/Split");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { name, days, exercises, notes } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Split name is required." });
    }

    const split = await Split.create({
      userId: req.user._id,
      name,
      days: Array.isArray(days) ? days : [],
      exercises: Array.isArray(exercises) ? exercises : [],
      notes: notes || "",
    });

    res.status(201).json(split);
  } catch (error) {
    console.log("CREATE SPLIT ERROR:", error.message);
    res.status(500).json({
      message: "Error creating split.",
      error: error.message,
    });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    const splits = await Split.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(splits);
  } catch (error) {
    console.log("GET MY SPLITS ERROR:", error.message);
    res.status(500).json({
      message: "Error loading splits.",
      error: error.message,
    });
  }
});

router.get("/:userId", protect, async (req, res) => {
  try {
    if (String(req.params.userId) !== String(req.user._id)) {
      return res.status(403).json({
        message: "You can only view your own splits.",
      });
    }

    const splits = await Split.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(splits);
  } catch (error) {
    console.log("GET SPLITS ERROR:", error.message);
    res.status(500).json({
      message: "Error loading splits.",
      error: error.message,
    });
  }
});

router.put("/:splitId", protect, async (req, res) => {
  try {
    const split = await Split.findById(req.params.splitId);

    if (!split) {
      return res.status(404).json({ message: "Split not found." });
    }

    if (String(split.userId) !== String(req.user._id)) {
      return res.status(403).json({
        message: "You can only update your own splits.",
      });
    }

    split.name = req.body.name || split.name;
    split.days = Array.isArray(req.body.days) ? req.body.days : split.days;
    split.exercises = Array.isArray(req.body.exercises)
      ? req.body.exercises
      : split.exercises;
    split.notes = req.body.notes || "";

    await split.save();

    res.json(split);
  } catch (error) {
    console.log("UPDATE SPLIT ERROR:", error.message);
    res.status(500).json({
      message: "Error updating split.",
      error: error.message,
    });
  }
});

router.delete("/:splitId", protect, async (req, res) => {
  try {
    const split = await Split.findById(req.params.splitId);

    if (!split) {
      return res.status(404).json({ message: "Split not found." });
    }

    if (String(split.userId) !== String(req.user._id)) {
      return res.status(403).json({
        message: "You can only delete your own splits.",
      });
    }

    await Split.findByIdAndDelete(req.params.splitId);

    res.json({ message: "Split deleted." });
  } catch (error) {
    console.log("DELETE SPLIT ERROR:", error.message);
    res.status(500).json({
      message: "Error deleting split.",
      error: error.message,
    });
  }
});

module.exports = router;