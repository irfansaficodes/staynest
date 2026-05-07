import Hotel from "../models/hotel";
import { HotelType, BudgetPlanType } from "../shared/types";

export const calculateBudgetPlan = (
  budget: number,
  travelers: number,
  nights: number
): BudgetPlanType => {
  const perNightBudget = Math.floor(budget / nights);

  const foodPerDay = travelers * 800;
  const travelPerDay = travelers * 500;
  const dailyMisc = foodPerDay + travelPerDay;

  const totalFoodEstimate = foodPerDay * nights;
  const totalTravelEstimate = travelPerDay * nights;
  const totalMisc = dailyMisc * nights;

  const accommodationBudget = budget - totalMisc;
  const perNightAccommodation = Math.max(
    Math.floor(accommodationBudget / nights),
    0
  );

  const remaining = Math.max(budget - totalMisc - perNightAccommodation * nights, 0);

  return {
    totalBudget: budget,
    accommodationCost: perNightAccommodation * nights,
    foodEstimate: totalFoodEstimate,
    travelEstimate: totalTravelEstimate,
    remainingBudget: remaining,
    affordableHotels: [],
    maxNights: nights,
    perNightBudget: perNightAccommodation,
  };
};

export const findAffordableHotels = async (
  maxPricePerNight: number,
  limit: number = 20
): Promise<HotelType[]> => {
  const hotels = await Hotel.find({
    isActive: true,
    pricePerNight: { $lte: maxPricePerNight },
  })
    .sort({ smartScore: -1, averageRating: -1 })
    .limit(limit)
    .lean();

  return hotels as unknown as HotelType[];
};
