import express, { Request, Response } from "express";
import Hotel from "../models/hotel";
import Booking from "../models/booking";
import Review from "../models/review";
import User from "../models/user";
import verifyToken from "../middleware/auth";

const router = express.Router();

const requireHotelOwner = async (req: Request, res: Response, next: Function) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || (user.role !== "hotel_owner" && user.role !== "admin")) {
      return res.status(403).json({ message: "Access denied. Hotel owner role required." });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Unable to verify role" });
  }
};

router.get("/dashboard", verifyToken, requireHotelOwner, async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find({ userId: req.userId });
    const hotelIds = hotels.map((h) => h._id);

    const bookings = await Booking.find({ hotelId: { $in: hotelIds } });
    const reviews = await Review.find({ hotelId: { $in: hotelIds } });

    const totalHotels = hotels.length;
    const totalBookings = bookings.length;
    const totalRevenue = hotels.reduce((sum, h) => sum + (h.totalRevenue || 0), 0);
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const recentBookings = await Booking.find({ hotelId: { $in: hotelIds } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "firstName lastName email");

    const bookingsByStatus = {
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
      completed: bookings.filter((b) => b.status === "completed").length,
    };

    const monthlyRevenue = await Booking.aggregate([
      { $match: { hotelId: { $in: hotelIds }, status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalCost" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const occupancyRates = hotels.map((hotel) => {
      const hotelBookings = bookings.filter(
        (b) => String(b.hotelId) === String(hotel._id)
      );
      return {
        hotelId: hotel._id,
        name: hotel.name,
        bookings: hotelBookings.length,
        revenue: hotel.totalRevenue || 0,
      };
    });

    res.json({
      overview: {
        totalHotels,
        totalBookings,
        totalRevenue,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length,
      },
      bookingsByStatus,
      recentBookings,
      monthlyRevenue,
      occupancyRates,
    });
  } catch (error) {
    console.error("Owner dashboard error:", error);
    res.status(500).json({ message: "Unable to fetch owner dashboard data" });
  }
});

export default router;
