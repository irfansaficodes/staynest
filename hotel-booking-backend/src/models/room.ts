import mongoose from "mongoose";
import { RoomType } from "../shared/types";

const roomSchema = new mongoose.Schema<RoomType>(
  {
    hotelId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    totalRooms: { type: Number, required: true, min: 1 },
    availableRooms: { type: Number, required: true, min: 0 },
    maxOccupancy: { type: Number, required: true },
    size: { type: Number },
    bedType: { type: String, required: true },
    amenities: [{ type: String }],
    imageUrls: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

roomSchema.index({ hotelId: 1, isActive: 1 });
roomSchema.index({ hotelId: 1, pricePerNight: 1 });

const Room = mongoose.model<RoomType>("Room", roomSchema);
export default Room;
