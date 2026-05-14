const express = require("express");
const Template = require("../models/Template");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { name, notes, exercises } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Template name is required." });
    }

    if (!Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ message: "Add at least one exercise." });
    }

    const template = await Template.create({
      userId: req.user._id,
      name,
      notes: notes || "",
      exercises,
    });

    res.status(201).json(template);
  } catch (error) {
    console.log("CREATE TEMPLATE ERROR:", error.message);
    res.status(500).json({
      message: "Error creating template.",
      error: error.message,
    });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    const templates = await Template.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(templates);
  } catch (error) {
    console.log("GET MY TEMPLATES ERROR:", error.message);
    res.status(500).json({
      message: "Error loading templates.",
      error: error.message,
    });
  }
});

router.get("/:userId", protect, async (req, res) => {
  try {
    if (String(req.params.userId) !== String(req.user._id)) {
      return res.status(403).json({
        message: "You can only view your own templates.",
      });
    }

    const templates = await Template.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(templates);
  } catch (error) {
    console.log("GET TEMPLATES ERROR:", error.message);
    res.status(500).json({
      message: "Error loading templates.",
      error: error.message,
    });
  }
});

router.put("/:templateId", protect, async (req, res) => {
  try {
    const template = await Template.findById(req.params.templateId);

    if (!template) {
      return res.status(404).json({ message: "Template not found." });
    }

    if (String(template.userId) !== String(req.user._id)) {
      return res.status(403).json({
        message: "You can only update your own templates.",
      });
    }

    template.name = req.body.name || template.name;
    template.notes = req.body.notes || "";
    template.exercises = Array.isArray(req.body.exercises)
      ? req.body.exercises
      : template.exercises;

    await template.save();

    res.json(template);
  } catch (error) {
    console.log("UPDATE TEMPLATE ERROR:", error.message);
    res.status(500).json({
      message: "Error updating template.",
      error: error.message,
    });
  }
});

router.delete("/:templateId", protect, async (req, res) => {
  try {
    const template = await Template.findById(req.params.templateId);

    if (!template) {
      return res.status(404).json({ message: "Template not found." });
    }

    if (String(template.userId) !== String(req.user._id)) {
      return res.status(403).json({
        message: "You can only delete your own templates.",
      });
    }

    await Template.findByIdAndDelete(req.params.templateId);

    res.json({ message: "Template deleted." });
  } catch (error) {
    console.log("DELETE TEMPLATE ERROR:", error.message);
    res.status(500).json({
      message: "Error deleting template.",
      error: error.message,
    });
  }
});

module.exports = router;