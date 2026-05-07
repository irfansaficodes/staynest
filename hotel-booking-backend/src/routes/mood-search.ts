import express, { Request, Response } from "express";
import { param, query, validationResult } from "express-validator";
import { getMoodBasedHotels } from "../services/recommendations";
import { MoodSearchResponse } from "../shared/types";

const router = express.Router();

router.get(
  "/:mood",
  [
    param("mood").notEmpty().withMessage("Mood type is required"),
    query("limit").optional().isInt({ min: 1, max: 50 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const mood = req.params.mood.toLowerCase();
      const limit = parseInt(req.query.limit as string) || 10;

      const hotels = await getMoodBasedHotels(mood, limit);

      res.json({
        data: hotels,
        mood,
        total: hotels.length,
      } as MoodSearchResponse);
    } catch (error) {
      console.error("Mood search error:", error);
      res.status(500).json({ message: "Unable to perform mood-based search" });
    }
  }
);

router.get("/moods", (req: Request, res: Response) => {
  const moods = [
    { id: "romantic", label: "Romantic Getaway", emoji: "💕", description: "Intimate settings, spa, fine dining" },
    { id: "family vacation", label: "Family Vacation", emoji: "👨‍👩‍👧‍👦", description: "Kid-friendly, pools, family rooms" },
    { id: "adventure", label: "Adventure Trip", emoji: "🏔️", description: "Outdoor activities, exploration" },
    { id: "business", label: "Business Travel", emoji: "💼", description: "Business centers, airport shuttle" },
    { id: "relaxation", label: "Relaxation & Wellness", emoji: "🧘", description: "Spa, gardens, quiet retreats" },
    { id: "luxury escape", label: "Luxury Escape", emoji: "✨", description: "Premium amenities, 5-star experience" },
    { id: "workation", label: "Workation", emoji: "💻", description: "High-speed WiFi, workspace, long-stay friendly" },
  ];

  res.json({ moods });
});

export default router;
