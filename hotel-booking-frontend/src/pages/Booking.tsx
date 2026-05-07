import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import * as apiClient from "../api-client";
import BookingForm from "../forms/BookingForm/BookingForm";
import useSearchContext from "../hooks/useSearchContext";
import { MapPin, Calendar, Users, Clock, Star, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Booking = () => {
  const { hotelId } = useParams();
  const search = useSearchContext();

  const numberOfNights =
    search.checkIn && search.checkOut
      ? Math.max(
          1,
          Math.ceil(
            (search.checkOut.getTime() - search.checkIn.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 1;

  const { data: hotel } = useQuery(
    ["fetchHotelById", hotelId],
    () => apiClient.fetchHotelById(hotelId || ""),
    {
      enabled: !!hotelId,
    }
  );

  const { data: currentUser } = useQuery(
    "fetchCurrentUser",
    apiClient.fetchCurrentUser,
    {
      retry: false,
    }
  );

  const { data: paymentIntentData, isLoading: isPaymentLoading } = useQuery(
    ["createPaymentIntent", hotelId],
    () =>
      apiClient.createPaymentIntent(hotelId || "", String(numberOfNights)),
    {
      enabled: !!hotelId,
    }
  );

  if (!hotel) {
    return <div role="status" aria-label="Loading hotel details">Loading...</div>;
  }

  if (!currentUser) {
    return <div role="status" aria-label="Loading user details">Loading user details...</div>;
  }

  if (isPaymentLoading) {
    return <div role="status" aria-label="Preparing booking">Preparing booking...</div>;
  }

  const totalPrice = hotel.pricePerNight * numberOfNights;

  return (
    <div className="space-y-8 pb-12" role="main" aria-label="Booking confirmation page">
      <Link
        to={`/detail/${hotel._id}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to {hotel.name}
      </Link>

      <div className="grid md:grid-cols-[1fr_2fr] gap-8">
        <div className="h-fit glass rounded-2xl p-6 animate-scale-in">
          <div className="relative h-48 rounded-xl overflow-hidden mb-6">
            <img
              src={hotel.imageUrls?.[0] || "/placeholder-hotel.jpg"}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-3 left-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: hotel.starRating }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-display font-bold text-gray-900 mb-6">{hotel.name}</h1>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Location</p>
                <p className="text-sm font-medium text-gray-900">{hotel.city}, {hotel.country}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Guests</p>
                <p className="text-sm font-medium text-gray-900">{search.adultCount} adult{search.adultCount !== 1 ? "s" : ""}, {search.childCount} child{search.childCount !== 1 ? "ren" : ""}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Dates</p>
                <p className="text-sm font-medium text-gray-900">{search.checkIn.toLocaleDateString()} — {search.checkOut.toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Duration</p>
                <p className="text-sm font-medium text-gray-900">{numberOfNights} night{numberOfNights > 1 ? "s" : ""}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">₹{hotel.pricePerNight} × {numberOfNights} night{numberOfNights > 1 ? "s" : ""}</p>
              </div>
              <p className="text-xl font-display font-bold text-primary-700">₹{totalPrice.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          {paymentIntentData ? (
            <BookingForm
              currentUser={currentUser}
              paymentIntent={paymentIntentData}
            />
          ) : (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-gray-500">Unable to load payment details. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;