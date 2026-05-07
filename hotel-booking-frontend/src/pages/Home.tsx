import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import LatestDestinationCard from "../components/LastestDestinationCard";
import Hero from "../components/Hero";
import RecommendationCard from "../components/RecommendationCard";
import { SkeletonGrid } from "../components/Skeleton";
import type { RecommendationType } from "../shared/types";
import { Link } from "react-router-dom";
import { Sparkles, TrendingUp, ArrowRight } from "lucide-react";

const Home = () => {
  const { data: hotels, isLoading: hotelsLoading } = useQuery("fetchQuery", () =>
    apiClient.fetchHotels()
  );

  const { data: trendingData } = useQuery("trendingHotels", () =>
    apiClient.fetchTrendingHotels(6)
  );

  const { data: topPicks } = useQuery("topPicks", () =>
    apiClient.fetchTopPicks(4)
  );

  return (
    <>
      <Hero />
      <div className="space-y-16 pb-16">
        {trendingData?.recommendations?.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className="flex items-end justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </span>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
                    Smart Recommendations
                  </h2>
                  <p className="text-gray-500 mt-1 text-sm">AI-powered picks just for you</p>
                </div>
              </div>
              <Link to="/mood-search" className="group text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all shrink-0">
                Try Mood Search
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingData.recommendations.map((rec: RecommendationType) => (
                <RecommendationCard
                  key={rec.hotel._id}
                  hotel={rec.hotel}
                  score={rec.score}
                  reason={rec.reason}
                />
              ))}
            </div>
          </section>
        )}

        {trendingData === undefined && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SkeletonGrid count={3} />
          </div>
        )}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold text-gray-900 flex items-center justify-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary/20">
                <TrendingUp className="w-5 h-5 text-white" />
              </span>
              Latest Destinations
            </h2>
            <p className="text-gray-500 mt-2 text-base">Most recent destinations added by our hosts</p>
          </div>
          {hotelsLoading ? (
            <SkeletonGrid count={6} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotels?.map((hotel) => (
                <LatestDestinationCard key={hotel._id} hotel={hotel} />
              ))}
            </div>
          )}
        </section>

        {topPicks?.hotels?.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-8 lg:p-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

              <div className="relative">
                <h2 className="text-2xl font-display font-bold text-white mb-2">Top SmartScore Picks</h2>
                <p className="text-primary-100 mb-8 text-sm">Hotels ranked by our intelligent SmartScore algorithm</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {topPicks.hotels.map((hotel: { _id: string; name: string; city: string; pricePerNight: number; smartScore?: number; imageUrls?: string[] }) => (
                    <Link
                      key={hotel._id}
                      to={`/detail/${hotel._id}`}
                      className="group glass rounded-xl p-4 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-primary-glow"
                    >
                      <img
                        src={hotel.imageUrls?.[0] || "/placeholder-hotel.jpg"}
                        alt={hotel.name}
                        className="w-full h-24 object-cover rounded-lg mb-3 group-hover:scale-105 transition-transform duration-500"
                      />
                      <h3 className="font-semibold text-sm truncate text-gray-900">{hotel.name}</h3>
                      <p className="text-xs text-gray-500">{hotel.city}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-bold text-primary-700">₹{hotel.pricePerNight}</span>
                        <span className="bg-primary/10 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-primary-700">
                          Score: {hotel.smartScore || "N/A"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default Home;
