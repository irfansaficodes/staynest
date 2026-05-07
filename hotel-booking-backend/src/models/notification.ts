import mongoose from "mongoose";
import { NotificationType } from "../shared/types";

const notificationSchema = new mongoose.Schema<NotificationType>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "booking_confirmation",
        "booking_cancellation",
        "welcome",
        "price_drop",
        "recommendation",
        "general",
      ],
      default: "general",
    },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.model<NotificationType>(
  "Notification",
  notificationSchema
);
export default Notification;
