import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import resumeRoutes from "./routes/resume.js";
import interviewRoutes from "./routes/interview.js";
import quizRoutes from "./routes/quiz.js";
import aptitudeRoutes from "./routes/aptitude.js";
import hrRoutes from "./routes/hr.js";
import progressRoutes from "./routes/progress.js";
import profileRoutes from "./routes/profile.js";
import videoInterviewRoutes from "./routes/videoInterview.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import dashboardRoutes from "./routes/dashboard.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || "127.0.0.1";

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "ai-interview-portal-backend" });
});

app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/aptitude", aptitudeRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/video-interview", videoInterviewRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});



export default app;
