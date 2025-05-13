"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const auth_1 = require("../middleware/auth");
const index_1 = require("../index");
const aiService_1 = require("../services/aiService");
const router = express.Router();
// Get all events for the user
router.get("/", auth_1.authenticate, async (req, res) => {
    try {
        const events = await index_1.prisma.event.findMany({
            where: { userId: req.user.id },
            orderBy: { startTime: "asc" },
        });
        res.json(events);
    }
    catch (error) {
        console.error("Get Events Error:", error);
        res.status(500).json({ message: "Failed to get events" });
    }
});
// Get upcoming events
router.get("/upcoming", auth_1.authenticate, async (req, res) => {
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
        const events = await index_1.prisma.event.findMany({
            where: {
                userId: req.user.id,
                startTime: {
                    gte: now,
                    lte: next24Hours,
                },
            },
            orderBy: { startTime: "asc" },
            take: 5, // Limit to 5 upcoming events
        });
        console.log(events);
        res.json(events);
    }
    catch (error) {
        console.error("Get Upcoming Events Error:", error);
        res.status(500).json({ message: "Failed to get upcoming events" });
    }
});
// Get events for a specific date/week
router.get("/date", auth_1.authenticate, async (req, res) => {
    try {
        const { date, view } = req.query;
        const dateObj = date ? new Date(date) : new Date();
        let startDate;
        let endDate;
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
        const events = await index_1.prisma.event.findMany({
            where: {
                userId: req.user.id,
                startTime: {
                    gte: startDate,
                    lt: endDate,
                },
            },
            orderBy: { startTime: "asc" },
        });
        res.json(events);
    }
    catch (error) {
        console.error("Get Events by Date Error:", error);
        res.status(500).json({ message: "Failed to get events" });
    }
});
// Create a new event
router.post("/", auth_1.authenticate, async (req, res) => {
    try {
        const { title, description, startTime, endTime } = req.body;
        const newEvent = await index_1.prisma.event.create({
            data: {
                title,
                description,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                userId: req.user.id,
            },
        });
        // Generate AI suggestions based on new event (optional)
        try {
            const suggestions = await (0, aiService_1.generateEventSuggestions)([newEvent]);
            if (suggestions) {
                // Store or return suggestions
            }
        }
        catch (aiError) {
            console.error("AI Suggestion Error:", aiError);
            // Continue without AI suggestions
        }
        res.status(201).json(newEvent);
    }
    catch (error) {
        console.error("Create Event Error:", error);
        res.status(500).json({ message: "Failed to create event" });
    }
});
// Update an event
router.put("/:id", auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, startTime, endTime, isCompleted } = req.body;
        // Check if event belongs to user
        const event = await index_1.prisma.event.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
        });
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        const updatedEvent = await index_1.prisma.event.update({
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
    }
    catch (error) {
        console.error("Update Event Error:", error);
        res.status(500).json({ message: "Failed to update event" });
    }
});
// Mark event as skipped
router.put("/:id/skip", auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { skippedReason, skippedIsImportant } = req.body;
        // Check if event belongs to user
        const event = await index_1.prisma.event.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
        });
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        const updatedEvent = await index_1.prisma.event.update({
            where: { id },
            data: {
                isCompleted: false,
                skippedReason,
                skippedIsImportant,
                isSpecial: skippedIsImportant,
            },
        });
        res.json(updatedEvent);
    }
    catch (error) {
        console.error("Skip Event Error:", error);
        res.status(500).json({ message: "Failed to skip event" });
    }
});
// Delete an event
router.delete("/:id", auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        // Check if event belongs to user
        const event = await index_1.prisma.event.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
        });
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        await index_1.prisma.event.delete({
            where: { id },
        });
        res.json({ message: "Event deleted successfully" });
    }
    catch (error) {
        console.error("Delete Event Error:", error);
        res.status(500).json({ message: "Failed to delete event" });
    }
});
exports.default = router;
