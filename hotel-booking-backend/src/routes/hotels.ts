import express, { Request, Response } from "express";
import Hotel from "../models/hotel";
import Booking from "../models/booking";
import User from "../models/user";
import { BookingType, HotelSearchResponse, HotelType } from "../shared/types";
import { param, validationResult } from "express-validator";
import Razorpay from "razorpay";
import verifyToken from "../middleware/auth";
import { sendBookingConfirmationEmail, sendOwnerBookingNotificationEmail } from "../services/email";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_SECRET as string,
});


const router = express.Router();

router.get("/search", async (req: Request, res: Response) => {
  try {
    const query = constructSearchQuery(req.query);
    // Only show approved hotels to public
    query.verificationStatus = "approved";

    let sortOptions = {};
    switch (req.query.sortOption) {
      case "starRating":
        sortOptions = { starRating: -1 };
        break;
      case "pricePerNightAsc":
        sortOptions = { pricePerNight: 1 };
        break;
      case "pricePerNightDesc":
        sortOptions = { pricePerNight: -1 };
        break;
      case "smartScore":
        sortOptions = { smartScore: -1 };
        break;
      case "rating":
        sortOptions = { averageRating: -1 };
        break;
      case "popularity":
        sortOptions = { totalBookings: -1 };
        break;
    }

    const pageSize = 5;
    const pageNumber = parseInt(
      req.query.page ? req.query.page.toString() : "1"
    );
    const skip = (pageNumber - 1) * pageSize;

    const hotels = await Hotel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize)
      .lean();

    const total = await Hotel.countDocuments(query);

    const response: HotelSearchResponse = {
      data: hotels.map((h) => ({ ...h, _id: h._id.toString() })) as unknown as HotelType[],
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    // Only show approved hotels to public
    const hotels = await Hotel.find({ verificationStatus: "approved" }).sort("-lastUpdated").lean();
    res.json(hotels);
  } catch (error) {
    console.error("Fetch hotels error:", error);
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

router.get(
  "/:id",
  [param("id").notEmpty().withMessage("Hotel ID is required")],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = req.params.id.toString();

    try {
      const hotel = await Hotel.findById(id);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      // Allow viewing unapproved hotels if user is the owner
      if (hotel.verificationStatus !== "approved") {
        const userId = req.headers["x-user-id"] as string;
        if (hotel.userId !== userId) {
          return res.status(404).json({ message: "Hotel not found" });
        }
      }
      res.json(hotel);
    } catch (error) {
      console.error("Fetch hotel error:", error);
      res.status(500).json({ message: "Error fetching hotel" });
    }
  }
);

  router.post(
    "/:hotelId/bookings/payment-intent",
    verifyToken,
    async (req: Request, res: Response) => {
      try {
        const numberOfNights = parseInt(req.body.numberOfNights) || 1;
        const hotelId = req.params.hotelId;

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
          return res.status(400).json({ message: "Hotel not found" });
        }

        const pricePerNight = parseInt(hotel.pricePerNight as any) || 0;
        const totalCost = pricePerNight * numberOfNights;

        if (totalCost <= 0) {
          return res.status(400).json({ message: "Invalid hotel price" });
        }

        const options = {
          amount: totalCost * 100,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.send({
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          totalCost,
        });
      } catch (error: any) {
        console.error("Payment intent error:", error);
        res.status(500).json({ message: "Failed to create payment intent" });
      }
    }
  );

  router.post(
    "/:hotelId/bookings",
    verifyToken,
    async (req: Request, res: Response) => {
      try {
        const hotel = await Hotel.findById(req.params.hotelId);
        if (!hotel) {
          return res.status(404).json({ message: "Hotel not found" });
        }

        if (hotel.verificationStatus !== "approved") {
          return res.status(400).json({ message: "Hotel is not available for booking" });
        }

        const newBooking = new Booking({
          ...req.body,
          userId: req.userId,
          hotelId: req.params.hotelId,
          status: "pending",
          paymentStatus: "pending",
          createdAt: new Date(),
        });

        await newBooking.save();

        res.status(201).json({
          message: "Booking created. Please complete payment to confirm.",
          bookingId: newBooking._id,
          totalCost: newBooking.totalCost,
          status: "pending",
        });
      } catch (error) {
        console.error("Booking creation error:", error);
        res.status(500).json({ message: "something went wrong" });
      }
    }
  );

const constructSearchQuery = (queryParams: any) => {
  let constructedQuery: any = {};

  if (queryParams.destination && queryParams.destination.trim() !== "") {
    const destination = queryParams.destination.trim();

    constructedQuery.$or = [
      { city: { $regex: destination, $options: "i" } },
      { country: { $regex: destination, $options: "i" } },
    ];
  }

  if (queryParams.adultCount) {
    constructedQuery.adultCount = {
      $gte: parseInt(queryParams.adultCount),
    };
  }

  if (queryParams.childCount) {
    constructedQuery.childCount = {
      $gte: parseInt(queryParams.childCount),
    };
  }

  if (queryParams.facilities) {
    constructedQuery.facilities = {
      $all: Array.isArray(queryParams.facilities)
        ? queryParams.facilities
        : [queryParams.facilities],
    };
  }

  if (queryParams.types) {
    constructedQuery.type = {
      $in: Array.isArray(queryParams.types)
        ? queryParams.types
        : [queryParams.types],
    };
  }

  if (queryParams.stars) {
    const starRatings = Array.isArray(queryParams.stars)
      ? queryParams.stars.map((star: string) => parseInt(star))
      : parseInt(queryParams.stars);

    constructedQuery.starRating = { $in: starRatings };
  }

  if (queryParams.maxPrice) {
    constructedQuery.pricePerNight = {
      $lte: parseInt(queryParams.maxPrice).toString(),
    };
  }

  if (queryParams.mood) {
    const mood = queryParams.mood.toLowerCase().trim();
    constructedQuery.moodTags = { $in: [mood] };
  }

  return constructedQuery;
};

export default router;
