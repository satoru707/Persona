import * as express from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../index";
import { generateEventSuggestions } from "../services/aiService";

const router = express.Router();

// Get all events for the user
router.get("/", authenticate, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { userId: req.user!.id },
      orderBy: { startTime: "asc" },
    });
    res.json(events);
  } catch (error) {
    console.error("Get Events Error:", error);
    res.status(500).json({ message: "Failed to get events" });
  }
});

router.get("/upcoming", authenticate, async (req, res) => {
  try {
    const now = new Date();
    // const endOfDay = new Date(
    //   Date.UTC(
    //     now.getUTCFullYear(),
    //     now.getUTCMonth(),
    //     now.getUTCDate(),
    //     23,
    //     59,
    //     59,
    //     999
    //   )
    // );
    const next24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const events = await prisma.event.findMany({
      where: {
        userId: req.user!.id,
        startTime: {
          gte: now,
          lte: next24Hours,
        },
      },
      orderBy: { startTime: "asc" },
      take: 8, // Limit to 5 upcoming events
    });
    console.log(events);

    res.json(events);
  } catch (error) {
    console.error("Get Upcoming Events Error:", error);
    res.status(500).json({ message: "Failed to get upcoming events" });
  }
});

// Get events for a specific date/week
router.get("/date", authenticate, async (req, res) => {
  try {
    const { date, view } = req.query;
    const dateObj = date ? new Date(date as string) : new Date();

    let startDate: Date;
    let endDate: Date;

    // For week view
    if (view === "week") {
      const day = dateObj.getDay();
      startDate = new Date(dateObj);
      startDate.setDate(dateObj.getDate() - day);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
      endDate.setHours(23, 59, 59, 999);
    }
    // For day view (default)
    else {
      startDate = new Date(dateObj);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(dateObj);
      endDate.setHours(23, 59, 59, 999);
    }

    const events = await prisma.event.findMany({
      where: {
        userId: req.user!.id,
        startTime: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: { startTime: "asc" },
    });

    res.json(events);
  } catch (error) {
    console.error("Get Events by Date Error:", error);
    res.status(500).json({ message: "Failed to get events" });
  }
});

// Create a new event
router.post("/", authenticate, async (req, res) => {
  try {
    const { title, description, startTime, endTime } = req.body;

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        userId: req.user!.id,
      },
    });

    // Generate AI suggestions based on new event (optional)
    try {
      const suggestions = await generateEventSuggestions([newEvent]);
      if (suggestions) {
        // Store or return suggestions
      }
    } catch (aiError) {
      console.error("AI Suggestion Error:", aiError);
      // Continue without AI suggestions
    }

    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Create Event Error:", error);
    res.status(500).json({ message: "Failed to create event" });
  }
});

// Update an event
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startTime, endTime, isCompleted } = req.body;

    // Check if event belongs to user
    const event = await prisma.event.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        isCompleted,
      },
    });

    res.json(updatedEvent);
  } catch (error) {
    console.error("Update Event Error:", error);
    res.status(500).json({ message: "Failed to update event" });
  }
});

// Mark event as skipped
router.put("/:id/skip", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { skippedReason, skippedIsImportant } = req.body;

    // Check if event belongs to user
    const event = await prisma.event.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        isCompleted: false,
        skippedReason,
        skippedIsImportant,
        isSpecial: skippedIsImportant,
      },
    });

    res.json(updatedEvent);
  } catch (error) {
    console.error("Skip Event Error:", error);
    res.status(500).json({ message: "Failed to skip event" });
  }
});

// Delete an event
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if event belongs to user
    const event = await prisma.event.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await prisma.event.delete({
      where: { id },
    });

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Delete Event Error:", error);
    res.status(500).json({ message: "Failed to delete event" });
  }
});

export default router;
