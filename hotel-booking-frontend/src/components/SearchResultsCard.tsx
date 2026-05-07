import { Link } from "react-router-dom";
import { memo } from "react";
import { HotelType } from "../shared/types";
import type { LucideIcon } from "lucide-react";
import {
  MapPin,
  Building2,
  Users,
  Wifi,
  Car,
  Waves,
  Dumbbell,
  Sparkles,
  UtensilsCrossed,
  Coffee,
  Plane,
  Building,
  Star,
} from "lucide-react";
import { Badge } from "./ui/badge";

type Props = {
  hotel: HotelType;
};

const SearchResultsCard = memo(({ hotel }: Props) => {
  const getFacilityIcon = (facility: string) => {
    const iconMap: Record<string, LucideIcon> = {
      "Free WiFi": Wifi,
      "Free Parking": Car,
      "Swimming Pool": Waves,
      "Fitness Center": Dumbbell,
      Spa: Sparkles,
      Restaurant: UtensilsCrossed,
      "Bar/Lounge": Coffee,
      "Airport Shuttle": Plane,
      "Business Center": Building,
    };
    return iconMap[facility] || Building2;
  };

  return (
    <div className="group hover-lift bg-white rounded-2xl shadow-soft hover:shadow-elevated transition-all duration-500 border border-gray-100/80 overflow-hidden h-auto xl:h-[500px] flex" role="article" aria-label={`Hotel listing: ${hotel.name}`}>
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_3fr] gap-0 w-full h-full">
        <div className="relative overflow-hidden h-64 xl:h-[500px]">
          <img
            src={hotel.imageUrls[0]}
            alt={hotel.name}
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="absolute top-4 left-4 flex flex-col space-y-2">
            <div className="bg-white/90 backdrop-blur-md rounded-full px-4 py-1.5 shadow-medium">
              <span className="text-sm font-bold text-primary-700">₹{hotel.pricePerNight}</span>
              <span className="text-xs text-gray-500 ml-1">/ night</span>
            </div>
            {hotel.isFeatured && (
              <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-full px-3 py-1 shadow-md">
                <span className="text-xs font-semibold">Featured</span>
              </div>
            )}
          </div>

          <div className="absolute top-4 right-4">
            <div className="bg-white/90 backdrop-blur-md rounded-full px-3 py-1 flex items-center space-x-1 shadow-sm">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold text-gray-800">
                {hotel.starRating}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 xl:p-8 flex flex-col justify-between h-auto xl:h-full overflow-hidden">
          <div className="space-y-4 overflow-y-auto xl:flex-1">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: hotel.starRating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(hotel.type) ? (
                    hotel.type.slice(0, 3).map((type) => (
                        <Badge
                          key={type}
                          variant="default"
                          className="text-xs px-2.5 py-0.5 font-medium"
                        >
                          {type}
                        </Badge>
                    ))
                  ) : (
                    <Badge variant="default" className="text-xs px-2.5 py-0.5 font-medium">
                      {hotel.type}
                    </Badge>
                  )}
                </div>
              </div>

              <Link
                to={`/detail/${hotel._id}`}
                className="text-2xl font-display font-bold text-gray-900 hover:text-primary transition-colors cursor-pointer block line-clamp-1"
              >
                {hotel.name}
              </Link>

              <div className="flex items-center text-gray-500">
                <MapPin className="w-4 h-4 mr-1.5 shrink-0" />
                <span className="text-sm">
                  {hotel.city}, {hotel.country}
                </span>
              </div>
            </div>

            <div className="text-gray-500 leading-relaxed line-clamp-3 text-sm">
              {hotel.description}
            </div>

            <div className="flex items-center space-x-5 text-sm text-gray-500">
              {hotel.totalBookings && (
                <div className="flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-primary" />
                  <span>{hotel.totalBookings} bookings</span>
                </div>
              )}
              <div className="flex items-center space-x-1.5">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>
                  {hotel.averageRating && hotel.averageRating > 0
                    ? `${hotel.averageRating.toFixed(1)} avg rating`
                    : "No ratings yet"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Key Amenities
              </h4>
              <div className="flex flex-wrap gap-2">
                {hotel.facilities.slice(0, 5).map((facility) => {
                  const IconComponent = getFacilityIcon(facility);
                  return (
                    <Badge
                      key={facility}
                      variant="outline"
                      className="flex items-center space-x-1.5 px-2.5 py-1 text-xs bg-gray-50/50 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                    >
                      <IconComponent className="w-3 h-3 text-primary" />
                      <span>{facility}</span>
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <Link
                to={`/detail/${hotel._id}`}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 btn-shine text-white py-3 px-6 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 text-center block shadow-soft hover:shadow-medium hover:scale-[1.02]"
              >
                View Details & Book
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default SearchResultsCard;
