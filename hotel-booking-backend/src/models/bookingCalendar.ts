import mongoose from "mongoose";

const bookingCalendarSchema = new mongoose.Schema({
  hotelId: { type: String, required: true, index: true },
  roomId: { type: String, required: true },
  date: { type: Date, required: true, index: true },
  availableRooms: { type: Number, required: true },
  totalRooms: { type: Number, required: true },
  pricePerNight: { type: Number, required: true },
  isWeekendRate: { type: Boolean, default: false },
  isSeasonalRate: { type: Boolean, default: false },
  blocked: { type: Boolean, default: false },
});

bookingCalendarSchema.index({ hotelId: 1, date: 1 });

const BookingCalendar = mongoose.model("BookingCalendar", bookingCalendarSchema);

export default BookingCalendar;
