import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import User from "../models/user";
import Hotel from "../models/hotel";
import Booking from "../models/booking";
import Review from "../models/review";

const router = express.Router();

router.get("/dashboard", verifyToken, async (req: Request, res: Response) => {
  try {
    const requestingUser = await User.findById(req.userId);
    if (!requestingUser || requestingUser.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const totalUsers = await User.countDocuments();
    const totalHotels = await Hotel.countDocuments({ verificationStatus: "approved" });
    const pendingHotels = await Hotel.countDocuments({ verificationStatus: "pending" });
    const totalBookings = await Booking.countDocuments();
    const totalReviews = await Review.countDocuments();

    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalCost" } } },
    ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const topHotels = await Hotel.find()
      .sort({ totalRevenue: -1 })
      .limit(5)
      .select("name city totalRevenue totalBookings averageRating");

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("firstName lastName email role createdAt");

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("hotelId", "name city");

    const monthlyRevenue = await Booking.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalCost" },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const flaggedReviews = await Review.find({ isFlagged: true })
      .populate("userId", "firstName lastName")
      .populate("hotelId", "name");

    const occupancyData = await Hotel.aggregate([
      {
        $group: {
          _id: null,
          avgOccupancy: { $avg: "$occupancyRate" },
          avgRating: { $avg: "$averageRating" },
        },
      },
    ]);

    res.json({
      overview: {
        totalUsers,
        totalHotels,
        totalBookings,
        totalReviews,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      usersByRole: usersByRole.reduce(
        (acc, item) => ({ ...acc, [item._id]: item.count }),
        {}
      ),
      bookingsByStatus: bookingsByStatus.reduce(
        (acc, item) => ({ ...acc, [item._id]: item.count }),
        {}
      ),
      topHotels,
      recentUsers,
      recentBookings,
      monthlyRevenue,
      flaggedReviews,
      systemHealth: {
        avgOccupancy: occupancyData[0]?.avgOccupancy || 0,
        avgRating: occupancyData[0]?.avgRating || 0,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ message: "Unable to fetch admin dashboard data" });
  }
});

router.get("/users", verifyToken, async (req: Request, res: Response) => {
  try {
    const requestingUser = await User.findById(req.userId);
    if (!requestingUser || requestingUser.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error("Admin users error:", error);
    res.status(500).json({ message: "Unable to fetch users" });
  }
});

router.patch("/users/:id/role", verifyToken, async (req: Request, res: Response) => {
  try {
    const requestingUser = await User.findById(req.userId);
    if (!requestingUser || requestingUser.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { role } = req.body;
    if (!["user", "admin", "hotel_owner"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    res.json({ message: "User role updated", user });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ message: "Unable to update user role" });
  }
});

router.patch("/reviews/:id/flag", verifyToken, async (req: Request, res: Response) => {
  try {
    const requestingUser = await User.findById(req.userId);
    if (!requestingUser || requestingUser.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { isFlagged } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isFlagged },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({ message: `Review ${isFlagged ? "flagged" : "unflagged"}`, review });
  } catch (error) {
    console.error("Flag review error:", error);
    res.status(500).json({ message: "Unable to update review flag" });
  }
});

// GET /api/admin/hotels - Get all hotels (including pending)
router.get("/hotels", verifyToken, async (req: Request, res: Response) => {
  try {
    const requestingUser = await User.findById(req.userId);
    if (!requestingUser || requestingUser.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const hotels = await Hotel.find().sort({ createdAt: -1 });
    res.json({ hotels });
  } catch (error) {
    console.error("Admin hotels error:", error);
    res.status(500).json({ message: "Unable to fetch hotels" });
  }
});

// PUT /api/admin/hotels/:id/verify - Approve/reject hotel
router.put("/hotels/:id/verify", verifyToken, async (req: Request, res: Response) => {
  try {
    const requestingUser = await User.findById(req.userId);
    if (!requestingUser || requestingUser.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { status, notes } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid verification status" });
    }

    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: status,
        verificationNotes: notes || "",
        verifiedAt: status === "approved" ? new Date() : undefined,
        verifiedBy: status === "approved" ? req.userId : undefined,
      },
      { new: true }
    );

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.json({ message: `Hotel ${status}`, hotel });
  } catch (error) {
    console.error("Verify hotel error:", error);
    res.status(500).json({ message: "Unable to verify hotel" });
  }
});

// GET /api/admin/hotels/pending - Get pending hotels
router.get("/hotels/pending", verifyToken, async (req: Request, res: Response) => {
  try {
    const requestingUser = await User.findById(req.userId);
    if (!requestingUser || requestingUser.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const hotels = await Hotel.find({ verificationStatus: "pending" }).sort({ createdAt: -1 });
    res.json({ hotels });
  } catch (error) {
    console.error("Pending hotels error:", error);
    res.status(500).json({ message: "Unable to fetch pending hotels" });
  }
});

router.delete("/hotels/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const requestingUser = await User.findById(req.userId);
    if (!requestingUser || requestingUser.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    await Hotel.deleteOne({ _id: req.params.id });
    res.json({ message: "Hotel deleted successfully" });
  } catch (error) {
    console.error("Delete hotel error:", error);
    res.status(500).json({ message: "Unable to delete hotel" });
  }
});

export default router;
