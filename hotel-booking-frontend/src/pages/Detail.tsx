import { useParams } from "react-router-dom";
import { useQueryWithLoading } from "../hooks/useLoadingHooks";
import * as apiClient from "./../api-client";
import GuestInfoForm from "../forms/GuestInfoForm/GuestInfoForm";
import ReviewForm from "../components/ReviewForm";
import ReviewDisplay from "../components/ReviewDisplay";
import SmartScoreBadge from "../components/SmartScoreBadge";
import EcoBadge from "../components/EcoBadge";
import LocalExperiences from "../components/LocalExperiences";
import HotelMap from "../components/HotelMap";
import { Badge } from "../components/ui/badge";
import {
  MapPin,
  Phone,
  Globe,
  Clock,
  Car,
  Wifi,
  Waves,
  Dumbbell,
  Sparkles,
  Plane,
  Building2,
  Heart,
  Star,
} from "lucide-react";
import { useQuery, useMutation } from "react-query";
import useAppContext from "../hooks/useAppContext";

const Detail = () => {
  const { hotelId } = useParams();
  const { isLoggedIn } = useAppContext();
  const { showToast } = useAppContext();

  const { data: hotel } = useQueryWithLoading(
    "fetchHotelById",
    () => apiClient.fetchHotelById(hotelId || ""),
    {
      enabled: !!hotelId,
      loadingMessage: "Loading hotel details...",
    }
  );

  const { data: wishlistData, refetch: refetchWishlist } = useQuery(
    ["wishlist-check", hotelId],
    () => apiClient.checkWishlist(hotelId || ""),
    { enabled: !!hotelId && isLoggedIn }
  );

  const addMutation = useMutation(apiClient.addToWishlist, {
    onSuccess: () => {
      showToast({ title: "Added to Wishlist", description: hotel?.name, type: "SUCCESS" });
      refetchWishlist();
    },
  });

  const removeMutation = useMutation(apiClient.removeFromWishlist, {
    onSuccess: () => {
      showToast({ title: "Removed from Wishlist", type: "SUCCESS" });
      refetchWishlist();
    },
  });

  const isInWishlist = wishlistData?.inWishlist;

  if (!hotel) {
    return (
      <div className="text-center text-lg text-gray-500 py-10">
        No hotel found.
      </div>
    );
  }

  const getFacilityIcon = (facility: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      "Free WiFi": <Wifi className="w-4 h-4" />,
      "Parking": <Car className="w-4 h-4" />,
      "Airport Shuttle": <Plane className="w-4 h-4" />,
      "Outdoor Pool": <Waves className="w-4 h-4" />,
      "Spa": <Sparkles className="w-4 h-4" />,
      "Fitness Center": <Dumbbell className="w-4 h-4" />,
      "Family Rooms": <Building2 className="w-4 h-4" />,
      "Non-Smoking Rooms": <Building2 className="w-4 h-4" />,
    };
    return iconMap[facility] || <Building2 className="w-4 h-4" />;
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: hotel.starRating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
              {hotel.name}
            </h1>
          </div>
          {isLoggedIn && (
            <button
              onClick={() => isInWishlist ? removeMutation.mutate(hotel._id) : addMutation.mutate(hotel._id)}
              className={`p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                isInWishlist
                  ? "border-red-200 bg-red-50 text-red-500 shadow-lg shadow-red-500/10"
                  : "border-gray-200 hover:border-red-200 hover:bg-red-50/50 text-gray-400"
              }`}
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? "fill-red-500" : ""}`} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{hotel.city}, {hotel.country}</span>
          </div>
          {hotel.contact?.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-4 h-4" />
              <span>{hotel.contact.phone}</span>
            </div>
          )}
          {hotel.contact?.website && (
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              <a
                href={hotel.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Website
              </a>
            </div>
          )}
        </div>

        {((hotel.totalBookings && hotel.totalBookings > 0) ||
          (hotel.totalRevenue && hotel.totalRevenue > 0) ||
          hotel.isFeatured ||
          hotel.averageRating ||
          hotel.smartScore ||
          hotel.ecoScore) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {hotel.totalBookings && hotel.totalBookings > 0 && (
              <Badge variant="outline" className="bg-gray-50">{hotel.totalBookings} bookings</Badge>
            )}
            {hotel.totalRevenue && hotel.totalRevenue > 0 && (
              <Badge variant="outline" className="bg-gray-50">₹{hotel.totalRevenue.toLocaleString()} revenue</Badge>
            )}
            <Badge variant="outline" className="bg-gray-50">
              {hotel.averageRating && hotel.averageRating > 0
                ? `${hotel.averageRating.toFixed(1)} avg rating`
                : "Rating feature not yet implemented"}
            </Badge>
            {hotel.isFeatured && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0">Featured</Badge>
            )}
            {hotel.smartScore && hotel.smartScore > 0 && (
              <SmartScoreBadge score={hotel.smartScore} size="sm" />
            )}
            {hotel.ecoScore && hotel.ecoScore > 0 && (
              <EcoBadge score={hotel.ecoScore} badges={hotel.ecoBadges} />
            )}
          </div>
        )}

        {hotel.type && hotel.type.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {hotel.type.map((type, index) => (
              <Badge
                key={index}
                variant="default"
                className="bg-primary/10 text-primary-700 border-0 font-medium"
              >
                {type}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 animate-fade-in-up">
        {hotel.imageUrls.map((image: string, i: number) => (
          <div key={i} className={`h-[300px] rounded-2xl overflow-hidden group ${i === 0 ? 'lg:col-span-2' : ''}`}>
            <img
              src={image}
              alt={`${hotel.name} - image ${i + 1}`}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-display font-bold text-primary-700">₹{hotel.pricePerNight}</p>
              <p className="text-sm text-gray-500">per night</p>
            </div>
            <div className="h-10 w-px bg-gray-200 hidden sm:block" />
            <div className="flex items-center gap-5">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">{hotel.adultCount}</p>
                <p className="text-xs text-gray-500">Adults</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">{hotel.childCount}</p>
                <p className="text-xs text-gray-500">Children</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: hotel.starRating }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-2 text-sm text-gray-500">Star Rating</span>
          </div>
        </div>
      </div>

      {hotel.description && (
        <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <h3 className="text-xl font-display font-semibold mb-3 text-gray-900">About This Hotel</h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {hotel.description}
          </p>
        </div>
      )}

      {hotel.contact && (
        <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <h3 className="text-lg font-display font-semibold mb-4 text-gray-900">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hotel.contact.phone && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{hotel.contact.phone}</p>
                </div>
              </div>
            )}
            {hotel.contact.email && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-900">{hotel.contact.email}</p>
                </div>
              </div>
            )}
            {hotel.contact.website && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Website</p>
                  <a
                    href={hotel.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Visit Website
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {hotel.policies && (
        <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
          <h3 className="text-lg font-display font-semibold mb-4 text-gray-900">Hotel Policies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hotel.policies.checkInTime && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
                <Clock className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-gray-400">Check-in</p>
                  <p className="text-sm font-medium text-gray-900">{hotel.policies.checkInTime}</p>
                </div>
              </div>
            )}
            {hotel.policies.checkOutTime && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
                <Clock className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-gray-400">Check-out</p>
                  <p className="text-sm font-medium text-gray-900">{hotel.policies.checkOutTime}</p>
                </div>
              </div>
            )}
            {hotel.policies.cancellationPolicy && (
              <div className="p-3 rounded-xl bg-gray-50/50">
                <p className="text-xs text-gray-400">Cancellation</p>
                <p className="text-sm font-medium text-gray-900">{hotel.policies.cancellationPolicy}</p>
              </div>
            )}
            {hotel.policies.petPolicy && (
              <div className="p-3 rounded-xl bg-gray-50/50">
                <p className="text-xs text-gray-400">Pet Policy</p>
                <p className="text-sm font-medium text-gray-900">{hotel.policies.petPolicy}</p>
              </div>
            )}
            {hotel.policies.smokingPolicy && (
              <div className="p-3 rounded-xl bg-gray-50/50">
                <p className="text-xs text-gray-400">Smoking</p>
                <p className="text-sm font-medium text-gray-900">{hotel.policies.smokingPolicy}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        <h3 className="text-lg font-display font-semibold mb-4 text-gray-900">Facilities</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {hotel.facilities.map((facility) => (
            <div key={facility} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50/50 hover:bg-primary/5 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {getFacilityIcon(facility)}
              </div>
              <span className="text-sm text-gray-700">{facility}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "350ms" }}>
        <GuestInfoForm
          pricePerNight={hotel.pricePerNight}
          hotelId={hotel._id}
        />
      </div>

      {hotel.nearbyExperiences && hotel.nearbyExperiences.length > 0 && (
        <LocalExperiences experiences={hotel.nearbyExperiences} />
      )}

      {hotel.location?.latitude && hotel.location?.longitude && (
        <div className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <h3 className="text-xl font-display font-semibold mb-4 text-gray-900">Location</h3>
          <HotelMap
            latitude={hotel.location.latitude}
            longitude={hotel.location.longitude}
            name={hotel.name}
            address={hotel.location.address?.street}
          />
        </div>
      )}

      <ReviewDisplay hotelId={hotel._id} />

      {isLoggedIn && (
        <ReviewForm
          hotelId={hotel._id}
          userName={localStorage.getItem("user_name") || "Anonymous"}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};

export default Detail;
