import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import Room from "../models/room";
import Hotel from "../models/hotel";
import { body, param, validationResult } from "express-validator";
import Booking from "../models/booking";

const router = express.Router();

router.post(
  "/:hotelId",
  verifyToken,
  [
    body("name").notEmpty().withMessage("Room name is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("pricePerNight").isNumeric().withMessage("Valid price is required"),
    body("totalRooms").isInt({ min: 1 }).withMessage("At least 1 room required"),
    body("availableRooms").isInt({ min: 0 }).withMessage("Valid available rooms required"),
    body("maxOccupancy").isInt({ min: 1 }).withMessage("Max occupancy must be at least 1"),
    body("bedType").notEmpty().withMessage("Bed type is required"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const hotel = await Hotel.findOne({
        _id: req.params.hotelId,
        userId: req.userId,
      });
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found or access denied" });
      }

      const room = new Room({
        hotelId: req.params.hotelId,
        ...req.body,
        availableRooms: req.body.availableRooms || req.body.totalRooms,
      });
      await room.save();

      res.status(201).json({ message: "Room created", room });
    } catch (error) {
      console.error("Create room error:", error);
      res.status(500).json({ message: "Unable to create room" });
    }
  }
);

router.get("/:hotelId", verifyToken, async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findOne({
      _id: req.params.hotelId,
      userId: req.userId,
    });
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found or access denied" });
    }

    const rooms = await Room.find({ hotelId: req.params.hotelId, isActive: true });
    res.json({ rooms });
  } catch (error) {
    console.error("Fetch rooms error:", error);
    res.status(500).json({ message: "Unable to fetch rooms" });
  }
});

router.put(
  "/:roomId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const room = await Room.findById(req.params.roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      const hotel = await Hotel.findOne({
        _id: room.hotelId,
        userId: req.userId,
      });
      if (!hotel) {
        return res.status(403).json({ message: "Access denied" });
      }

      Object.assign(room, req.body);
      await room.save();

      res.json({ message: "Room updated", room });
    } catch (error) {
      console.error("Update room error:", error);
      res.status(500).json({ message: "Unable to update room" });
    }
  }
);

router.delete("/:roomId", verifyToken, async (req: Request, res: Response) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const hotel = await Hotel.findOne({
      _id: room.hotelId,
      userId: req.userId,
    });
    if (!hotel) {
      return res.status(403).json({ message: "Access denied" });
    }

    room.isActive = false;
    await room.save();

    res.json({ message: "Room deleted" });
  } catch (error) {
    console.error("Delete room error:", error);
    res.status(500).json({ message: "Unable to delete room" });
  }
});

router.get("/availability/:hotelId", async (req: Request, res: Response) => {
  try {
    const { checkIn, checkOut } = req.query;
    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: "checkIn and checkOut dates required" });
    }

    const rooms = await Room.find({ hotelId: req.params.hotelId, isActive: true });

    const checkInDate = new Date(checkIn as string);
    const checkOutDate = new Date(checkOut as string);

    const overlappingBookings = await Booking.find({
      hotelId: req.params.hotelId,
      status: { $in: ["confirmed", "pending"] },
      $or: [
        { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } },
      ],
    });

    const roomsWithAvailability = rooms.map((room) => {
      const bookedRooms = overlappingBookings.filter(
        (b) => b.roomId === room._id.toString()
      ).length;

      return {
        ...room.toObject(),
        availableDuringPeriod: Math.max(room.availableRooms - bookedRooms, 0),
        isAvailable: room.availableRooms - bookedRooms > 0,
      };
    });

    res.json({ rooms: roomsWithAvailability, checkIn: checkInDate, checkOut: checkOutDate });
  } catch (error) {
    console.error("Check availability error:", error);
    res.status(500).json({ message: "Unable to check room availability" });
  }
});

export default router;
