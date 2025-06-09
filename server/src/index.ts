import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import eventRoutes from "./routes/events";
import goalRoutes from "./routes/goals";
import aiRoutes from "./routes/ai";
import subRoute from "./routes/notis";

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

// Create Express app
const app = express();
const port = process.env.PORT || 3000;
const URL = process.env.CLIENT_URL || "http://localhost:5173";
// Middleware
app.use(express.json());
app.use(express.static("public"));

app.use(
  cors({
    origin: URL,
    credentials: true,
  })
);

// Routes
app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notis", subRoute);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      message: "An unexpected error occurred",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma };
