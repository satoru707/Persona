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
// Get AI suggestions
router.get("/suggestions", auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        // Get user's upcoming events
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 999);
        const events = await index_1.prisma.event.findMany({
            where: {
                userId,
                startTime: {
                    gte: now,
                    lte: tomorrow,
                },
            },
            orderBy: { startTime: "asc" },
        });
        // Get user's active goals
        const goals = await index_1.prisma.goal.findMany({
            where: {
                userId,
            },
            include: {
                steps: true,
            },
        });
        // Generate suggestions
        const scheduleSuggestions = await (0, aiService_1.generateEventSuggestions)(events);
        const goalSuggestions = await (0, aiService_1.generateGoalSuggestions)(goals);
        const focusSuggestions = await (0, aiService_1.generateDailyFocus)(events, goals);
        // Combine suggestions
        const suggestions = [
            ...(scheduleSuggestions || []),
            ...(goalSuggestions || []),
            ...(focusSuggestions || []),
        ];
        res.json(suggestions);
    }
    catch (error) {
        console.error("AI Suggestions Error:", error);
        res.status(500).json({ message: "Failed to generate AI suggestions" });
    }
});
// Generate suggestions for schedule optimization
router.post("/optimize-schedule", auth_1.authenticate, async (req, res) => {
    try {
        const { events } = req.body;
        const suggestions = await (0, aiService_1.generateEventSuggestions)(events);
        res.json({ suggestions });
    }
    catch (error) {
        console.error("Schedule Optimization Error:", error);
        res.status(500).json({ message: "Failed to optimize schedule" });
    }
});
// Generate steps for a goal
router.post("/generate-steps", auth_1.authenticate, async (req, res) => {
    try {
        const { goal, totalDays } = req.body;
        const steps = await generateGoalSteps(goal, totalDays);
        res.json({ steps });
    }
    catch (error) {
        console.error("Step Generation Error:", error);
        res.status(500).json({ message: "Failed to generate steps" });
    }
});
exports.default = router;
