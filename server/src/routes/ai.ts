import * as express from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../index";
import {
  generateDailyFocus,
  generateEventSuggestions,
  generateGoalSuggestions,
  generateGoalSteps,
} from "../services/aiService";

const router = express.Router();

// Get AI suggestions
router.get("/suggestions", authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get user's upcoming events
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const events = await prisma.event.findMany({
      where: {
        userId,
        startTime: {
          gte: now,
          lte: tomorrow,
        },
      },
      orderBy: { startTime: "asc" },
      take: 5,
    });

    // Get user's active goals
    const goals = await prisma.goal.findMany({
      where: {
        userId,
      },
      include: {
        steps: true,
      },
      take: 5,
    });

    // Generate suggestions
    const scheduleSuggestions = await generateEventSuggestions(events);
    const goalSuggestions = await generateGoalSuggestions(goals);
    const focusSuggestions = await generateDailyFocus(events, goals);

    // Combine suggestions
    const suggestions = [
      ...(scheduleSuggestions || []),
      ...(goalSuggestions || []),
      ...(focusSuggestions || []),
    ];

    res.json(suggestions);
  } catch (error) {
    console.error("AI Suggestions Error:", error);
    res.status(500).json({ message: "Failed to generate AI suggestions" });
  }
});

// Generate suggestions for schedule optimization
router.post("/optimize-schedule", authenticate, async (req, res) => {
  try {
    const { events } = req.body;

    const suggestions = await generateEventSuggestions(events);

    res.json({ suggestions });
  } catch (error) {
    console.error("Schedule Optimization Error:", error);
    res.status(500).json({ message: "Failed to optimize schedule" });
  }
});

// Generate steps for a goal
router.post("/generate-steps", authenticate, async (req, res) => {
  try {
    const { goal, totalDays } = req.body;

    const steps = await generateGoalSteps(goal, totalDays);
    res.json({ steps });
  } catch (error) {
    console.error("Step Generation Error:", error);
    res.status(500).json({ message: "Failed to generate steps" });
  }
});

export default router;
