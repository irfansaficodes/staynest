import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Star, Send } from "lucide-react";
import useAppContext from "../hooks/useAppContext";
import { useMutationWithLoading } from "../hooks/useLoadingHooks";
import * as apiClient from "../api-client";

type ReviewFormData = {
  title: string;
  comment: string;
  rating: number;
};

type ReviewFormProps = {
  hotelId: string;
  userName: string;
  onSuccess: () => void;
};

const ReviewForm = ({ hotelId, userName, onSuccess }: ReviewFormProps) => {
  const { showToast } = useAppContext();
  const [hoveredRating, setHoveredRating] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    defaultValues: { rating: 0, title: "", comment: "" },
  });

  const selectedRating = watch("rating");

  const submitMutation = useMutationWithLoading(
    (data: ReviewFormData) => apiClient.createReview(hotelId, { ...data, userName }),
    {
      onSuccess: () => {
        showToast({
          title: "Review Submitted",
          description: "Thank you for your feedback!",
          type: "SUCCESS",
        });
        reset();
        onSuccess();
      },
      onError: (error: Error) => {
        showToast({
          title: "Submission Failed",
          description: error.message,
          type: "ERROR",
        });
      },
      loadingMessage: "Submitting review...",
    }
  );

  const onSubmit = handleSubmit((data) => {
    if (data.rating === 0) {
      showToast({
        title: "Rating Required",
        description: "Please select a star rating before submitting.",
        type: "ERROR",
      });
      return;
    }
    submitMutation.mutate(data);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>Share your experience at this hotel</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Your Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValue("rating", star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || selectedRating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500">
                {selectedRating > 0 ? `${selectedRating}/5` : "Select rating"}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="review-title">Review Title</Label>
            <Input
              id="review-title"
              placeholder="Summarize your experience"
              maxLength={100}
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="review-comment">Your Review</Label>
            <Textarea
              id="review-comment"
              placeholder="Tell us about your stay..."
              rows={4}
              maxLength={1000}
              {...register("comment", { required: "Review comment is required" })}
            />
            <p className="text-xs text-gray-400 text-right">
              {watch("comment")?.length || 0}/1000
            </p>
            {errors.comment && (
              <p className="text-sm text-red-500">{errors.comment.message}</p>
            )}
          </div>

          <Button type="submit" disabled={submitMutation.isLoading} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            {submitMutation.isLoading ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
