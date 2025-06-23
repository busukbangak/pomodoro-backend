import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import jwt from "jsonwebtoken";

const router = Router();

// Register
router.post("/register", async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            email,
            passwordHash,
            settings: {}, // Defaults will be set by schema
            stats: { completed: [] },
        });
        await user.save();

        res.status(201).json({ message: "User registered" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Invalid credentials" });
            return
        }
        // Check password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid credentials" });
            return
        }
        // Create JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || "defaultsecret",
            { expiresIn: "7d" }
        );
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;