import { useState } from "react";
import { useQuery, useMutation } from "react-query";
import { queryClient } from "../main";
import * as apiClient from "../api-client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, Hotel, Calendar, DollarSign, TrendingUp, AlertTriangle, Shield, Activity, Search, UserCheck, CheckCircle, XCircle, Trash2, Clock } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import useAppContext from "../hooks/useAppContext";
import { SkeletonStats, SkeletonChart, SkeletonRow } from "../components/Skeleton";
import type { UserType, BookingType, HotelType, ReviewType } from "../shared/types";

type MonthlyRevenueItem = {
  _id: number;
  revenue: number;
  bookings: number;
};

type DashboardOverview = {
  totalUsers: number;
  totalHotels: number;
  totalBookings: number;
  totalRevenue: number;
};

type SystemHealth = {
  avgRating?: number;
};

type TopHotel = HotelType & {
  totalRevenue?: number;
  totalBookings?: number;
  averageRating?: number;
};

type AdminUser = UserType & {
  createdAt: Date;
};

type BookingWithHotel = Omit<BookingType, "hotelId"> & {
  hotelId?: { name?: string } | string;
};

type AdminDashboardData = {
  overview: DashboardOverview;
  usersByRole: Record<string, number>;
  topHotels: TopHotel[];
  monthlyRevenue: MonthlyRevenueItem[];
  systemHealth: SystemHealth;
  flaggedReviews: ReviewType[];
  recentUsers: AdminUser[];
  recentBookings: BookingWithHotel[];
};

type AdminUsersResponse = {
  users: AdminUser[];
};

const COLORS = ["#0d9488", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

const AdminDashboard = () => {
  const { showToast } = useAppContext();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "hotels" | "verification" | "reviews">("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useQuery<AdminDashboardData>("adminDashboard", apiClient.fetchAdminDashboard);
  const { data: usersData, isLoading: usersLoading } = useQuery<AdminUsersResponse>("adminUsers", apiClient.fetchAdminUsers);
  const { data: allHotels, isLoading: hotelsLoading } = useQuery<HotelType[]>("adminHotels", apiClient.fetchHotels, {
    enabled: activeTab === "hotels",
  });

  const { data: pendingHotelsData, isLoading: pendingLoading } = useQuery<{ hotels: HotelType[] }>(
    "pendingHotels",
    apiClient.fetchPendingHotels,
    { enabled: activeTab === "verification" }
  );

  const verifyHotelMutation = useMutation(
    ({ hotelId, status, notes }: { hotelId: string; status: "approved" | "rejected" | "pending"; notes?: string }) =>
      apiClient.verifyHotel(hotelId, status, notes),
    {
      onSuccess: (_, { status }) => {
        showToast({
          title: status === "approved" ? "Hotel Approved" : status === "rejected" ? "Hotel Rejected" : "Hotel Status Updated",
          description: `The hotel has been ${status} successfully`,
          type: "SUCCESS",
        });
      },
      onError: () => {
        showToast({ title: "Update Failed", description: "Could not update hotel verification status", type: "ERROR" });
      },
    }
  );
  
  const deleteHotelMutation = useMutation(apiClient.deleteHotel, {
    onSuccess: () => {
      showToast({ title: "Hotel Deleted", description: "Hotel has been removed from the platform", type: "SUCCESS" });
    },
    onError: () => {
      showToast({ title: "Delete Failed", description: "Could not delete hotel", type: "ERROR" });
    },
    onSettled: () => {
      queryClient.invalidateQueries("adminDashboard");
    },
  });

  const handleDeleteHotel = (hotelId: string, hotelName: string) => {
    if (window.confirm(`Are you sure you want to delete "${hotelName}"? This action cannot be undone.`)) {
      deleteHotelMutation.mutate(hotelId);
    }
  };
  
  const roleMutation = useMutation(
    ({ userId, role }: { userId: string; role: string }) => apiClient.updateUserRole(userId, role),
    {
      onSuccess: () => {
        showToast({ title: "Role Updated", description: "User role has been updated successfully", type: "SUCCESS" });
      },
      onError: () => {
        showToast({ title: "Update Failed", description: "Could not update user role", type: "ERROR" });
      },
    },
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse" />
              <div className="h-8 bg-gray-700 rounded w-48 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <SkeletonStats count={5} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SkeletonChart />
            <SkeletonChart />
          </div>
          <SkeletonChart />
        </div>
      </div>
    );
  }

  if (!data) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center py-12 text-gray-500">Unable to load dashboard</div>
    </div>
  );

  const { overview, usersByRole, topHotels, monthlyRevenue, systemHealth, flaggedReviews, recentUsers, recentBookings } = data;

  const roleData = Object.entries(usersByRole || {}).map(([name, value]) => ({ name, value }));
  
  const revenueData = (monthlyRevenue || []).map((m: any) => ({
    month: ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m._id],
    revenue: m.revenue,
    bookings: m.bookings,
  }));

  const filteredUsers = (usersData?.users || []).filter((u: any) =>
    searchQuery === "" ||
    u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-amber-400" />
                <h1 className="text-3xl font-bold">Admin Control Panel</h1>
              </div>
              <p className="text-gray-400 mt-2">Platform management, analytics, and user moderation</p>
            </div>
            <Badge className="bg-amber-500 text-gray-900 font-bold px-4 py-1.5">
              <Activity className="w-3 h-3 mr-1" />
              System Online
            </Badge>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-1 flex gap-1" role="tablist" aria-label="Dashboard sections">
          {[
            { id: "overview" as const, label: "Overview", icon: TrendingUp },
            { id: "users" as const, label: "User Management", icon: Users },
            { id: "hotels" as const, label: "Hotels", icon: Hotel },
            { id: "verification" as const, label: "Verification", icon: Shield },
            { id: "reviews" as const, label: "Reviews", icon: AlertTriangle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { icon: Users, label: "Total Users", value: overview.totalUsers, color: "text-blue-600", bgColor: "bg-blue-50" },
                { icon: Hotel, label: "Total Hotels", value: overview.totalHotels, color: "text-emerald-600", bgColor: "bg-emerald-50" },
                { icon: Calendar, label: "Bookings", value: overview.totalBookings, color: "text-purple-600", bgColor: "bg-purple-50" },
                { icon: DollarSign, label: "Revenue", value: `₹${(overview.totalRevenue || 0).toLocaleString()}`, color: "text-amber-600", bgColor: "bg-amber-50" },
                { icon: Activity, label: "Avg Rating", value: systemHealth.avgRating?.toFixed(1) || "N/A", color: "text-red-600", bgColor: "bg-red-50" },
              ].map((stat, i) => (
                <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Monthly Revenue</CardTitle>
                  <CardDescription>Revenue trends over the past year</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData} aria-label="Monthly revenue chart" role="img">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                      <Line type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={3} dot={{ fill: "#0d9488" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Users by Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart aria-label="Users by role distribution" role="img">
                      <Pie data={roleData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                        {roleData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    Recent Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(recentUsers || []).slice(0, 5).map((user: any) => (
                      <div key={user._id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Recent Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(recentBookings || []).slice(0, 5).map((booking: BookingWithHotel) => (
                      <div key={booking._id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium text-gray-900">
                            {typeof booking.hotelId === "object" ? booking.hotelId?.name : "Unknown Hotel"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.firstName} {booking.lastName}
                          </p>
                        </div>
                        <Badge
                          className={
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Hotels Table */}
            {topHotels?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hotel className="w-5 h-5 text-emerald-600" />
                    Top Performing Hotels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" aria-label="Top performing hotels">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th scope="col" className="text-left py-3 px-4 font-semibold text-gray-600">#</th>
                          <th scope="col" className="text-left py-3 px-4 font-semibold text-gray-600">Hotel</th>
                          <th scope="col" className="text-left py-3 px-4 font-semibold text-gray-600">City</th>
                          <th scope="col" className="text-right py-3 px-4 font-semibold text-gray-600">Revenue</th>
                          <th scope="col" className="text-right py-3 px-4 font-semibold text-gray-600">Bookings</th>
                          <th scope="col" className="text-right py-3 px-4 font-semibold text-gray-600">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topHotels.map((hotel: any, i: number) => (
                          <tr key={hotel._id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-bold text-gray-900">{i + 1}</td>
                            <td className="py-3 px-4 font-medium text-gray-900">{hotel.name}</td>
                            <td className="py-3 px-4 text-gray-500">{hotel.city}</td>
                            <td className="py-3 px-4 text-right font-semibold text-emerald-600">₹{(hotel.totalRevenue || 0).toLocaleString()}</td>
                            <td className="py-3 px-4 text-right text-gray-700">{hotel.totalBookings || 0}</td>
                            <td className="py-3 px-4 text-right text-amber-600 font-medium">{hotel.averageRating?.toFixed(1) || "N/A"} ★</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user accounts and roles</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      aria-label="Search users by name or email"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))}
                  </div>
                ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" aria-label="User management table">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th scope="col" className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                        <th scope="col" className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                        <th scope="col" className="text-left py-3 px-4 font-semibold text-gray-600">Role</th>
                        <th scope="col" className="text-left py-3 px-4 font-semibold text-gray-600">Joined</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user: any) => (
                        <tr key={user._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{user.firstName} {user.lastName}</td>
                          <td className="py-3 px-4 text-gray-600">{user.email}</td>
                          <td className="py-3 px-4">
                            <Select
                              defaultValue={user.role}
                              onValueChange={(newRole) => roleMutation.mutate({ userId: user._id, role: newRole })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="hotel_owner">Hotel Owner</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {user.role === "admin" ? (
                                <Badge className="bg-amber-100 text-amber-800">
                                  <Shield className="w-3 h-3 mr-1" /> Admin
                                </Badge>
                              ) : user.role === "hotel_owner" ? (
                                <Badge className="bg-emerald-100 text-emerald-800">
                                  <Hotel className="w-3 h-3 mr-1" /> Owner
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-100 text-blue-800">
                                  <Users className="w-3 h-3 mr-1" /> User
                                </Badge>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "hotels" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Hotel Management</CardTitle>
                    <CardDescription>Manage and delete hotels on the platform</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search hotels..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      aria-label="Search hotels by name or city"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {hotelsLoading ? (
                  <div className="space-y-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" aria-label="Hotel management table">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th scope="col" className="text-left py-3 px-4 font-semibold text-gray-600">#</th>
                          <th scope="col" className="text-left py-3 px-4 font-semibold text-gray-600">Hotel</th>
                          <th scope="col" className="text-left py-3 px-4 font-semibold text-gray-600">City</th>
                          <th scope="col" className="text-right py-3 px-4 font-semibold text-gray-600">Price/Night</th>
                          <th scope="col" className="text-right py-3 px-4 font-semibold text-gray-600">Bookings</th>
                          <th scope="col" className="text-right py-3 px-4 font-semibold text-gray-600">Rating</th>
                          <th scope="col" className="text-right py-3 px-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(allHotels || [])
                          .filter((h: HotelType) =>
                            searchQuery === "" ||
                            h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            h.city.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((hotel: HotelType, i: number) => (
                            <tr key={hotel._id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4 font-bold text-gray-900">{i + 1}</td>
                              <td className="py-3 px-4 font-medium text-gray-900">{hotel.name}</td>
                              <td className="py-3 px-4 text-gray-500">{hotel.city}, {hotel.country}</td>
                              <td className="py-3 px-4 text-right font-semibold text-gray-900">₹{hotel.pricePerNight}</td>
                              <td className="py-3 px-4 text-right text-gray-700">{hotel.totalBookings || 0}</td>
                              <td className="py-3 px-4 text-right text-amber-600 font-medium">{hotel.averageRating?.toFixed(1) || "N/A"}</td>
                              <td className="py-3 px-4 text-right">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteHotel(hotel._id, hotel.name)}
                                  disabled={deleteHotelMutation.isLoading}
                                  aria-label={`Delete ${hotel.name}`}
                                >
                                  <Trash2 className="w-3 h-3 mr-1" /> Delete
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "verification" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-amber-600" />
                      Hotel Verification
                    </CardTitle>
                    <CardDescription>
                      Review and approve pending hotel listings
                    </CardDescription>
                  </div>
                  {(pendingHotelsData?.hotels || []).length > 0 && (
                    <Badge className="bg-amber-500 text-white font-bold">
                      {(pendingHotelsData?.hotels || []).length} Pending
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {pendingLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))}
                  </div>
                ) : (pendingHotelsData?.hotels || []).length === 0 ? (
                  <div className="py-12 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">All Caught Up!</h3>
                    <p className="text-gray-500 mt-1">No pending hotels waiting for verification.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(pendingHotelsData?.hotels || []).map((hotel: HotelType) => (
                      <div
                        key={hotel._id}
                        className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-6">
                          <img
                            src={hotel.imageUrls?.[0] || "/placeholder-hotel.jpg"}
                            alt={hotel.name}
                            className="w-32 h-24 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
                                <p className="text-sm text-gray-500">{hotel.city}, {hotel.country}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                  <span>₹{hotel.pricePerNight}/night</span>
                                  <span>{hotel.starRating}★</span>
                                  {hotel.totalBookings !== undefined && hotel.totalBookings > 0 && (
                                    <span>{hotel.totalBookings} bookings</span>
                                  )}
                                </div>
                              </div>
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-3 line-clamp-2">{hotel.description}</p>
                            <div className="flex items-center gap-3 mt-4">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => verifyHotelMutation.mutate({ hotelId: hotel._id, status: "approved" })}
                                disabled={verifyHotelMutation.isLoading}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => verifyHotelMutation.mutate({ hotelId: hotel._id, status: "rejected", notes: "Rejected by admin" })}
                                disabled={verifyHotelMutation.isLoading}
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6">
            {flaggedReviews?.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-800">
                    <AlertTriangle className="w-5 h-5" />
                    Flagged Reviews ({flaggedReviews.length})
                  </CardTitle>
                  <CardDescription>Reviews that have been reported and need moderation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {flaggedReviews.map((review: any) => (
                      <div key={review._id} className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{review.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                              <span>Hotel: {review.hotelId?.name || "N/A"}</span>
                              <span>By: {review.userId?.firstName || "Unknown"}</span>
                              <span>Rating: {review.rating}/5</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
                              <CheckCircle className="w-3 h-3 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive">
                              <XCircle className="w-3 h-3 mr-1" /> Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">No Flagged Reviews</h3>
                  <p className="text-gray-500 mt-1">All reviews are currently clean and approved.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;