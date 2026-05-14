const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("MuscleMetrics backend is running");
});

console.log("Trying to connect to MongoDB...");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => {
    console.log("MongoDB connection failed:");
    console.log(error.message);
  });

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/workouts", require("./routes/workoutRoutes"));
app.use("/api/splits", require("./routes/splitRoutes"));
app.use("/api/friends", require("./routes/friendRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/rewards", require("./routes/rewardRoutes"));
app.use("/api/leaderboard", require("./routes/leaderboardRoutes"));
app.use("/api/activity", require("./routes/activityRoutes"));
app.use("/api/templates", require("./routes/templateRoutes"));
app.use("/api/progress", require("./routes/progressRoutes"));
app.use("/api/streaks", require("./routes/streakRoutes"));
app.use("/api/social-gym", require("./routes/socialGymRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/ai-coach", require("./routes/aiCoachRoutes"));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinUserRoom", (userId) => {
    if (userId) {
      socket.join(String(userId));
      console.log(`User joined room: ${userId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});