import { useForm } from "react-hook-form";
import { useMutationWithLoading } from "../hooks/useLoadingHooks";
import * as apiClient from "../api-client";
import useAppContext from "../hooks/useAppContext";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  UserPlus,
  Sparkles,
  CheckCircle,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import PasswordStrength from "../components/PasswordStrength";

export type RegisterFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: "user" | "hotel_owner";
};

const Register = () => {
  const navigate = useNavigate();
  const { showToast } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"user" | "hotel_owner">("user");

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const mutation = useMutationWithLoading(apiClient.register, {
    onSuccess: async (data) => {
      const userId = data?.userId;
      if (userId) {
        localStorage.setItem("user_id", userId);
      }
      const otpMsg = data?.devCode ? ` Your code is: ${data.devCode}` : "";
      showToast({ 
        title: "Registration Successful", 
        description: `A verification code has been sent to your email.${otpMsg}`,
        type: "SUCCESS" 
      });
      setTimeout(() => {
        navigate(`/verify-email?userId=${userId}`);
      }, 1500);
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = axiosError?.response?.data?.message || axiosError?.message || "Registration failed";
      showToast({ 
        title: "Registration Failed", 
        description: msg,
        type: "ERROR" 
      });
    },
    loadingMessage: "Creating your account...",
  });

  const onSubmit = handleSubmit((data) => {
    setIsLoading(true);
    mutation.mutate({ ...data, role: selectedRole }, {
      onSettled: () => setIsLoading(false),
    });
  });

  const password = watch("password");

  return (
    <div className="relative min-h-[calc(100vh-72px)] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/3 left-1/4 w-56 h-56 bg-primary/5 rounded-full blur-2xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="max-w-xl w-full space-y-8 relative z-10 animate-scale-in">
        <Card className="relative overflow-hidden border border-gray-200/60 shadow-elevated bg-white/80 backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500"></div>
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full opacity-60 blur-xl"></div>
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-primary-200 to-primary-100 rounded-full opacity-40 blur-xl"></div>

          <CardHeader className="text-center relative z-10 pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-primary/20">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-display font-bold text-gray-900 mb-2">
              Join StayNest
            </CardTitle>
            <CardDescription className="text-gray-500 text-base">
              Create your account to start booking
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 relative z-10">
            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-semibold text-gray-700"
                  >
                    First Name
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <Input
                      id="firstName"
                      type="text"
                      className="pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 bg-white/60 backdrop-blur-sm"
                      placeholder="Enter first name"
                      {...register("firstName", {
                        required: "First name is required",
                      })}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Last Name
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <Input
                      id="lastName"
                      type="text"
                      className="pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 bg-white/60 backdrop-blur-sm"
                      placeholder="Enter last name"
                      {...register("lastName", {
                        required: "Last name is required",
                      })}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  I am registering as
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "user" as const, label: "Customer", icon: User, color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200" },
                    { value: "hotel_owner" as const, label: "Hotel Owner", icon: Building2, color: "text-emerald-600", bgColor: "bg-emerald-50 border-emerald-200" },
                  ].map(({ value, label, icon: Icon, color, bgColor }) => {
                    const isSelected = selectedRole === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSelectedRole(value)}
                        className={`relative p-3 rounded-xl border-2 transition-all duration-300 text-center hover:scale-[1.02] ${
                          isSelected
                            ? `${bgColor} border-current shadow-md`
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        <Icon className={`w-6 h-6 mx-auto mb-1 ${isSelected ? color : "text-gray-400"}`} />
                        <p className={`text-xs font-semibold ${isSelected ? "text-gray-900" : "text-gray-500"}`}>
                          {label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-700"
                >
                  Email Address
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    className="pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 bg-white/60 backdrop-blur-sm"
                    placeholder="Enter your email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email address",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700"
                >
                  Password
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 bg-white/60 backdrop-blur-sm"
                    placeholder="Create a password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 pr-3 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {errors.password.message}
                  </p>
                )}
                <PasswordStrength password={password || ""} />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-semibold text-gray-700"
                >
                  Confirm Password
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 bg-white/60 backdrop-blur-sm"
                    placeholder="Confirm your password"
                    {...register("confirmPassword", {
                      validate: (val) => {
                        if (!val) {
                          return "Please confirm your password";
                        } else if (password !== val) {
                          return "Passwords do not match";
                        }
                      },
                    })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 pr-3 h-full"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {errors.confirmPassword.message}
                  </p>
                )}
                {password &&
                  !errors.confirmPassword &&
                  watch("confirmPassword") === password && (
                    <p className="text-sm text-success mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Passwords match
                    </p>
                  )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 btn-shine transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.01]"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account
                  </div>
                )}
              </Button>

              <div className="text-center pt-2">
                <p className="text-sm text-gray-500">
                  Already have an account?{" "}
                  <Link
                    to="/sign-in"
                    className="font-semibold text-primary hover:text-primary/80 transition-colors duration-200 underline decoration-2 underline-offset-4"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-400">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
