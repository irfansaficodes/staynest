import Hotel from "../models/hotel";
import Booking from "../models/booking";
import Review from "../models/review";
import { SmartScoreBreakdown } from "../shared/types";

export const calculateSmartScore = async (
  hotelId: string,
  userId?: string
): Promise<SmartScoreBreakdown> => {
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return {
      rating: 0,
      affordability: 0,
      popularity: 0,
      facilitiesQuality: 0,
      bookingFrequency: 0,
      userPreferenceMatch: 0,
      overall: 0,
    };
  }

  const allHotels = await Hotel.find({ isActive: true });
  const prices = allHotels.map((h) => h.pricePerNight);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const ratingScore = hotel.averageRating ? (hotel.averageRating / 5) * 100 : 0;

  const priceRange = maxPrice - minPrice || 1;
  const affordabilityScore =
    ((maxPrice - hotel.pricePerNight) / priceRange) * 100;

  const maxBookings = Math.max(...allHotels.map((h) => h.totalBookings || 0), 1);
  const bookingFrequencyScore = ((hotel.totalBookings || 0) / maxBookings) * 100;

  const popularityScore = Math.min(
    ((hotel.totalBookings || 0) / maxBookings) * 80 +
      ((hotel.reviewCount || 0) / Math.max(...allHotels.map((h) => h.reviewCount || 0), 1)) * 20,
    100
  );

  const totalPossibleFacilities = 10;
  const activeFacilities = Object.values(hotel.amenities || {}).filter(Boolean).length + (hotel.facilities?.length || 0);
  const facilitiesQualityScore = Math.min((activeFacilities / totalPossibleFacilities) * 100, 100);

  let userPreferenceMatch = 50;
  if (userId) {
    const userBookings = await Booking.find({ userId });
    const bookedHotels = await Hotel.find({
      _id: { $in: userBookings.map((b) => b.hotelId) },
    });

    if (bookedHotels.length > 0) {
      const bookedTypes = new Set(bookedHotels.flatMap((h) => h.type));
      const bookedFacilities = new Set(bookedHotels.flatMap((h) => h.facilities));
      const bookedCities = new Set(bookedHotels.map((h) => h.city));

      let matchCount = 0;
      let totalChecks = 0;

      if (hotel.type.some((t) => bookedTypes.has(t))) matchCount += 30;
      totalChecks += 30;

      const matchingFacilities = hotel.facilities.filter((f) => bookedFacilities.has(f));
      if (matchingFacilities.length > 0) {
        matchCount += 30;
      }
      totalChecks += 30;

      if (bookedCities.has(hotel.city)) {
        matchCount += 40;
      }
      totalChecks += 40;

      userPreferenceMatch = totalChecks > 0 ? (matchCount / totalChecks) * 100 : 50;
    }
  }

  const weights = {
    rating: 0.25,
    affordability: 0.2,
    popularity: 0.15,
    facilitiesQuality: 0.15,
    bookingFrequency: 0.15,
    userPreferenceMatch: 0.1,
  };

  const overall = Math.round(
    ratingScore * weights.rating +
      affordabilityScore * weights.affordability +
      popularityScore * weights.popularity +
      facilitiesQualityScore * weights.facilitiesQuality +
      bookingFrequencyScore * weights.bookingFrequency +
      userPreferenceMatch * weights.userPreferenceMatch
  );

  return {
    rating: Math.round(ratingScore),
    affordability: Math.round(affordabilityScore),
    popularity: Math.round(popularityScore),
    facilitiesQuality: Math.round(facilitiesQualityScore),
    bookingFrequency: Math.round(bookingFrequencyScore),
    userPreferenceMatch: Math.round(userPreferenceMatch),
    overall: Math.min(Math.max(overall, 0), 100),
  };
};

export const recalculateAllSmartScores = async (): Promise<void> => {
  const hotels = await Hotel.find({ isActive: true });
  for (const hotel of hotels) {
    const score = await calculateSmartScore(hotel._id.toString());
    await Hotel.findByIdAndUpdate(hotel._id, { smartScore: score.overall });
  }
};
