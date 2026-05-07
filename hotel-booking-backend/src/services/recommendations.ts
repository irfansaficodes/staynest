import Hotel from "../models/hotel";
import Booking from "../models/booking";
import Review from "../models/review";
import User from "../models/user";
import Wishlist from "../models/wishlist";
import { HotelType, RecommendationType } from "../shared/types";
import { calculateSmartScore } from "./smartScore";

const MOOD_FACILITIES: Record<string, string[]> = {
  romantic: ["spa", "restaurant", "bar", "pool", "room service"],
  "family vacation": ["pool", "wifi", "kids club", "playground", "family rooms"],
  adventure: ["wifi", "parking", "gym", "outdoor activities", "bike rental"],
  business: ["wifi", "business center", "gym", "airport shuttle", "restaurant"],
  relaxation: ["spa", "pool", "wifi", "restaurant", "garden"],
  "luxury escape": ["spa", "pool", "restaurant", "bar", "gym", "concierge"],
  workation: ["wifi", "business center", "gym", "restaurant", "quiet area"],
};

export const getPersonalizedRecommendations = async (
  userId: string,
  limit: number = 10
): Promise<RecommendationType[]> => {
  const user = await User.findById(userId);
  if (!user) return [];

  const userBookings = await Booking.find({ userId }).sort({ createdAt: -1 });
  const wishlist = await Wishlist.find({ userId });
  const wishlistHotelIds = wishlist.map((w) => w.hotelId);
  const bookedHotelIds = userBookings.map((b) => b.hotelId);

  if (userBookings.length === 0 && wishlist.length === 0) {
    return getTrendingRecommendations(limit);
  }

  const bookedHotels = await Hotel.find({ _id: { $in: bookedHotelIds } }).lean();
  const preferredTypes = new Set(bookedHotels.flatMap((h: any) => h.type));
  const preferredFacilities = new Set(bookedHotels.flatMap((h: any) => h.facilities));
  const preferredCities = new Set(bookedHotels.map((h: any) => h.city));

  const avgSpent =
    userBookings.length > 0
      ? userBookings.reduce((sum, b) => sum + (b.totalCost || 0), 0) / userBookings.length
      : 1000;

  const priceBuffer = avgSpent * 1.5;

  const candidateHotels = await Hotel.find({
    _id: { $nin: bookedHotelIds },
    isActive: true,
    pricePerNight: { $lte: priceBuffer },
  }).lean();

  const scored: RecommendationType[] = [];

  for (const hotel of candidateHotels) {
    let score = 0;
    const reasons: string[] = [];

    if ((hotel as any).type?.some((t: string) => preferredTypes.has(t))) {
      score += 25;
      reasons.push("Matches your preferred hotel types");
    }

    const matchingFacilities = (hotel as any).facilities?.filter((f: string) =>
      preferredFacilities.has(f)
    );
    if (matchingFacilities?.length > 0) {
      score += 20;
      reasons.push(`Has facilities you often use (${matchingFacilities.slice(0, 2).join(", ")})`);
    }

    if (preferredCities.has((hotel as any).city)) {
      score += 20;
      reasons.push(`In ${(hotel as any).city}, a destination you've visited before`);
    }

    if (wishlistHotelIds.includes((hotel as any)._id.toString())) {
      score += 30;
      reasons.push("From your wishlist");
    }

    const smartScoreResult = await calculateSmartScore((hotel as any)._id.toString(), userId);
    score += smartScoreResult.overall * 0.3;

    const ratingBonus = ((hotel as any).averageRating || 0) * 5;
    score += ratingBonus;

    scored.push({
      hotel: hotel as unknown as HotelType,
      score: Math.round(Math.min(score, 100)),
      reason: reasons.length > 0 ? reasons[0] : "Recommended for you",
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
};

export const getTrendingRecommendations = async (
  limit: number = 10
): Promise<RecommendationType[]> => {
  const hotels = await Hotel.find({ isActive: true })
    .sort({ totalBookings: -1, averageRating: -1 })
    .limit(limit * 2)
    .lean();

  const scored: RecommendationType[] = [];

  for (const hotel of hotels) {
    const smartScoreResult = await calculateSmartScore((hotel as any)._id.toString());
    scored.push({
      hotel: hotel as unknown as HotelType,
      score: smartScoreResult.overall,
      reason: "Trending destination",
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
};

export const getMoodBasedHotels = async (
  mood: string,
  limit: number = 10
): Promise<HotelType[]> => {
  const targetMood = mood.toLowerCase().trim();
  const targetFacilities = MOOD_FACILITIES[targetMood] || [];

  if (targetFacilities.length === 0) {
    const hotels = await Hotel.find({ isActive: true }).limit(limit).lean();
    return hotels as unknown as HotelType[];
  }

  const hotels = await Hotel.find({ isActive: true }).lean();

  const scored = hotels.map((hotel) => {
    const h = hotel as any;
    const allHotelFacilities = [
      ...(h.facilities || []),
      ...(h.amenities
        ? Object.entries(h.amenities)
            .filter(([, v]) => v)
            .map(([k]) => k)
        : []),
    ];

    const matchCount = targetFacilities.filter((tf) =>
      allHotelFacilities.some((hf: string) => hf.toLowerCase().includes(tf.toLowerCase()))
    ).length;

    return { hotel, matchCount };
  });

  scored.sort((a, b) => b.matchCount - a.matchCount);

  return scored
    .filter((s) => s.matchCount > 0)
    .slice(0, limit)
    .map((s) => s.hotel as unknown as HotelType);
};
