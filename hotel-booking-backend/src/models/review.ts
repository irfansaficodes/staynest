import mongoose from "mongoose";

export interface IReview extends Document {
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
}

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    hotelId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, maxlength: 100 },
    comment: { type: String, required: true, maxlength: 1000 },
    isVerified: { type: Boolean, default: true },
    isFlagged: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ hotelId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, hotelId: 1 }, { unique: true });

export default mongoose.model<IReview>("Review", reviewSchema);
