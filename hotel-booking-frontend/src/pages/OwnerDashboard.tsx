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
  Building2,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
} from "lucide-react";
import { SkeletonStats, SkeletonChart } from "../components/Skeleton";

type RecentBooking = {
  _id: string;
  checkIn: Date;
  checkOut: Date;
  totalCost: number;
  status: string;
  userId?: { firstName?: string; lastName?: string };
};

type OwnerDashboardData = {
  overview: {
    totalHotels: number;
    totalBookings: number;
    totalRevenue: number;
    avgRating: number;
    totalReviews: number;
  };
  bookingsByStatus: {
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
  };
  recentBookings: RecentBooking[];
  monthlyRevenue: { _id: number; revenue: number }[];
  occupancyRates: { hotelId: string; name: string; bookings: number; revenue: number }[];
};

const OwnerDashboard = () => {
  const { data, isLoading } = useQueryWithLoading<OwnerDashboardData>(
    "ownerDashboard",
    apiClient.fetchOwnerDashboard,
    { loadingMessage: "Loading owner dashboard..." }
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mt-2 animate-pulse" />
          </div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
        </div>
        <SkeletonStats count={4} />
        <SkeletonChart />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { overview, bookingsByStatus, recentBookings, monthlyRevenue, occupancyRates } = data;

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your hotels and track performance</p>
          </div>
          <Link to="/add-hotel">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Hotel
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Hotels</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{overview.totalHotels}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{overview.totalBookings}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">₹{overview.totalRevenue.toFixed(0)}</p>
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
                  <p className="text-sm font-medium text-gray-500">Avg Rating</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{overview.avgRating}★</p>
                  <p className="text-xs text-gray-400">{overview.totalReviews} reviews</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings by Status</CardTitle>
            <CardDescription>Current distribution of your bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Pending</span>
                </div>
                <p className="text-2xl font-bold text-yellow-700">{bookingsByStatus.pending}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Confirmed</span>
                </div>
                <p className="text-2xl font-bold text-green-700">{bookingsByStatus.confirmed}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Cancelled</span>
                </div>
                <p className="text-2xl font-bold text-red-700">{bookingsByStatus.cancelled}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Completed</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">{bookingsByStatus.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue Chart */}
        {monthlyRevenue.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>Revenue trend for the current year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-48">
                {monthlyRevenue.map((m) => (
                  <div key={m._id} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all hover:from-blue-700 hover:to-blue-500"
                      style={{ height: `${(m.revenue / maxRevenue) * 100}%`, minHeight: "4px" }}
                    />
                    <span className="text-xs text-gray-500">{months[m._id - 1]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Bookings & Hotel Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest bookings across your hotels</CardDescription>
            </CardHeader>
            <CardContent>
              {recentBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No bookings yet</p>
              ) : (
                <div className="space-y-4">
                  {recentBookings.slice(0, 5).map((booking) => {
                    const statusColors: Record<string, string> = {
                      pending: "bg-yellow-100 text-yellow-800",
                      confirmed: "bg-green-100 text-green-800",
                      cancelled: "bg-red-100 text-red-800",
                      completed: "bg-blue-100 text-blue-800",
                    };
                    return (
                      <div key={booking._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">
                            {booking.userId?.firstName || "Guest"} {booking.userId?.lastName || ""}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm">₹{booking.totalCost}</span>
                          <Badge className={statusColors[booking.status] || "bg-gray-100 text-gray-800"}>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hotel Performance</CardTitle>
              <CardDescription>Bookings and revenue by property</CardDescription>
            </CardHeader>
            <CardContent>
              {occupancyRates.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hotels added yet</p>
              ) : (
                <div className="space-y-4">
                  {occupancyRates.map((h) => (
                    <div key={h.hotelId} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{h.name}</p>
                        <Link to={`/my-hotels`} className="text-primary-600 hover:underline text-xs">
                          <Eye className="w-3 h-3 inline mr-1" />
                          Manage
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Bookings</p>
                          <p className="font-semibold">{h.bookings}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Revenue</p>
                          <p className="font-semibold">₹{h.revenue.toFixed(0)}</p>
                        </div>
                      </div>
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

export default OwnerDashboard;
