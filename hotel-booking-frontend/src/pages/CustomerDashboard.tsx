import { useQueryWithLoading } from "../hooks/useLoadingHooks";
import * as apiClient from "../api-client";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Calendar,
  DollarSign,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  ArrowRight,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { SkeletonStats } from "../components/Skeleton";

type RecentBooking = {
  _id: string;
  firstName: string;
  lastName: string;
  checkIn: Date;
  checkOut: Date;
  totalCost: number;
  status: string;
  hotelId?: { name?: string };
  userId?: { firstName?: string; lastName?: string };
};

type RecentReview = {
  _id: string;
  title: string;
  rating: number;
  comment: string;
  createdAt: Date;
  hotelId?: { name?: string };
};

type CustomerDashboardData = {
  overview: {
    totalBookings: number;
    totalSpent: number;
    upcomingBookings: number;
    totalReviews: number;
  };
  recentBookings: RecentBooking[];
  recentReviews: RecentReview[];
  favoriteDestinations: { city: string; count: number }[];
};

const CustomerDashboard = () => {
  const { data, isLoading } = useQueryWithLoading<CustomerDashboardData>(
    "customerDashboard",
    apiClient.fetchCustomerDashboard,
    { loadingMessage: "Loading your dashboard..." }
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        <SkeletonStats count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { overview, recentBookings, recentReviews, favoriteDestinations } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-blue-100">Here's a summary of your travel activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{overview.totalBookings}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Upcoming Trips</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{overview.upcomingBookings}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Spent</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">₹{overview.totalSpent.toFixed(0)}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Reviews Written</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{overview.totalReviews}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <MessageSquare className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/search" className="block">
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all text-center">
                  <Search className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="font-medium text-gray-700">Search Hotels</p>
                  <p className="text-sm text-gray-500">Find your next stay</p>
                </div>
              </Link>
              <Link to="/my-bookings" className="block">
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all text-center">
                  <Calendar className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="font-medium text-gray-700">My Bookings</p>
                  <p className="text-sm text-gray-500">View all reservations</p>
                </div>
              </Link>
              <Link to="/profile" className="block">
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all text-center">
                  <TrendingUp className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="font-medium text-gray-700">My Profile</p>
                  <p className="text-sm text-gray-500">Manage your account</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Your latest hotel reservations</CardDescription>
              </div>
              <Link to="/my-bookings">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No bookings yet. Start exploring hotels!</p>
                <Link to="/search" className="mt-2 inline-block">
                  <Button variant="link" className="text-primary-600">
                    Search Hotels
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => {
                  const statusColors: Record<string, string> = {
                    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
                    confirmed: "bg-green-100 text-green-800 border-green-200",
                    cancelled: "bg-red-100 text-red-800 border-red-200",
                    completed: "bg-blue-100 text-blue-800 border-blue-200",
                    refunded: "bg-gray-100 text-gray-800 border-gray-200",
                  };
                  const statusIcons: Record<string, React.ReactNode> = {
                    pending: <Clock className="w-3 h-3" />,
                    confirmed: <CheckCircle className="w-3 h-3" />,
                    cancelled: <XCircle className="w-3 h-3" />,
                    completed: <Star className="w-3 h-3" />,
                    refunded: <DollarSign className="w-3 h-3" />,
                  };

                  return (
                    <div key={booking._id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white rounded-lg border">
                            <Calendar className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {booking.firstName} {booking.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(booking.checkIn).toLocaleDateString()} — {new Date(booking.checkOut).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">₹{booking.totalCost}</span>
                          <Badge className={`${statusColors[booking.status]} border`}>
                            {statusIcons[booking.status]}
                            <span className="ml-1">{booking.status}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Favorite Destinations & Recent Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Destinations</CardTitle>
              <CardDescription>Where you've stayed the most</CardDescription>
            </CardHeader>
            <CardContent>
              {favoriteDestinations.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No destinations yet</p>
              ) : (
                <div className="space-y-3">
                  {favoriteDestinations.map((dest, i) => (
                    <div key={dest.city} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400">#{i + 1}</span>
                        <div>
                          <MapPin className="w-4 h-4 text-primary-600 inline mr-1" />
                          <span className="font-medium">{dest.city}</span>
                        </div>
                      </div>
                      <Badge variant="outline">{dest.city === favoriteDestinations[0]?.city ? "Most Visited" : `${dest.count} stays`}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Reviews</CardTitle>
              <CardDescription>Hotels you've reviewed</CardDescription>
            </CardHeader>
            <CardContent>
              {recentReviews.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {recentReviews.map((review) => (
                    <div key={review._id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{review.title}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{review.comment}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
