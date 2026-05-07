import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "react-query";
import * as apiClient from "../api-client";
import useAppContext from "../hooks/useAppContext";
import {
  Mail,
  Shield,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useAppContext();

  const userId =
    new URLSearchParams(location.search).get("userId") ||
    localStorage.getItem("user_id") ||
    "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);

  const sendOtpMutation = useMutation(
    (userId: string) => apiClient.sendVerificationCode(userId),
    {
      onSuccess: () => {
        showToast({
          title: "OTP Sent",
          description: "A verification code has been sent to your email",
          type: "SUCCESS",
        });
        setResendCooldown(60);
        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      },
      onError: (error: unknown) => {
        const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
        showToast({
          title: "Failed to Send OTP",
          description: axiosError?.response?.data?.message || axiosError?.message || "Could not send OTP",
          type: "ERROR",
        });
      },
    }
  );

  const verifyMutation = useMutation(
    ({ userId, code }: { userId: string; code: string }) =>
      apiClient.verifyEmail(userId, code),
    {
      onSuccess: (data) => {
        showToast({
          title: "Email Verified!",
          description: "Your email has been verified successfully",
          type: "SUCCESS",
        });
        if (data.token) {
          localStorage.setItem("session_id", data.token);
        }
        if (data.user) {
          localStorage.setItem("user_email", data.user.email);
          localStorage.setItem("user_name", `${data.user.firstName} ${data.user.lastName}`);
          if (data.user.role) localStorage.setItem("user_role", data.user.role);
        }
        setTimeout(() => navigate("/"), 1500);
      },
      onError: (error: unknown) => {
        const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
        const msg = axiosError?.response?.data?.message || axiosError?.message || "Verification failed";
        showToast({
          title: "Verification Failed",
          description: msg,
          type: "ERROR",
        });
        setOtp(["", "", "", "", "", ""]);
      },
    }
  );

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      document.getElementById("otp-5")?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      showToast({
        title: "Incomplete OTP",
        description: "Please enter all 6 digits",
        type: "ERROR",
      });
      return;
    }
    if (!userId) {
      showToast({
        title: "Missing User ID",
        description: "Please sign in again to verify your email",
        type: "ERROR",
      });
      navigate("/sign-in");
      return;
    }
    verifyMutation.mutate({ userId, code });
  };

  const handleResend = () => {
    if (resendCooldown > 0 || !userId) return;
    sendOtpMutation.mutate(userId);
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-900">User Session Not Found</h2>
            <p className="text-gray-500">Please sign in to verify your email address.</p>
            <Button onClick={() => navigate("/sign-in")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2 rotate-180" />
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-72px)] py-12 px-4">
      <div className="absolute inset-0 gradient-mesh" />
      <div className="max-w-md w-full relative z-10 animate-scale-in">
        <Card className="border border-gray-200/60 shadow-elevated bg-white/80 backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500" />
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-primary/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-gray-500 mt-2">
              Enter the 6-digit code sent to your email
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-xl font-bold border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white/60"
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Mail className="w-4 h-4" />
                <span>Code expires in 10 minutes</span>
              </div>

              <Button
                type="submit"
                disabled={verifyMutation.isLoading}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all"
              >
                {verifyMutation.isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Verifying...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify Email
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={resendCooldown > 0 || sendOtpMutation.isLoading}
                className="text-sm text-gray-500 hover:text-primary"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${resendCooldown > 0 ? "animate-spin" : ""}`} />
                {resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : sendOtpMutation.isLoading
                  ? "Sending..."
                  : "Resend code"}
              </Button>
            </div>

            <div className="text-center pt-2">
              <Button
                variant="link"
                size="sm"
                onClick={() => navigate("/")}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;
