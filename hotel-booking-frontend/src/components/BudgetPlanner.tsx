import { useState } from "react";
import { useMutation } from "react-query";
import * as apiClient from "../api-client";
import useAppContext from "../hooks/useAppContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Wallet, Calculator, Building2 } from "lucide-react";
import RecommendationCard from "./RecommendationCard";
import { HotelType, BudgetPlanType } from "../shared/types";

const BudgetPlanner = () => {
  const { showToast } = useAppContext();
  const [budget, setBudget] = useState("");
  const [travelers, setTravelers] = useState("2");
  const [nights, setNights] = useState("3");
  const [result, setResult] = useState<BudgetPlanType | null>(null);

  const mutation = useMutation(
    (vars: { budget: number; travelers: number; nights: number }) =>
      apiClient.calculateBudgetPlan(vars.budget, vars.travelers, vars.nights),
    {
      onSuccess: (data) => {
        setResult(data.plan);
        showToast({ title: "Budget Plan Ready", description: "Here's your personalized plan", type: "SUCCESS" });
      },
      onError: () => showToast({ title: "Error", description: "Could not calculate budget plan", type: "ERROR" }),
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budget || parseInt(budget) < 1000) {
      showToast({ title: "Invalid Budget", description: "Minimum budget is ₹1,000", type: "ERROR" });
      return;
    }
    mutation.mutate({ budget: parseInt(budget), travelers: parseInt(travelers), nights: parseInt(nights) });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Smart Budget Planner</h2>
        <p className="text-gray-600 mt-1">Plan your trip budget intelligently</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4 max-w-2xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="budget" className="text-sm font-semibold text-gray-700">Total Budget (₹)</Label>
            <div className="relative mt-1">
              <Wallet className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="pl-9"
                placeholder="e.g. 25000"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="travelers" className="text-sm font-semibold text-gray-700">Travelers</Label>
            <Input
              id="travelers"
              type="number"
              min="1"
              value={travelers}
              onChange={(e) => setTravelers(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="nights" className="text-sm font-semibold text-gray-700">Nights</Label>
            <Input
              id="nights"
              type="number"
              min="1"
              value={nights}
              onChange={(e) => setNights(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <Button type="submit" disabled={mutation.isLoading} className="w-full">
          <Calculator className="w-4 h-4 mr-2" />
          {mutation.isLoading ? "Calculating..." : "Calculate Budget Plan"}
        </Button>
      </form>

      {result && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border p-4 text-center">
              <div className="text-2xl font-bold text-primary-600">₹{result.accommodationCost?.toLocaleString() || 0}</div>
              <div className="text-xs text-gray-500 mt-1">Accommodation</div>
            </div>
            <div className="bg-white rounded-xl border p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">₹{result.foodEstimate?.toLocaleString() || 0}</div>
              <div className="text-xs text-gray-500 mt-1">Food Estimate</div>
            </div>
            <div className="bg-white rounded-xl border p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">₹{result.travelEstimate?.toLocaleString() || 0}</div>
              <div className="text-xs text-gray-500 mt-1">Travel Estimate</div>
            </div>
            <div className="bg-white rounded-xl border p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">₹{result.remainingBudget?.toLocaleString() || 0}</div>
              <div className="text-xs text-gray-500 mt-1">Remaining</div>
            </div>
          </div>

          <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
            <p className="text-sm text-primary-800">
              <strong>Per night budget:</strong> ₹{result.perNightBudget?.toLocaleString() || 0} |
              <strong className="ml-2">Max affordable:</strong> {result.affordableHotels?.length || 0} hotels
            </p>
          </div>

          {result.affordableHotels?.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Affordable Hotels for Your Budget
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.affordableHotels.map((hotel: HotelType) => (
                  <RecommendationCard key={hotel._id} hotel={hotel} score={hotel.smartScore || 50} reason="Within your budget" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BudgetPlanner;
