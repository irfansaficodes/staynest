import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import Notification from "../models/notification";
import { param, validationResult } from "express-validator";

const router = express.Router();

router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    res.status(500).json({ message: "Unable to fetch notifications" });
  }
});

router.patch(
  "/:id/read",
  verifyToken,
  [param("id").notEmpty().withMessage("Notification ID is required")],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ message: "Unable to update notification" });
    }
  }
);

router.patch("/read-all", verifyToken, async (req: Request, res: Response) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, isRead: false },
      { isRead: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({ message: "Unable to update notifications" });
  }
});

export default router;
