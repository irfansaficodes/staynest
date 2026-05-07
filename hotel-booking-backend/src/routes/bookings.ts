import express, { Request, Response } from "express";
import Booking from "../models/booking";
import Hotel from "../models/hotel";
import User from "../models/user";
import verifyToken from "../middleware/auth";
import { body, param, validationResult } from "express-validator";
import { sendCancellationConfirmationEmail as sendBookingCancellationEmail } from "../services/email";

const router = express.Router();

// Get all bookings (admin only)
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate("hotelId", "name city country");

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Fetch bookings error:", error);
    res.status(500).json({ message: "Unable to fetch bookings" });
  }
});

// Get bookings by hotel ID (for hotel owners)
router.get(
  "/hotel/:hotelId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { hotelId } = req.params;

      // Verify the hotel belongs to the authenticated user
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      if (hotel.userId !== req.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const bookings = await Booking.find({ hotelId })
        .sort({ createdAt: -1 })
        .populate("userId", "firstName lastName email");

      res.status(200).json(bookings);
    } catch (error) {
      console.error("Fetch hotel bookings error:", error);
      res.status(500).json({ message: "Unable to fetch hotel bookings" });
    }
  }
);

// Get booking by ID
router.get("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(
      "hotelId",
      "name city country imageUrls"
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error("Fetch booking error:", error);
    res.status(500).json({ message: "Unable to fetch booking" });
  }
});

// Update booking status
router.patch(
  "/:id/status",
  verifyToken,
  [
    body("status")
      .isIn(["pending", "confirmed", "cancelled", "completed", "refunded"])
      .withMessage("Invalid status"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { status, cancellationReason } = req.body;

      const updateData: any = { status };
      if (status === "cancelled" && cancellationReason) {
        updateData.cancellationReason = cancellationReason;
      }
      if (status === "refunded") {
        updateData.refundAmount = req.body.refundAmount || 0;
      }

      const booking = await Booking.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.status(200).json(booking);
    } catch (error) {
      console.error("Update booking status error:", error);
      res.status(500).json({ message: "Unable to update booking" });
    }
  }
);

// Update payment status
router.patch(
  "/:id/payment",
  verifyToken,
  [
    body("paymentStatus")
      .isIn(["pending", "paid", "failed", "refunded"])
      .withMessage("Invalid payment status"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { paymentStatus, paymentMethod } = req.body;

      const updateData: any = { paymentStatus };
      if (paymentMethod) {
        updateData.paymentMethod = paymentMethod;
      }

      const booking = await Booking.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.status(200).json(booking);
    } catch (error) {
      console.error("Update payment status error:", error);
      res.status(500).json({ message: "Unable to update payment status" });
    }
  }
);

// Cancel booking (Customer, Hotel Owner, or Admin)
router.post(
  "/:id/cancel",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const requestingUser = await User.findById(req.userId);
      if (!requestingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const hotel = await Hotel.findById(booking.hotelId);

      const isBookingOwner = String(booking.userId) === req.userId;
      const isHotelOwner = hotel && String(hotel.userId) === req.userId;
      const isAdmin = requestingUser.role === "admin";

      if (!isBookingOwner && !isHotelOwner && !isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!["pending", "confirmed"].includes(booking.status)) {
        return res.status(400).json({
          message: `Cannot cancel booking with status: ${booking.status}`,
        });
      }

      // Apply 24hr restriction only to customers (booking owners)
      if (isBookingOwner && !isHotelOwner && !isAdmin) {
        const checkInDate = new Date(booking.checkIn);
        const now = new Date();
        
        const checkInDay = checkInDate.getFullYear() * 10000 + (checkInDate.getMonth() + 1) * 100 + checkInDate.getDate();
        const todayDay = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();

        if (checkInDay <= todayDay) {
          return res.status(400).json({
            message: "Cancellation allowed only before check-in date. Please contact support for urgent changes.",
          });
        }
      }

      booking.status = "cancelled";
      booking.cancellationReason = req.body.reason || `Cancelled by ${requestingUser.role}`;

      if (booking.paymentStatus === "paid") {
        booking.paymentStatus = "refunded";
        booking.refundAmount = booking.totalCost;
      }

      await booking.save();

      await Hotel.findByIdAndUpdate(booking.hotelId, {
        $inc: { totalBookings: -1, totalRevenue: -(booking.totalCost || 0) },
      });

      await User.findByIdAndUpdate(booking.userId, {
        $inc: { totalBookings: -1, totalSpent: -(booking.totalCost || 0) },
      });

      const bookedUser = await User.findById(booking.userId).select("-password");

      if (bookedUser && hotel) {
        const refundAmount = booking.paymentStatus === "refunded" ? booking.totalCost : 0;
        sendBookingCancellationEmail(
          bookedUser.email,
          {
            id: booking._id.toString(),
            hotelName: hotel.name,
            refundAmount,
          }
        ).catch(() => {});
      }

      res.status(200).json({ message: "Booking cancelled successfully", booking });
    } catch (error) {
      console.error("Cancel booking error:", error);
      res.status(500).json({ message: "Unable to cancel booking" });
    }
  }
);

// Delete booking (admin only)
router.delete("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update hotel analytics
    await Hotel.findByIdAndUpdate(booking.hotelId, {
      $inc: {
        totalBookings: -1,
        totalRevenue: -(booking.totalCost || 0),
      },
    });

    // Update user analytics
    await User.findByIdAndUpdate(booking.userId, {
      $inc: {
        totalBookings: -1,
        totalSpent: -(booking.totalCost || 0),
      },
    });

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({ message: "Unable to delete booking" });
  }
});

export default router;
