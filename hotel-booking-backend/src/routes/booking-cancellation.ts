import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import Booking from "../models/booking";
import Hotel from "../models/hotel";
import { sendCancellationConfirmationEmail } from "../services/email";

const router = express.Router();

// POST /api/bookings/:id/cancel - Cancel a booking
router.post("/:id/cancel", verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    if (booking.status === "completed") {
      return res.status(400).json({ message: "Cannot cancel completed booking" });
    }

    const hotel = await Hotel.findById(booking.hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    const now = new Date();
    const checkIn = new Date(booking.checkIn);
    const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundAmount = 0;
    let refundPercentage = 0;

    if (hoursUntilCheckIn >= 48) {
      refundPercentage = 100;
      refundAmount = booking.totalCost;
    } else if (hoursUntilCheckIn >= 24) {
      refundPercentage = 50;
      refundAmount = booking.totalCost * 0.5;
    } else if (hoursUntilCheckIn >= 12) {
      refundPercentage = 25;
      refundAmount = booking.totalCost * 0.25;
    } else {
      refundPercentage = 0;
      refundAmount = 0;
    }

    booking.status = "cancelled";
    booking.cancellationReason = reason || "";
    booking.refundAmount = refundAmount;
    booking.refundPercentage = refundPercentage;
    booking.cancelledAt = now;
    await booking.save();

    // Send cancellation email
    try {
      await sendCancellationConfirmationEmail(booking.email, {
        id: booking._id.toString(),
        hotelName: hotel.name,
        refundAmount,
      });
    } catch (emailError) {
      console.error("Failed to send cancellation email:", emailError);
    }

    res.json({
      message: "Booking cancelled",
      refundAmount,
      refundPercentage,
      policy: hoursUntilCheckIn >= 48
        ? "Full refund (cancelled 48+ hours before check-in)"
        : hoursUntilCheckIn >= 24
        ? "50% refund (cancelled 24+ hours before check-in)"
        : hoursUntilCheckIn >= 12
        ? "25% refund (cancelled 12+ hours before check-in)"
        : "No refund (cancelled less than 12 hours before check-in)",
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
});

export default router;
