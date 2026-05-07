import { useForm } from "react-hook-form";
import { PaymentIntentResponse, UserType } from "../../shared/types";
import useSearchContext from "../../hooks/useSearchContext";
import { useParams, useNavigate } from "react-router-dom";
import * as apiClient from "../../api-client";
import useAppContext from "../../hooks/useAppContext";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  User,
  MessageSquare,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
};

type RazorpayInstance = {
  open: () => void;
};

type RazorpayConstructor = {
  new (options: RazorpayOptions): RazorpayInstance;
};

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

type Props = {
  currentUser: UserType;
  paymentIntent: PaymentIntentResponse;
};

export type BookingFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  adultCount: number;
  childCount: number;
  checkIn: string;
  checkOut: string;
  hotelId: string;
  paymentIntentId: string;
  totalCost: number;
  specialRequests?: string;
};

const BookingForm = ({ currentUser, paymentIntent }: Props) => {
  const search = useSearchContext();
  const { hotelId } = useParams();
  const navigate = useNavigate();

  const { showToast } = useAppContext();

  const [phone, setPhone] = useState<string>("");
  const [specialRequests, setSpecialRequests] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { handleSubmit, register } = useForm<BookingFormData>({
    defaultValues: {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      adultCount: search.adultCount,
      childCount: search.childCount,
      checkIn: search.checkIn.toISOString(),
      checkOut: search.checkOut.toISOString(),
      hotelId: hotelId,
      totalCost: paymentIntent.totalCost,
      paymentIntentId: paymentIntent.orderId,
    },
  });

  const onSubmit = async (formData: BookingFormData) => {
    const completeFormData = {
      ...formData,
      phone,
      specialRequests,
    };

    if (!window.Razorpay) {
      showToast({
        title: "Payment Error",
        description: "Payment gateway failed to load. Please refresh and try again.",
        type: "ERROR",
      });
      return;
    }

    if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
      showToast({
        title: "Configuration Error",
        description: "Payment gateway is not configured. Please contact support.",
        type: "ERROR",
      });
      return;
    }

    const options: RazorpayOptions = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      name: "Mern Holidays",
      description: "Hotel Booking Payment",
      order_id: paymentIntent.orderId,
      handler: async function (response: RazorpayResponse) {
        setIsProcessing(true);
        try {
          const bookingResult = await apiClient.createRoomBooking({
            ...completeFormData,
            paymentIntentId: response.razorpay_payment_id,
          });

          if (bookingResult.bookingId) {
            await apiClient.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: bookingResult.bookingId,
            });
          }

          showToast({
            title: "Booking Successful",
            description: "Your hotel booking has been confirmed successfully!",
            type: "SUCCESS",
          });

          setTimeout(() => {
            navigate("/my-bookings");
          }, 1500);
        } catch (err: unknown) {
          const axiosError = err as { response?: { data?: { message?: string } } };
          showToast({
            title: "Booking Failed",
            description: axiosError?.response?.data?.message || "There was an error processing your booking.",
            type: "ERROR",
          });
        } finally {
          setIsProcessing(false);
        }
      },
      prefill: {
        name: `${currentUser.firstName} ${currentUser.lastName}`,
        email: currentUser.email,
        contact: phone,
      },
      theme: {
        color: "#2563eb",
      },
      modal: {
        ondismiss: function () {
          showToast({
            title: "Payment Cancelled",
            description: "You cancelled the payment. Please try again when ready.",
            type: "INFO",
          });
        },
      },
    };

    const RazorpayCtor = window.Razorpay;
    if (!RazorpayCtor) return;
    const razor = new RazorpayCtor(options);
    razor.open();
  };

  return (
    <div className="p-6">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <User className="h-6 w-6 text-blue-600" />
          Confirm Your Details
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <Label>First Name</Label>

              <Input
                readOnly
                disabled
                {...register("firstName")}
              />
            </div>

            <div>
              <Label>Last Name</Label>

              <Input
                readOnly
                disabled
                {...register("lastName")}
              />
            </div>

            <div>
              <Label>Email</Label>

              <Input
                readOnly
                disabled
                {...register("email")}
              />
            </div>

            <div>
              <Label>Phone</Label>

              <Input
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Special Requests</Label>

            <textarea
              rows={4}
              className="w-full rounded-md border p-3"
              placeholder="Special requests..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border">
            <div className="flex justify-between">
              <span className="font-medium">Total Cost</span>
              <span className="text-2xl font-bold text-blue-600">
                ₹{paymentIntent.totalCost}
              </span>
            </div>
          </div>

          <Button
            disabled={isProcessing}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? (
              "Processing..."
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Pay & Confirm Booking
              </div>
            )}
          </Button>
        </form>

          <div className="border-t pt-4">
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Instant Confirmation
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3 text-green-500" />
                24/7 Support
              </div>
            </div>
          </div>
      </CardContent>
    </div>
  );
};

export default BookingForm;
