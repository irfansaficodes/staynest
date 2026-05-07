import { useQuery, useMutation } from "react-query";
import * as apiClient from "../api-client";
import useAppContext from "../hooks/useAppContext";
import { Link } from "react-router-dom";
import { Heart, MapPin, Trash2 } from "lucide-react";
import { SkeletonGrid } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import type { HotelType } from "../shared/types";

const WishlistPage = () => {
  const { showToast } = useAppContext();

  const { data, refetch, isLoading } = useQuery("fetchWishlist", apiClient.fetchWishlist);

  const removeMutation = useMutation(apiClient.removeFromWishlist, {
    onSuccess: () => {
      showToast({ title: "Removed", description: "Hotel removed from wishlist", type: "SUCCESS" });
      refetch();
    },
    onError: () => showToast({ title: "Error", description: "Could not remove from wishlist", type: "ERROR" }),
  });

  const wishlist = data?.wishlist || [];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
        </div>
        <SkeletonGrid count={6} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-red-500 fill-red-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600">{wishlist.length} hotels saved</p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Start exploring and save your favorite hotels for later"
          actionLabel="Explore Hotels"
          actionLink="/"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((hotel: HotelType) => (
            <div key={hotel._id} className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow">
              <Link to={`/detail/${hotel._id}`}>
                <img
                  src={hotel.imageUrls?.[0] || "/placeholder-hotel.jpg"}
                  alt={hotel.name}
                  className="w-full h-48 object-cover"
                />
              </Link>
              <div className="p-4">
                <Link to={`/detail/${hotel._id}`}>
                  <h3 className="font-bold text-gray-900 text-lg hover:text-primary-600">{hotel.name}</h3>
                </Link>
                <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{hotel.city}, {hotel.country}</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div>
                    <span className="text-xl font-bold text-gray-900">₹{hotel.pricePerNight}</span>
                    <span className="text-xs text-gray-500">/night</span>
                  </div>
                  <button
                    onClick={() => removeMutation.mutate(hotel._id)}
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
