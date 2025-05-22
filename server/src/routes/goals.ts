import * as express from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../index";
import { generateGoalSteps } from "../services/aiService";

const router = express.Router();

// Get all goals for the user
router.get("/", authenticate, async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.user!.id },
      include: { steps: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(goals);
  } catch (error) {
    console.error("Get Goals Error:", error);
    res.status(500).json({ message: "Failed to get goals" });
  }
});

// Get active goals
router.get("/active", authenticate, async (req, res) => {
  try {
    // Find goals where not all steps are completed
    const goals = await prisma.goal.findMany({
      where: {
        userId: req.user!.id,
      },
      include: {
        steps: true,
      },
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    // Filter to goals with at least one incomplete step
    const activeGoals = goals.filter((goal) =>
      goal.steps.some((step) => !step.isCompleted)
    );

    res.json(activeGoals);
  } catch (error) {
    console.error("Get Active Goals Error:", error);
    res.status(500).json({ message: "Failed to get active goals" });
  }
});

// Get a specific goal
router.get("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId: req.user!.id,
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
  } catch (error) {
    console.error("Get Goal Error:", error);
    res.status(500).json({ message: "Failed to get goal" });
  }
});

// Create a new goal
router.post("/", authenticate, async (req, res) => {
  try {
    const { title, description, totalDays, steps } = req.body;

    // Create goal
    const newGoal = await prisma.goal.create({
      data: {
        title,
        description,
        totalDays,
        userId: req.user!.id,
      },
    });

    // If steps are provided, create them
    if (Array.isArray(steps) && steps.length > 0) {
      await Promise.all(
        steps.map(async (step: any) => {
          await prisma.step.create({
            data: {
              title: step.title,
              description: step.description,
              dueDate: new Date(step.dueDate),
              goalId: newGoal.id,
            },
          });
        })
      );
    }
    // Otherwise, generate steps with AI
    else {
      try {
        const aiSteps = await generateGoalSteps(newGoal, totalDays);

        if (aiSteps && aiSteps.length > 0) {
          await Promise.all(
            aiSteps.map(async (step) => {
              await prisma.step.create({
                data: {
                  title: step.title,
                  description: step.description,
                  dueDate: new Date(step.dueDate),
                  goalId: newGoal.id,
                },
              });
            })
          );
        }
      } catch (aiError) {
        console.error("AI Step Generation Error:", aiError);
        // Create default steps if AI fails
        const stepCount = 10;
        const dayInterval = Math.floor(totalDays / stepCount);

        for (let i = 0; i < stepCount; i++) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + i * dayInterval);

          await prisma.step.create({
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
    const goalWithSteps = await prisma.goal.findUnique({
      where: { id: newGoal.id },
      include: { steps: true },
    });

    res.status(201).json(goalWithSteps);
  } catch (error) {
    console.error("Create Goal Error:", error);
    res.status(500).json({ message: "Failed to create goal" });
  }
});

// Update a goal
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, totalDays } = req.body;

    // Check if goal belongs to user
    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: {
        title,
        description,
        totalDays,
      },
    });

    res.json(updatedGoal);
  } catch (error) {
    console.error("Update Goal Error:", error);
    res.status(500).json({ message: "Failed to update goal" });
  }
});

// Delete a goal
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if goal belongs to user
    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Delete all steps first
    await prisma.step.deleteMany({
      where: { goalId: id },
    });

    // Then delete the goal
    await prisma.goal.delete({
      where: { id },
    });

    res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error("Delete Goal Error:", error);
    res.status(500).json({ message: "Failed to delete goal" });
  }
});

// Update a step
router.put("/steps/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, isCompleted } = req.body;

    // Check if step belongs to user's goal
    const step = await prisma.step.findUnique({
      where: { id },
      include: {
        goal: true,
      },
    });

    if (!step || step.goal.userId !== req.user!.id) {
      return res.status(404).json({ message: "Step not found" });
    }

    const updatedStep = await prisma.step.update({
      where: { id },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        isCompleted,
      },
    });

    res.json(updatedStep);
  } catch (error) {
    console.error("Update Step Error:", error);
    res.status(500).json({ message: "Failed to update step" });
  }
});

export default router;
