import express, { Request, Response } from "express";
import Booking from "../models/booking";
import Review from "../models/review";
import Hotel from "../models/hotel";
import verifyToken from "../middleware/auth";

const router = express.Router();

router.get("/dashboard", verifyToken, async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find({ userId: req.userId }).sort({ createdAt: -1 });
    const reviews = await Review.find({ userId: req.userId }).sort({ createdAt: -1 });

    const totalBookings = bookings.length;
    const totalSpent = bookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);
    const upcomingBookings = bookings.filter(
      (b) => b.status === "confirmed" && new Date(b.checkIn) > new Date()
    ).length;

    const hotels = await Promise.all(
      bookings.map(async (b) => Hotel.findById(b.hotelId, "city country name pricePerNight imageUrls"))
    );

    const cityCounts: Record<string, number> = {};
    hotels.forEach((h) => {
      if (h?.city) {
        cityCounts[h.city] = (cityCounts[h.city] || 0) + 1;
      }
    });

    const recentBookings = bookings.slice(0, 5);
    const recentReviews = reviews.slice(0, 5);

    res.json({
      overview: {
        totalBookings,
        totalSpent,
        upcomingBookings,
        totalReviews: reviews.length,
      },
      recentBookings,
      recentReviews,
      favoriteDestinations: Object.entries(cityCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([city, count]) => ({ city, count })),
    });
  } catch (error) {
    console.error("Customer dashboard error:", error);
    res.status(500).json({ message: "Unable to fetch customer dashboard data" });
  }
});

export default router;
