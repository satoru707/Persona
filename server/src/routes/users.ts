import * as express from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../index";

const router = express.Router();

// Get current user
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get User Error:", error);
    res.status(500).json({ message: "Failed to get user" });
  }
});

// Update user profile
router.put("/me", authenticate, async (req, res) => {
  try {
    const { name, image } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        name,
        image,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
});

export default router;
