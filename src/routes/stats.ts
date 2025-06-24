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

// GET /api/stats/sync - get all user data for sync
router.get("/sync", auth as any, async (req: AuthRequest, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json({ settings: user.settings, stats: user.stats });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/stats/sync - merge user data from client (two-way sync)
router.post("/sync", auth as any, async (req: AuthRequest, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Merge settings if provided
        if (req.body.settings) {
            const incoming = req.body.settings;
            const stored = user.settings;
            // Only update if incoming is newer
            if (!stored.lastUpdated || (incoming.lastUpdated && new Date(incoming.lastUpdated) > new Date(stored.lastUpdated))) {
                user.settings = {
                    ...stored,
                    ...incoming,
                    lastUpdated: new Date(),
                };
            }
        }
        // Merge stats.completed if provided
        if (req.body.stats && Array.isArray(req.body.stats.completed)) {
            const existingTimestamps = new Set(user.stats.completed.map((c: any) => new Date(c.timestamp).getTime()));
            for (const entry of req.body.stats.completed) {
                const entryTime = new Date(entry.timestamp).getTime();
                if (!existingTimestamps.has(entryTime)) {
                    user.stats.completed.push(entry);
                }
            }
        }
        await user.save();
        res.json({ settings: user.settings, stats: user.stats });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// GET /api/stats/backup - export complete user data for backup
router.get("/backup", auth as any, async (req: AuthRequest, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        
        const backupData = {
            version: "1.0.0",
            timestamp: new Date().toISOString(),
            settings: user.settings,
            stats: user.stats,
        };
        
        res.json(backupData);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/stats/backup - restore complete user data from backup
router.post("/backup", auth as any, async (req: AuthRequest, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        
        const { settings, stats } = req.body;
        
        // Validate backup data
        if (!settings || typeof settings !== 'object') {
            res.status(400).json({ message: "Invalid settings data" });
            return;
        }
        
        if (!stats || !Array.isArray(stats.completed)) {
            res.status(400).json({ message: "Invalid stats data" });
            return;
        }
        
        // Validate settings fields
        const requiredSettings = ['pomodoroDuration', 'shortBreakDuration', 'longBreakDuration', 'autoStartBreak', 'autoStartPomodoro'];
        for (const field of requiredSettings) {
            if (typeof settings[field] === 'undefined') {
                res.status(400).json({ message: `Missing required setting: ${field}` });
                return;
            }
        }
        
        // Validate stats entries
        for (const entry of stats.completed) {
            if (!entry || typeof entry.timestamp !== 'string' || typeof entry.pomodoroDuration !== 'number') {
                res.status(400).json({ message: "Invalid stats entry format" });
                return;
            }
        }
        
        // Replace user data with backup data
        user.settings = {
            ...settings,
            lastUpdated: new Date(),
        };
        user.stats.completed = stats.completed.map((entry: any) => ({
            timestamp: new Date(entry.timestamp),
            pomodoroDuration: entry.pomodoroDuration,
        }));
        
        await user.save();
        
        res.json({ 
            message: "Backup restored successfully",
            settings: user.settings,
            stats: user.stats 
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router; 