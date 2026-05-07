import { useState } from "react";
import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import MoodSelector from "../components/MoodSelector";
import RecommendationCard from "../components/RecommendationCard";
import { HotelType } from "../shared/types";
import { Search } from "lucide-react";

const MoodSearchPage = () => {
  const [selectedMood, setSelectedMood] = useState("");

  const { data, isLoading } = useQuery(
    ["moodSearch", selectedMood],
    () => apiClient.searchByMood(selectedMood, 20),
    { enabled: !!selectedMood }
  );

  const { data: moodsData } = useQuery("moods", apiClient.fetchMoods);
  const moods = moodsData?.moods || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Smart Mood-Based Search</h1>
        <p className="text-gray-600 mt-2">Select your travel mood and we'll find the perfect hotels</p>
      </div>

      <MoodSelector onSelect={setSelectedMood} />

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      )}

      {data?.data && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {moods.find((m: { id: string; emoji: string; label: string }) => m.id === selectedMood)?.emoji}{" "}
              {moods.find((m: { id: string; emoji: string; label: string }) => m.id === selectedMood)?.label || selectedMood} Hotels
            </h2>
            <span className="text-sm text-gray-500">{data.total} results</span>
          </div>
          {data.data.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No hotels found for this mood. Try adding mood tags to your hotels!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.data.map((hotel: HotelType) => (
                <RecommendationCard
                  key={hotel._id}
                  hotel={hotel}
                  score={hotel.smartScore || 50}
                  reason={`Perfect for ${selectedMood}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MoodSearchPage;
