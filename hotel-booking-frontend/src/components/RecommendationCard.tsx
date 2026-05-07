import { HotelType } from "../shared/types";
import { Link } from "react-router-dom";
import SmartScoreBadge from "./SmartScoreBadge";
import { Heart, MapPin } from "lucide-react";
import { useMutationWithLoading } from "../hooks/useLoadingHooks";
import * as apiClient from "../api-client";
import { useQueryClient } from "react-query";
import useAppContext from "../hooks/useAppContext";
import { useQuery } from "react-query";

interface RecommendationCardProps {
  hotel: HotelType;
  score: number;
  reason: string;
}

const RecommendationCard = ({ hotel, score, reason }: RecommendationCardProps) => {
  const queryClient = useQueryClient();
  const { showToast } = useAppContext();

  const { data: wishlistData } = useQuery(["wishlist-check", hotel._id], () =>
    apiClient.checkWishlist(hotel._id),
    { enabled: !!localStorage.getItem("session_id") }
  );

  const addMutation = useMutationWithLoading(apiClient.addToWishlist, {
    onSuccess: () => {
      showToast({ title: "Added to Wishlist", description: hotel.name, type: "SUCCESS" });
      queryClient.invalidateQueries(["wishlist-check", hotel._id]);
    },
    onError: () => showToast({ title: "Error", description: "Could not add to wishlist", type: "ERROR" }),
    loadingMessage: "Adding...",
  });

  const removeMutation = useMutationWithLoading(apiClient.removeFromWishlist, {
    onSuccess: () => {
      showToast({ title: "Removed from Wishlist", description: hotel.name, type: "SUCCESS" });
      queryClient.invalidateQueries(["wishlist-check", hotel._id]);
    },
    onError: () => showToast({ title: "Error", description: "Could not remove", type: "ERROR" }),
    loadingMessage: "Removing...",
  });

  const isInWishlist = wishlistData?.inWishlist;

  const handleWishlist = () => {
    if (isInWishlist) {
      removeMutation.mutate(hotel._id);
    } else {
      addMutation.mutate(hotel._id);
    }
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <Link to={`/detail/${hotel._id}`}>
          <img
            src={hotel.imageUrls?.[0] || "/placeholder-hotel.jpg"}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        <div className="absolute top-3 left-3">
          <SmartScoreBadge score={score} size="sm" />
        </div>
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
        >
          <Heart className={`w-4 h-4 ${isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
        </button>
        {hotel.isFeatured && (
          <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold rounded-full">
            Featured
          </div>
        )}
      </div>
      <div className="p-4">
        <Link to={`/detail/${hotel._id}`}>
          <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary-600 transition-colors truncate">
            {hotel.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
          <MapPin className="w-3.5 h-3.5" />
          <span>{hotel.city}, {hotel.country}</span>
        </div>
        <p className="text-xs text-primary-600 mt-2 bg-primary-50 px-2 py-1 rounded-md inline-block">
          {reason}
        </p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div>
            <span className="text-xs text-gray-500">from</span>
            <span className="text-xl font-bold text-gray-900 ml-1">₹{hotel.pricePerNight}</span>
            <span className="text-xs text-gray-500">/night</span>
          </div>
          {hotel.averageRating && (
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-gray-900">{hotel.averageRating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({hotel.reviewCount})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
