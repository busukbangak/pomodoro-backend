import { Router } from "express";
import User from "../models/User";
import auth, { AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/settings - get current user's settings
router.get("/", auth as any, async (req: AuthRequest, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(user.settings);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/settings - update current user's settings
router.post("/", auth as any, async (req: AuthRequest, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        user.settings = {
            ...user.settings,
            ...req.body,
        };
        await user.save();
        res.json(user.settings);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router; 