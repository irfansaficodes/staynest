import express, { Request, Response } from "express";
import crypto from "crypto";
import Booking from "../models/booking";
import Hotel from "../models/hotel";
import User from "../models/user";
import { sendBookingConfirmationEmail } from "../services/email";

const router = express.Router();

// POST /api/payments/webhook - Razorpay payment webhook
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers["x-razorpay-signature"] as string;
      const body = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");

      if (signature !== expectedSignature) {
        return res.status(400).json({ message: "Invalid webhook signature" });
      }
    }

    const event = req.body;

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const bookingId = payment.notes?.bookingId;

      if (!bookingId) {
        return res.status(400).json({ message: "Booking ID not found in payment notes" });
      }

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      booking.paymentStatus = "paid";
      booking.status = "confirmed";
      booking.razorpayPaymentId = payment.id;
      booking.razorpaySignature = payment.signature || "";
      await booking.save();

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}-${booking._id.toString().slice(-6)}`;
      booking.invoiceNumber = invoiceNumber;
      await booking.save();

      // Update hotel stats
      await Hotel.findByIdAndUpdate(booking.hotelId, {
        $inc: { totalBookings: 1, totalRevenue: booking.totalCost },
      });

      // Update user stats
      await User.findByIdAndUpdate(booking.userId, {
        $inc: { totalBookings: 1, totalSpent: booking.totalCost },
      });

      // Send confirmation email
      try {
        const hotel = await Hotel.findById(booking.hotelId);
        if (hotel) {
          await sendBookingConfirmationEmail(booking.email, {
            id: booking._id.toString(),
            hotelName: hotel.name,
            checkIn: new Date(booking.checkIn).toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            checkOut: new Date(booking.checkOut).toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            totalCost: booking.totalCost,
            guestName: `${booking.firstName} ${booking.lastName}`,
          });
        }
      } catch (emailError) {
        console.error("Failed to send booking confirmation email:", emailError);
      }

      return res.json({ message: "Payment verified and booking confirmed" });
    }

    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      const bookingId = payment.notes?.bookingId;

      if (bookingId) {
        await Booking.findByIdAndUpdate(bookingId, {
          paymentStatus: "failed",
          status: "cancelled",
        });
      }

      return res.json({ message: "Payment failure recorded" });
    }

    res.json({ message: "Webhook received" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ message: "Webhook processing failed" });
  }
});

export default router;
