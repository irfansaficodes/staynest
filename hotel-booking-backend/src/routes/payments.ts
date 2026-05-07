import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import Razorpay from "razorpay";
import Booking from "../models/booking";
import Hotel from "../models/hotel";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_SECRET || "",
});

// POST /api/payments/create-order - Create Razorpay order
router.post("/create-order", verifyToken, async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ message: "Booking already paid" });
    }

    const options = {
      amount: Math.round(booking.totalCost * 100), // Razorpay expects amount in paise
      currency: "INR",
      receipt: `receipt_booking_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        hotelId: booking.hotelId,
        userId: booking.userId,
      },
    };

    const order = await razorpay.orders.create(options);

    booking.razorpayOrderId = order.id;
    await booking.save();

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Failed to create payment order" });
  }
});

// POST /api/payments/verify - Verify Razorpay payment signature
router.post("/verify", verifyToken, async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return res.status(400).json({ message: "All payment details are required" });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET || "")
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;

    // Generate invoice number
    booking.invoiceNumber = `INV-${Date.now()}-${booking._id.toString().slice(-6)}`;
    await booking.save();

    // Update hotel stats
    await Hotel.findByIdAndUpdate(booking.hotelId, {
      $inc: { totalBookings: 1, totalRevenue: booking.totalCost },
    });

    res.json({
      message: "Payment verified successfully",
      booking: {
        _id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        invoiceNumber: booking.invoiceNumber,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

export default router;
