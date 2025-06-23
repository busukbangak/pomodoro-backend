import { Router, Request, Response } from "express";
import Task from "../models/Task";
import auth from "../middleware/auth";

const router = Router();

// POST /api/tasks - Create a new task
router.post("/", auth as any, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  const { title, projectId, estimatedPomodoros } = req.body;
  if (!title) {
    res.status(400).json({ message: "Title is required" });
    return;
  }
  try {
    const task = new Task({
      userId,
      title,
      projectId,
      estimatedPomodoros,
      completedPomodoros: 0,
      isCompleted: false,
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/tasks - List all tasks for the user
router.get("/", auth as any, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  try {
    const tasks = await Task.find({ userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router; 