import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import Wishlist from "../models/wishlist";
import Hotel from "../models/hotel";
import { body, param, validationResult } from "express-validator";

const router = express.Router();

router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const wishlist = await Wishlist.find({ userId: req.userId })
      .sort({ addedAt: -1 });

    const hotels = await Promise.all(
      wishlist.map(async (item) => {
        const hotel = await Hotel.findById(item.hotelId);
        return hotel ? { ...hotel.toObject(), wishlistId: item._id, addedAt: item.addedAt } : null;
      })
    );

    res.json({ wishlist: hotels.filter(Boolean) });
  } catch (error) {
    console.error("Fetch wishlist error:", error);
    res.status(500).json({ message: "Unable to fetch wishlist" });
  }
});

router.post(
  "/:hotelId",
  verifyToken,
  [param("hotelId").notEmpty().withMessage("Hotel ID is required")],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const hotel = await Hotel.findById(req.params.hotelId);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      const existing = await Wishlist.findOne({
        userId: req.userId,
        hotelId: req.params.hotelId,
      });

      if (existing) {
        return res.status(409).json({ message: "Hotel already in wishlist" });
      }

      const item = new Wishlist({
        userId: req.userId,
        hotelId: req.params.hotelId,
      });
      await item.save();

      res.status(201).json({ message: "Added to wishlist", wishlistId: item._id });
    } catch (error) {
      console.error("Add to wishlist error:", error);
      res.status(500).json({ message: "Unable to add to wishlist" });
    }
  }
);

router.delete(
  "/:hotelId",
  verifyToken,
  [param("hotelId").notEmpty().withMessage("Hotel ID is required")],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await Wishlist.findOneAndDelete({
        userId: req.userId,
        hotelId: req.params.hotelId,
      });

      if (!result) {
        return res.status(404).json({ message: "Hotel not in wishlist" });
      }

      res.json({ message: "Removed from wishlist" });
    } catch (error) {
      console.error("Remove from wishlist error:", error);
      res.status(500).json({ message: "Unable to remove from wishlist" });
    }
  }
);

router.get("/check/:hotelId", verifyToken, async (req: Request, res: Response) => {
  try {
    const item = await Wishlist.findOne({
      userId: req.userId,
      hotelId: req.params.hotelId,
    });
    res.json({ inWishlist: !!item });
  } catch (error) {
    console.error("Check wishlist error:", error);
    res.status(500).json({ message: "Unable to check wishlist status" });
  }
});

export default router;
