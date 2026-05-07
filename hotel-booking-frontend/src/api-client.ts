import axiosInstance, { getApiBaseUrl } from "./lib/api-client";
import { RegisterFormData } from "./pages/Register";
import { SignInFormData } from "./pages/SignIn";
import {
  HotelSearchResponse,
  HotelType,
  PaymentIntentResponse,
  UserType,
  HotelWithBookingsType,
  BookingType,
} from "./shared/types";
import { BookingFormData } from "./forms/BookingForm/BookingForm";
import { queryClient } from "./main";

export { getApiBaseUrl };

export type RoomFormData = {
  name: string;
  description: string;
  pricePerNight: number;
  totalRooms: number;
  maxOccupancy: number;
  bedType: string;
  amenities: string[];
  isActive?: boolean;
};

export const fetchCurrentUser = async (): Promise<UserType> => {
  const response = await axiosInstance.get("/api/users/me");
  return response.data;
};

export const register = async (formData: RegisterFormData) => {
  const response = await axiosInstance.post("/api/users/register", formData);
  return response.data;
};

export const signIn = async (formData: SignInFormData) => {
  const response = await axiosInstance.post("/api/auth/login", formData);

  const token = response.data?.token;
  if (token) {
    localStorage.setItem("session_id", token);
  }

  if (response.data?.userId) {
    localStorage.setItem("user_id", response.data.userId);
  }
  if (response.data?.user) {
    const { email, firstName, lastName, role } = response.data.user;
    if (email) localStorage.setItem("user_email", email);
    const name = [firstName, lastName].filter(Boolean).join(" ") || email;
    if (name) localStorage.setItem("user_name", name);
    if (role) localStorage.setItem("user_role", role);
  }

  try {
    await validateToken();
    queryClient.invalidateQueries("validateToken");
    await queryClient.refetchQueries("validateToken");
  } catch (error) {
    if (!localStorage.getItem("session_id")) {
      throw new Error("Session expired. Please sign in again.");
    }
  }

  return response.data;
};

export const validateToken = async () => {
  try {
    const response = await axiosInstance.get("/api/auth/validate-token");
    return response.data;
  } catch (error: unknown) {
    if ((error as { response?: { status?: number } })?.response?.status === 401) {
      // Not logged in, throw error so React Query knows it failed
      throw new Error("Token invalid");
    }
    // For any other error (network, etc.), also throw
    throw new Error("Token validation failed");
  }
};

export const signOut = async () => {
  const response = await axiosInstance.post("/api/auth/logout");

  // Clear localStorage (JWT tokens and user info)
  localStorage.removeItem("session_id");
  localStorage.removeItem("user_id");
  localStorage.removeItem("user_email");
  localStorage.removeItem("user_name");
  localStorage.removeItem("user_image");

  return response.data;
};

export const clearAllStorage = () => {
  localStorage.clear();
  sessionStorage.clear();
  document.cookie.split(";").forEach((c) => {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
  });
};

export const addMyHotel = async (hotelFormData: FormData) => {
  const response = await axiosInstance.post("/api/my-hotels", hotelFormData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const fetchMyHotels = async (): Promise<HotelType[]> => {
  const response = await axiosInstance.get("/api/my-hotels");
  return response.data;
};

export const fetchMyHotelById = async (hotelId: string): Promise<HotelType> => {
  const response = await axiosInstance.get(`/api/my-hotels/${hotelId}`);
  return response.data;
};

export const updateMyHotelById = async (hotelFormData: FormData) => {
  const hotelId = hotelFormData.get("hotelId");
  const response = await axiosInstance.put(
    `/api/my-hotels/${hotelId}`,
    hotelFormData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const deleteMyHotel = async (hotelId: string) => {
  const response = await axiosInstance.delete(`/api/my-hotels/${hotelId}`);
  return response.data;
};

export const deleteHotel = async (hotelId: string) => {
  const response = await axiosInstance.delete(`/api/admin/hotels/${hotelId}`);
  return response.data;
};

export type SearchParams = {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  adultCount?: string;
  childCount?: string;
  page?: string;
  facilities?: string[];
  types?: string[];
  stars?: string[];
  maxPrice?: string;
  sortOption?: string;
};

export const searchHotels = async (
  searchParams: SearchParams
): Promise<HotelSearchResponse> => {
  const queryParams = new URLSearchParams();

  // Only add destination if it's not empty
  if (searchParams.destination && searchParams.destination.trim() !== "") {
    queryParams.append("destination", searchParams.destination.trim());
  }

  queryParams.append("checkIn", searchParams.checkIn || "");
  queryParams.append("checkOut", searchParams.checkOut || "");
  queryParams.append("adultCount", searchParams.adultCount || "");
  queryParams.append("childCount", searchParams.childCount || "");
  queryParams.append("page", searchParams.page || "");
  queryParams.append("maxPrice", searchParams.maxPrice || "");
  queryParams.append("sortOption", searchParams.sortOption || "");

  searchParams.facilities?.forEach((facility) =>
    queryParams.append("facilities", facility)
  );

  searchParams.types?.forEach((type) => queryParams.append("types", type));
  searchParams.stars?.forEach((star) => queryParams.append("stars", star));

  const response = await axiosInstance.get(`/api/hotels/search?${queryParams}`);
  return response.data;
};

export const fetchHotels = async (): Promise<HotelType[]> => {
  const response = await axiosInstance.get("/api/hotels");
  return response.data;
};

export const fetchHotelById = async (hotelId: string): Promise<HotelType> => {
  const response = await axiosInstance.get(`/api/hotels/${hotelId}`);
  return response.data;
};

export const createPaymentIntent = async (
  hotelId: string,
  numberOfNights: string
): Promise<PaymentIntentResponse> => {
  const response = await axiosInstance.post(
    `/api/hotels/${hotelId}/bookings/payment-intent`,
    { numberOfNights }
  );
  return response.data;
};

export const createRoomBooking = async (formData: BookingFormData) => {
  const response = await axiosInstance.post(
    `/api/hotels/${formData.hotelId}/bookings`,
    formData
  );
  return response.data;
};

export const verifyPayment = async (data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  bookingId: string;
}) => {
  const response = await axiosInstance.post("/api/payments/verify", data);
  return response.data;
};

export const fetchMyBookings = async (): Promise<HotelWithBookingsType[]> => {
  const response = await axiosInstance.get("/api/my-bookings");
  return response.data;
};

export const cancelBooking = async (bookingId: string, reason?: string) => {
  const response = await axiosInstance.post(
    `/api/bookings/${bookingId}/cancel`,
    { reason }
  );
  queryClient.invalidateQueries("fetchMyBookings");
  return response.data;
};

export const fetchHotelBookings = async (
  hotelId: string
): Promise<BookingType[]> => {
  const response = await axiosInstance.get(`/api/bookings/hotel/${hotelId}`);
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await axiosInstance.post("/api/users/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token: string, password: string) => {
  const response = await axiosInstance.post("/api/users/reset-password", {
    token,
    password,
  });
  return response.data;
};

export const updateProfile = async (profileData: {
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}) => {
  const response = await axiosInstance.put("/api/users/me", profileData);
  queryClient.invalidateQueries("validateToken");
  if (profileData.firstName) localStorage.setItem("user_name", `${profileData.firstName} ${profileData.lastName}`);
  return response.data;
};

export const fetchOwnerDashboard = async () => {
  const response = await axiosInstance.get("/api/owner-dashboard/dashboard");
  return response.data;
};

export const fetchCustomerDashboard = async () => {
  const response = await axiosInstance.get("/api/customer-dashboard/dashboard");
  return response.data;
};

export const fetchHotelReviews = async (hotelId: string) => {
  const response = await axiosInstance.get(`/api/reviews/hotel/${hotelId}`);
  return response.data;
};

export const createReview = async (hotelId: string, reviewData: {
  rating: number;
  title: string;
  comment: string;
  userName: string;
}) => {
  const response = await axiosInstance.post(`/api/reviews/hotel/${hotelId}`, reviewData);
  queryClient.invalidateQueries(`hotelReviews-${hotelId}`);
  return response.data;
};

export const fetchBusinessInsightsDashboard = async () => {
  const response = await axiosInstance.get("/api/business-insights/dashboard/public");
  return response.data;
};

export const fetchBusinessInsightsForecast = async () => {
  const response = await axiosInstance.get("/api/business-insights/forecast/public");
  return response.data;
};

export const fetchBusinessInsightsPerformance = async () => {
  const response = await axiosInstance.get("/api/business-insights/system-stats/public");
  return response.data;
};

export const fetchPersonalizedRecommendations = async (limit: number = 10) => {
  const response = await axiosInstance.get(`/api/recommendations/personalized?limit=${limit}`);
  return response.data;
};

export const fetchTrendingHotels = async (limit: number = 10) => {
  const response = await axiosInstance.get(`/api/recommendations/trending?limit=${limit}`);
  return response.data;
};

export const fetchSmartScore = async (hotelId: string) => {
  const response = await axiosInstance.get(`/api/recommendations/smart-score/${hotelId}`);
  return response.data;
};

export const fetchTopPicks = async (limit: number = 6) => {
  const response = await axiosInstance.get(`/api/recommendations/top-picks?limit=${limit}`);
  return response.data;
};

export const fetchWishlist = async () => {
  const response = await axiosInstance.get("/api/wishlist");
  return response.data;
};

export const addToWishlist = async (hotelId: string) => {
  const response = await axiosInstance.post(`/api/wishlist/${hotelId}`);
  queryClient.invalidateQueries("fetchWishlist");
  return response.data;
};

export const removeFromWishlist = async (hotelId: string) => {
  const response = await axiosInstance.delete(`/api/wishlist/${hotelId}`);
  queryClient.invalidateQueries("fetchWishlist");
  return response.data;
};

export const checkWishlist = async (hotelId: string) => {
  const response = await axiosInstance.get(`/api/wishlist/check/${hotelId}`);
  return response.data;
};

export const fetchRooms = async (hotelId: string) => {
  const response = await axiosInstance.get(`/api/rooms/${hotelId}`);
  return response.data;
};

export const createRoom = async (hotelId: string, roomData: any) => {
  const response = await axiosInstance.post(`/api/rooms/${hotelId}`, roomData);
  queryClient.invalidateQueries(`fetchRooms-${hotelId}`);
  return response.data;
};

export const updateRoom = async (roomId: string, roomData: any) => {
  const response = await axiosInstance.put(`/api/rooms/${roomId}`, roomData);
  return response.data;
};

export const deleteRoom = async (roomId: string) => {
  const response = await axiosInstance.delete(`/api/rooms/${roomId}`);
  return response.data;
};

export const checkRoomAvailability = async (hotelId: string, checkIn: string, checkOut: string) => {
  const response = await axiosInstance.get(`/api/rooms/availability/${hotelId}?checkIn=${checkIn}&checkOut=${checkOut}`);
  return response.data;
};

export const calculateBudgetPlan = async (budget: number, travelers: number, nights: number) => {
  const response = await axiosInstance.post("/api/budget-planner/calculate", { budget, travelers, nights });
  return response.data;
};

export const searchByMood = async (mood: string, limit: number = 10) => {
  const response = await axiosInstance.get(`/api/mood-search/${mood}?limit=${limit}`);
  return response.data;
};

export const fetchMoods = async () => {
  const response = await axiosInstance.get("/api/mood-search/moods");
  return response.data;
};

export const fetchNotifications = async () => {
  const response = await axiosInstance.get("/api/notifications");
  return response.data;
};

export const markNotificationRead = async (id: string) => {
  const response = await axiosInstance.patch(`/api/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await axiosInstance.patch("/api/notifications/read-all");
  return response.data;
};

export const fetchAdminDashboard = async () => {
  const response = await axiosInstance.get("/api/admin/dashboard");
  return response.data;
};

export const fetchAdminUsers = async () => {
  const response = await axiosInstance.get("/api/admin/users");
  return response.data;
};

export const updateUserRole = async (userId: string, role: string) => {
  const response = await axiosInstance.patch(`/api/admin/users/${userId}/role`, { role });
  return response.data;
};

export const sendVerificationCode = async (userId: string) => {
  const response = await axiosInstance.post("/api/auth/verify/send-verification-code", { userId });
  return response.data;
};

export const verifyEmail = async (userId: string, code: string) => {
  const response = await axiosInstance.post("/api/auth/verify/verify-email", { userId, code });
  return response.data;
};

export const verifyHotel = async (hotelId: string, status: "approved" | "rejected" | "pending", notes?: string) => {
  const response = await axiosInstance.put(`/api/admin/hotels/${hotelId}/verify`, { status, notes });
  queryClient.invalidateQueries("adminDashboard");
  queryClient.invalidateQueries("adminHotels");
  queryClient.invalidateQueries("pendingHotels");
  return response.data;
};

export const fetchPendingHotels = async () => {
  const response = await axiosInstance.get("/api/admin/hotels/pending");
  return response.data;
};
