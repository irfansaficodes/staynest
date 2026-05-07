import { useForm } from "react-hook-form";
import { useQueryWithLoading } from "../hooks/useLoadingHooks";
import { useMutationWithLoading } from "../hooks/useLoadingHooks";
import * as apiClient from "../api-client";
import type { UserType } from "../shared/types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { User, Mail, Phone, MapPin, Shield, Calendar, Camera } from "lucide-react";
import useAppContext from "../hooks/useAppContext";

type ProfileFormData = {
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
};

const Profile = () => {
  const { showToast } = useAppContext();

  const { data: user, isLoading } = useQueryWithLoading<UserType>(
    "validateToken",
    async () => {
      const me = await apiClient.fetchCurrentUser();
      return me;
    },
    { loadingMessage: "Loading profile..." }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      country: user?.address?.country || "",
      zipCode: user?.address?.zipCode || "",
    },
  });

  const updateMutation = useMutationWithLoading(apiClient.updateProfile, {
    onSuccess: () => {
      showToast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        type: "SUCCESS",
      });
    },
    onError: () => {
      showToast({
        title: "Update Failed",
        description: "Could not update profile. Please try again.",
        type: "ERROR",
      });
    },
    loadingMessage: "Saving profile...",
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        <div className="bg-white rounded-xl border p-6 animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-72" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  const onSubmit = handleSubmit((data) => {
    updateMutation.mutate(data);
  });

  const avatarUrl =
    user?.image ||
    `https://robohash.org/${encodeURIComponent(user?.email || "user")}.png?set=set1&size=120x120`;

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={user?.firstName || "User"}
                className="w-24 h-24 rounded-full object-cover border-4 border-white/30 shadow-lg"
              />
              <button className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-blue-100 mt-1">{user?.email}</p>
              <Badge className="mt-2 bg-white/20 text-white border-white/30">
                <Shield className="w-3 h-3 mr-1" />
                {user?.role || "user"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Account Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </CardTitle>
            <CardDescription>Your personal details and contact information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="firstName"
                    className="pl-10"
                    {...register("firstName", {
                      required: "First name is required",
                      minLength: { value: 2, message: "Name must be at least 2 characters" },
                      maxLength: { value: 50, message: "Name must be under 50 characters" },
                      pattern: { value: /^[a-zA-Z\s'-]+$/, message: "Name can only contain letters, spaces, hyphens, and apostrophes" },
                    })}
                  />
                  </div>
                  {errors.firstName && (
                    <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">
                      {errors.firstName.message}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...register("lastName", {
                      required: "Last name is required",
                      minLength: { value: 2, message: "Name must be at least 2 characters" },
                      maxLength: { value: 50, message: "Name must be under 50 characters" },
                      pattern: { value: /^[a-zA-Z\s'-]+$/, message: "Name can only contain letters, spaces, hyphens, and apostrophes" },
                    })}
                  />
                  {errors.lastName && (
                    <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">
                      {errors.lastName.message}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="pl-10 bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="phone" className="pl-10" placeholder="+91 98765 43210" {...register("phone", {
                      pattern: { value: /^[+]?[\d\s\-()]{7,15}$/, message: "Enter a valid phone number" },
                    })} />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="street">Street</Label>
                    <Input id="street" placeholder="Street address" {...register("street", { maxLength: { value: 100, message: "Street must be under 100 characters" } })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="City" {...register("city", { maxLength: { value: 50, message: "City must be under 50 characters" } })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" placeholder="State" {...register("state", { maxLength: { value: 50, message: "State must be under 50 characters" } })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" placeholder="Country" {...register("country", { maxLength: { value: 50, message: "Country must be under 50 characters" } })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input id="zipCode" placeholder="ZIP code" {...register("zipCode", { pattern: { value: /^[0-9]{5,10}$/, message: "Enter a valid ZIP code" } })} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="submit" disabled={updateMutation.isLoading}>
                  {updateMutation.isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your password and account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-gray-500">Last changed: Never</p>
              </div>
              <a href="/forgot-password" className="text-primary-600 hover:underline text-sm font-medium">
                Change Password
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Activity Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Account Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{user?.totalBookings || 0}</p>
                <p className="text-sm text-gray-600">Total Bookings</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">₹{user?.totalSpent?.toFixed(0) || 0}</p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <p className="text-sm font-bold text-purple-600">{user?.role || "user"}</p>
                <p className="text-sm text-gray-600">Role</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg text-center">
                <p className="text-sm font-bold text-orange-600">{joinDate}</p>
                <p className="text-sm text-gray-600">Member Since</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
