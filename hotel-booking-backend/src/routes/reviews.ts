import express, { Request, Response } from "express";
import Review from "../models/review";
import Hotel from "../models/hotel";
import verifyToken from "../middleware/auth";
import { body, param, validationResult } from "express-validator";

const router = express.Router();

// Get reviews for a specific hotel
router.get(
  "/hotel/:hotelId",
  [param("hotelId").notEmpty().withMessage("Hotel ID is required")],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const reviews = await Review.find({ hotelId: req.params.hotelId })
        .sort({ createdAt: -1 });

      const averageRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

      res.json({ reviews, averageRating, totalReviews: reviews.length });
    } catch (error) {
      console.error("Fetch reviews error:", error);
      res.status(500).json({ message: "Unable to fetch reviews" });
    }
  }
);

// Create a review (user must be logged in)
router.post(
  "/hotel/:hotelId",
  verifyToken,
  [
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be 1-5"),
    body("title").isLength({ min: 1, max: 100 }).withMessage("Title is required (max 100 chars)"),
    body("comment").isLength({ min: 1, max: 1000 }).withMessage("Comment is required (max 1000 chars)"),
  ],
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

      const existing = await Review.findOne({
        userId: req.userId,
        hotelId: req.params.hotelId,
      });
      if (existing) {
        return res.status(409).json({ message: "You have already reviewed this hotel" });
      }

      const review = new Review({
        userId: req.userId,
        hotelId: req.params.hotelId,
        userName: req.body.userName,
        rating: req.body.rating,
        title: req.body.title,
        comment: req.body.comment,
      });

      await review.save();

      const allReviews = await Review.find({ hotelId: req.params.hotelId });
      const avgRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await Hotel.findByIdAndUpdate(req.params.hotelId, {
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      });

      res.status(201).json({ message: "Review submitted successfully", review });
    } catch (error) {
      console.error("Create review error:", error);
      res.status(500).json({ message: "Unable to submit review" });
    }
  }
);

// Update user's own review
router.put(
  "/:reviewId",
  verifyToken,
  [
    body("rating").optional().isInt({ min: 1, max: 5 }).withMessage("Rating must be 1-5"),
    body("title").optional().isLength({ min: 1, max: 100 }),
    body("comment").optional().isLength({ min: 1, max: 1000 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const review = await Review.findById(req.params.reviewId);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      if (review.userId !== req.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      Object.assign(review, req.body);
      await review.save();

      const allReviews = await Review.find({ hotelId: review.hotelId });
      const avgRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await Hotel.findByIdAndUpdate(review.hotelId, {
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      });

      res.json({ message: "Review updated", review });
    } catch (error) {
      console.error("Update review error:", error);
      res.status(500).json({ message: "Unable to update review" });
    }
  }
);

// Delete user's own review (or admin)
router.delete(
  "/:reviewId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const review = await Review.findById(req.params.reviewId);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      if (review.userId !== req.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await Review.findByIdAndDelete(req.params.reviewId);

      const allReviews = await Review.find({ hotelId: review.hotelId });
      const avgRating =
        allReviews.length > 0
          ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
          : 0;

      await Hotel.findByIdAndUpdate(review.hotelId, {
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      });

      res.json({ message: "Review deleted" });
    } catch (error) {
      console.error("Delete review error:", error);
      res.status(500).json({ message: "Unable to delete review" });
    }
  }
);

export default router;
