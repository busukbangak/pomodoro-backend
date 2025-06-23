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

// PATCH /api/tasks/:id - Update a task
router.patch("/:id", auth as any, async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { title, projectId, estimatedPomodoros } = req.body;
    try {
        const task = await Task.findOne({ _id: id, userId });
        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return;
        }
        if (title !== undefined) task.title = title;
        if (projectId !== undefined) task.projectId = projectId;
        if (estimatedPomodoros !== undefined) task.estimatedPomodoros = estimatedPomodoros;
        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// PATCH /api/tasks/:id/complete - Mark a task as completed or incomplete
router.patch("/:id/complete", auth as any, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const { isCompleted } = req.body;
  try {
    const task = await Task.findOne({ _id: id, userId });
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }
    // Default to true if not provided
    task.isCompleted = typeof isCompleted === "boolean" ? isCompleted : true;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/tasks/:id/increment - Increment completedPomodoros by 1
router.patch("/:id/increment", auth as any, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  const { id } = req.params;
  try {
    const task = await Task.findOne({ _id: id, userId });
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }
    task.completedPomodoros += 1;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete("/:id", auth as any, async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).userId;
    const { id } = req.params;
 
    try {
        const task = await Task.findOne({ _id: id, userId });
        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return;
        }
        await task.deleteOne();
        res.json({ message: "Task deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router; 