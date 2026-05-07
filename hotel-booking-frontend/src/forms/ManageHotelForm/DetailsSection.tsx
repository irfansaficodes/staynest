import { useFormContext } from "react-hook-form";
import { HotelFormData } from "./ManageHotelForm";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { DollarSign, MapPin, Building, AlignLeft, Star } from "lucide-react";

const DetailsSection = () => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<HotelFormData>();

  const starRating = watch("starRating");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Hotel Details</h2>
        <p className="text-sm text-gray-500">Basic information about your property</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Property Name</Label>
        <div className="relative">
          <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="name"
            className="pl-10"
            placeholder="e.g. The Grand Palace Hotel"
            {...register("name", {
              required: "Property name is required",
              minLength: { value: 3, message: "Name must be at least 3 characters" },
              maxLength: { value: 100, message: "Name must be under 100 characters" },
            })}
          />
        </div>
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="city"
              className="pl-10"
              placeholder="e.g. Mumbai"
              {...register("city", { required: "City is required" })}
            />
          </div>
          {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            placeholder="e.g. India"
            {...register("country", { required: "Country is required" })}
          />
          {errors.country && <p className="text-sm text-red-500">{errors.country.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <div className="relative">
          <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Textarea
            id="description"
            className="pl-10 min-h-[120px]"
            placeholder="Describe your property, amenities, and nearby attractions..."
            {...register("description", {
              required: "Description is required",
              minLength: { value: 20, message: "Description must be at least 20 characters" },
              maxLength: { value: 1000, message: "Description must be under 1000 characters" },
            })}
          />
        </div>
        <p className="text-xs text-gray-500">{(watch("description") || "").length}/1000 characters</p>
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pricePerNight">Price Per Night (₹)</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="pricePerNight"
              type="number"
              className="pl-10"
              min={1}
              max={999999}
              placeholder="0"
              {...register("pricePerNight", {
                required: "Price is required",
                min: { value: 1, message: "Price must be at least ₹1" },
                valueAsNumber: true,
              })}
            />
          </div>
          {errors.pricePerNight && <p className="text-sm text-red-500">{errors.pricePerNight.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Star Rating</Label>
          <Select
            value={starRating?.toString() || ""}
            onValueChange={(val) => setValue("starRating", parseInt(val), { shouldValidate: true })}
          >
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <SelectValue placeholder="Select rating" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {"★".repeat(num)} ({num} Star{num > 1 ? "s" : ""})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.starRating && <p className="text-sm text-red-500">{errors.starRating.message}</p>}
        </div>
      </div>
    </div>
  );
};

export default DetailsSection;
