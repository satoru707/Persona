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
// Get all goals for the user
router.get("/", auth_1.authenticate, async (req, res) => {
    try {
        const goals = await index_1.prisma.goal.findMany({
            where: { userId: req.user.id },
            include: { steps: true },
            orderBy: { createdAt: "desc" },
        });
        res.json(goals);
    }
    catch (error) {
        console.error("Get Goals Error:", error);
        res.status(500).json({ message: "Failed to get goals" });
    }
});
// Get active goals
router.get("/active", auth_1.authenticate, async (req, res) => {
    try {
        // Find goals where not all steps are completed
        const goals = await index_1.prisma.goal.findMany({
            where: {
                userId: req.user.id,
            },
            include: {
                steps: true,
            },
            orderBy: { createdAt: "desc" },
            take: 1,
        });
        // Filter to goals with at least one incomplete step
        const activeGoals = goals.filter((goal) => goal.steps.some((step) => !step.isCompleted));
        res.json(activeGoals);
    }
    catch (error) {
        console.error("Get Active Goals Error:", error);
        res.status(500).json({ message: "Failed to get active goals" });
    }
});
// Get a specific goal
router.get("/:id", auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const goal = await index_1.prisma.goal.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
            include: {
                steps: {
                    orderBy: { dueDate: "asc" },
                },
            },
        });
        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }
        res.json(goal);
    }
    catch (error) {
        console.error("Get Goal Error:", error);
        res.status(500).json({ message: "Failed to get goal" });
    }
});
// Create a new goal
router.post("/", auth_1.authenticate, async (req, res) => {
    try {
        const { title, description, totalDays, steps } = req.body;
        // Create goal
        const newGoal = await index_1.prisma.goal.create({
            data: {
                title,
                description,
                totalDays,
                userId: req.user.id,
            },
        });
        // If steps are provided, create them
        if (Array.isArray(steps) && steps.length > 0) {
            await Promise.all(steps.map(async (step) => {
                await index_1.prisma.step.create({
                    data: {
                        title: step.title,
                        description: step.description,
                        dueDate: new Date(step.dueDate),
                        goalId: newGoal.id,
                    },
                });
            }));
        }
        // Otherwise, generate steps with AI
        else {
            try {
                const aiSteps = await (0, aiService_1.generateGoalSteps)(newGoal, totalDays);
                if (aiSteps && aiSteps.length > 0) {
                    await Promise.all(aiSteps.map(async (step) => {
                        await index_1.prisma.step.create({
                            data: {
                                title: step.title,
                                description: step.description,
                                dueDate: new Date(step.dueDate),
                                goalId: newGoal.id,
                            },
                        });
                    }));
                }
            }
            catch (aiError) {
                console.error("AI Step Generation Error:", aiError);
                // Create default steps if AI fails
                const stepCount = 10;
                const dayInterval = Math.floor(totalDays / stepCount);
                for (let i = 0; i < stepCount; i++) {
                    const dueDate = new Date();
                    dueDate.setDate(dueDate.getDate() + i * dayInterval);
                    await index_1.prisma.step.create({
                        data: {
                            title: `Step ${i + 1}`,
                            description: `Step ${i + 1} for ${title}`,
                            dueDate,
                            goalId: newGoal.id,
                        },
                    });
                }
            }
        }
        // Return the created goal with steps
        const goalWithSteps = await index_1.prisma.goal.findUnique({
            where: { id: newGoal.id },
            include: { steps: true },
        });
        res.status(201).json(goalWithSteps);
    }
    catch (error) {
        console.error("Create Goal Error:", error);
        res.status(500).json({ message: "Failed to create goal" });
    }
});
// Update a goal
router.put("/:id", auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, totalDays } = req.body;
        // Check if goal belongs to user
        const goal = await index_1.prisma.goal.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
        });
        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }
        const updatedGoal = await index_1.prisma.goal.update({
            where: { id },
            data: {
                title,
                description,
                totalDays,
            },
        });
        res.json(updatedGoal);
    }
    catch (error) {
        console.error("Update Goal Error:", error);
        res.status(500).json({ message: "Failed to update goal" });
    }
});
// Delete a goal
router.delete("/:id", auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        // Check if goal belongs to user
        const goal = await index_1.prisma.goal.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
        });
        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }
        // Delete all steps first
        await index_1.prisma.step.deleteMany({
            where: { goalId: id },
        });
        // Then delete the goal
        await index_1.prisma.goal.delete({
            where: { id },
        });
        res.json({ message: "Goal deleted successfully" });
    }
    catch (error) {
        console.error("Delete Goal Error:", error);
        res.status(500).json({ message: "Failed to delete goal" });
    }
});
// Update a step
router.put("/steps/:id", auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, dueDate, isCompleted } = req.body;
        // Check if step belongs to user's goal
        const step = await index_1.prisma.step.findUnique({
            where: { id },
            include: {
                goal: true,
            },
        });
        if (!step || step.goal.userId !== req.user.id) {
            return res.status(404).json({ message: "Step not found" });
        }
        const updatedStep = await index_1.prisma.step.update({
            where: { id },
            data: {
                title,
                description,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                isCompleted,
            },
        });
        res.json(updatedStep);
    }
    catch (error) {
        console.error("Update Step Error:", error);
        res.status(500).json({ message: "Failed to update step" });
    }
});
exports.default = router;
