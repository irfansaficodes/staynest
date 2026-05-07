export type UserType = {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  image?: string;
  role?: "user" | "admin" | "hotel_owner";
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  preferences?: {
    preferredDestinations: string[];
    preferredHotelTypes: string[];
    budgetRange: {
      min: number;
      max: number;
    };
  };
  behavior?: {
    recentlyViewed: string[];
    frequentlyBookedFacilities: string[];
    mostBookedDestination: string;
    avgBookingValue: number;
  };
  totalBookings?: number;
  totalSpent?: number;
  lastLogin?: Date;
  isActive?: boolean;
  emailVerified?: boolean;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export type RoomType = {
  _id: string;
  hotelId: string;
  name: string;
  description: string;
  pricePerNight: number;
  totalRooms: number;
  availableRooms: number;
  maxOccupancy: number;
  size: number;
  bedType: string;
  amenities: string[];
  imageUrls: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type WishlistType = {
  _id: string;
  userId: string;
  hotelId: string;
  addedAt: Date;
};

export type NotificationType = {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "booking_confirmation" | "booking_cancellation" | "welcome" | "price_drop" | "recommendation" | "general";
  isRead: boolean;
  createdAt: Date;
};

export type LocalExperienceType = {
  name: string;
  type: "attraction" | "restaurant" | "cafe" | "transport" | "hospital" | "shopping";
  distance: string;
  rating?: number;
};

export type HotelType = {
  _id: string;
  userId: string;
  name: string;
  city: string;
  country: string;
  description: string;
  type: string[];
  adultCount: number;
  childCount: number;
  facilities: string[];
  pricePerNight: number;
  starRating: number;
  imageUrls: string[];
  lastUpdated: Date;
  location?: {
    latitude: number;
    longitude: number;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
    };
  };
  contact?: {
    phone: string;
    email: string;
    website: string;
  };
  policies?: {
    checkInTime: string;
    checkOutTime: string;
    cancellationPolicy: string;
    petPolicy: string;
    smokingPolicy: string;
  };
  amenities?: {
    parking: boolean;
    wifi: boolean;
    pool: boolean;
    gym: boolean;
    spa: boolean;
    restaurant: boolean;
    bar: boolean;
    airportShuttle: boolean;
    businessCenter: boolean;
  };
  rooms?: string[];
  moodTags?: string[];
  ecoScore?: number;
  ecoBadges?: string[];
  smartScore?: number;
  nearbyExperiences?: LocalExperienceType[];
  totalBookings?: number;
  totalRevenue?: number;
  averageRating?: number;
  reviewCount?: number;
  occupancyRate?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type BookingType = {
  _id: string;
  userId: string;
  hotelId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  adultCount: number;
  childCount: number;
  checkIn: Date;
  checkOut: Date;
  totalCost: number;
  status?: "pending" | "confirmed" | "cancelled" | "completed" | "refunded";
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  paymentMethod?: string;
  specialRequests?: string;
  cancellationReason?: string;
  refundAmount?: number;
  roomId?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type HotelWithBookingsType = HotelType & {
  bookings: BookingType[];
};

export type HotelSearchResponse = {
  data: HotelType[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
};

export type PaymentIntentResponse = {
  orderId: string;
  amount: number;
  currency: string;
  totalCost: number;
};

export type ReviewType = {
  _id: string;
  userId: string;
  hotelId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  isFlagged: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type RecommendationType = {
  hotel: HotelType;
  score: number;
  reason: string;
};

export type BudgetPlanType = {
  totalBudget: number;
  accommodationCost: number;
  foodEstimate: number;
  travelEstimate: number;
  remainingBudget: number;
  affordableHotels: HotelType[];
  maxNights: number;
  perNightBudget: number;
};

export type MoodSearchResponse = {
  data: HotelType[];
  mood: string;
  total: number;
};

export type SmartScoreBreakdown = {
  rating: number;
  affordability: number;
  popularity: number;
  facilitiesQuality: number;
  bookingFrequency: number;
  userPreferenceMatch: number;
  overall: number;
};
