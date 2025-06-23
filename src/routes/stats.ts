import { Router } from "express";
import User from "../models/User";
import auth, { AuthRequest } from "../middleware/auth";
import { Response } from "express";

const router = Router();

// GET /api/stats/completed
router.get("/completed", auth as any, async (req: AuthRequest, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const count = user.stats.completed.length;
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/stats/complete - Record a completed pomodoro
router.post("/complete", auth as any, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    user.stats.completed.push({ timestamp: new Date() });
    await user.save();
    res.json({ count: user.stats.completed.length });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router; 