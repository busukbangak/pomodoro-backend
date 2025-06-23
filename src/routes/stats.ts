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
  const { pomodoroDuration } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    user.stats.completed.push({ 
      timestamp: new Date(),
      pomodoroDuration: pomodoroDuration || user.settings.pomodoroDuration
    });
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

// POST /api/stats/complete/bulk - Add multiple completed pomodoros with timestamps and durations
router.post("/complete/bulk", auth as any, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  const { entries } = req.body;
  if (!Array.isArray(entries)) {
    res.status(400).json({ message: "Invalid entries array" });
    return;
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    for (const entry of entries) {
      if (entry && typeof entry.timestamp === 'string') {
        user.stats.completed.push({ 
          timestamp: new Date(entry.timestamp),
          pomodoroDuration: entry.pomodoroDuration || user.settings.pomodoroDuration
        });
      }
    }
    await user.save();
    res.json({ count: user.stats.completed.length });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router; 