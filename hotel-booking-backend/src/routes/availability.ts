import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import BookingCalendar from "../models/bookingCalendar";
import Hotel from "../models/hotel";

const router = express.Router();

// GET /api/availability/:hotelId - Get availability calendar for a hotel
router.get("/:hotelId", async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate and endDate query params required" });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const calendar = await BookingCalendar.find({
      hotelId,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    res.json({ data: calendar });
  } catch (error) {
    console.error("Get availability error:", error);
    res.status(500).json({ message: "Failed to fetch availability" });
  }
});

// POST /api/availability/:hotelId - Set availability for dates (hotel owner only)
router.post("/:hotelId", verifyToken, async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;
    const { dates } = req.body; // [{ date, availableRooms, pricePerNight, blocked }]

    const hotel = await Hotel.findOne({ _id: hotelId, userId: req.userId });
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found or unauthorized" });
    }

    const results = [];
    for (const entry of dates) {
      const date = new Date(entry.date);
      const existing = await BookingCalendar.findOne({ hotelId, date });

      if (existing) {
        existing.availableRooms = entry.availableRooms ?? existing.availableRooms;
        existing.pricePerNight = entry.pricePerNight ?? existing.pricePerNight;
        existing.blocked = entry.blocked ?? existing.blocked;
        existing.isWeekendRate = entry.isWeekendRate ?? false;
        existing.isSeasonalRate = entry.isSeasonalRate ?? false;
        await existing.save();
        results.push(existing);
      } else {
        const newEntry = new BookingCalendar({
          hotelId,
          roomId: "default",
          date,
          availableRooms: entry.availableRooms ?? hotel.adultCount,
          totalRooms: hotel.adultCount,
          pricePerNight: entry.pricePerNight ?? hotel.pricePerNight,
          blocked: entry.blocked ?? false,
          isWeekendRate: entry.isWeekendRate ?? false,
          isSeasonalRate: entry.isSeasonalRate ?? false,
        });
        await newEntry.save();
        results.push(newEntry);
      }
    }

    res.status(201).json({ message: "Availability updated", data: results });
  } catch (error) {
    console.error("Set availability error:", error);
    res.status(500).json({ message: "Failed to update availability" });
  }
});

// PUT /api/availability/:hotelId/:dateId - Block/unblock a date
router.put("/:hotelId/:dateId", verifyToken, async (req: Request, res: Response) => {
  try {
    const { hotelId, dateId } = req.params;
    const { blocked } = req.body;

    const hotel = await Hotel.findOne({ _id: hotelId, userId: req.userId });
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found or unauthorized" });
    }

    const entry = await BookingCalendar.findOne({ _id: dateId, hotelId });
    if (!entry) {
      return res.status(404).json({ message: "Calendar entry not found" });
    }

    entry.blocked = blocked;
    await entry.save();

    res.json({ message: blocked ? "Date blocked" : "Date unblocked", data: entry });
  } catch (error) {
    console.error("Toggle block error:", error);
    res.status(500).json({ message: "Failed to update" });
  }
});

export default router;
