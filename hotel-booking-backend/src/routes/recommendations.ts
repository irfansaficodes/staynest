import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import {
  getPersonalizedRecommendations,
  getTrendingRecommendations,
} from "../services/recommendations";
import Hotel from "../models/hotel";
import { calculateSmartScore, recalculateAllSmartScores } from "../services/smartScore";
import { body, param, validationResult } from "express-validator";

const router = express.Router();

router.get("/personalized", verifyToken, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const recommendations = await getPersonalizedRecommendations(req.userId, limit);
    res.json({ recommendations });
  } catch (error) {
    console.error("Personalized recommendations error:", error);
    res.status(500).json({ message: "Unable to fetch recommendations" });
  }
});

router.get("/trending", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const recommendations = await getTrendingRecommendations(limit);
    res.json({ recommendations });
  } catch (error) {
    console.error("Trending recommendations error:", error);
    res.status(500).json({ message: "Unable to fetch trending hotels" });
  }
});

router.get(
  "/smart-score/:hotelId",
  verifyToken,
  [param("hotelId").notEmpty().withMessage("Hotel ID is required")],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const score = await calculateSmartScore(req.params.hotelId, req.userId);
      res.json({ hotelId: req.params.hotelId, smartScore: score });
    } catch (error) {
      console.error("SmartScore error:", error);
      res.status(500).json({ message: "Unable to calculate SmartScore" });
    }
  }
);

router.post("/recalculate-scores", verifyToken, async (req: Request, res: Response) => {
  try {
    await recalculateAllSmartScores();
    res.json({ message: "SmartScores recalculated successfully" });
  } catch (error) {
    console.error("Recalculate SmartScores error:", error);
    res.status(500).json({ message: "Unable to recalculate SmartScores" });
  }
});

router.get("/top-picks", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 6;
    const hotels = await Hotel.find({ isActive: true })
      .sort({ smartScore: -1 })
      .limit(limit);
    res.json({ hotels });
  } catch (error) {
    console.error("Top picks error:", error);
    res.status(500).json({ message: "Unable to fetch top picks" });
  }
});

export default router;
