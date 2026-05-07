import mongoose from "mongoose";
import { WishlistType } from "../shared/types";

const wishlistSchema = new mongoose.Schema<WishlistType>(
  {
    userId: { type: String, required: true, index: true },
    hotelId: { type: String, required: true, index: true },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

wishlistSchema.index({ userId: 1, hotelId: 1 }, { unique: true });
wishlistSchema.index({ userId: 1, addedAt: -1 });

const Wishlist = mongoose.model<WishlistType>("Wishlist", wishlistSchema);
export default Wishlist;
