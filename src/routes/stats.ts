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

// GET /api/stats/completed/all
router.get("/completed/all", auth as any, async (req: AuthRequest, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Return the array of { timestamp }
        res.json({ completed: user.stats.completed });
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

// POST /api/stats/reset - Clear all completed pomodoros
router.post("/reset", auth as any, async (req: AuthRequest, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        user.stats.completed = [];
        await user.save();
        res.json({ message: "Stats reset" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/stats/complete/bulk - Add multiple completed pomodoros with timestamps
router.post("/complete/bulk", auth as any, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  const { timestamps } = req.body;
  if (!Array.isArray(timestamps)) {
    res.status(400).json({ message: "Invalid timestamps array" });
    return;
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    for (const ts of timestamps) {
      if (typeof ts === 'string') {
        user.stats.completed.push({ timestamp: new Date(ts) });
      }
    }
    await user.save();
    res.json({ count: user.stats.completed.length });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router; 