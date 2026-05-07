import { useMemo } from "react";
import { Star, TrendingUp, Users, Award } from "lucide-react";

interface SmartScoreBadgeProps {
  score: number;
  breakdown?: {
    rating: number;
    affordability: number;
    popularity: number;
    facilitiesQuality: number;
    bookingFrequency: number;
    userPreferenceMatch: number;
  };
  size?: "sm" | "md" | "lg";
  showBreakdown?: boolean;
}

const SmartScoreBadge = ({ score, breakdown, size = "md", showBreakdown = false }: SmartScoreBadgeProps) => {
  const { color, label, icon } = useMemo(() => {
    if (score >= 80) return { color: "from-emerald-500 to-green-600", label: "Excellent", icon: Award };
    if (score >= 60) return { color: "from-blue-500 to-cyan-600", label: "Great", icon: TrendingUp };
    if (score >= 40) return { color: "from-amber-500 to-yellow-600", label: "Good", icon: Star };
    return { color: "from-gray-400 to-gray-500", label: "Average", icon: Users };
  }, [score]);

  const sizeClasses = {
    sm: "w-12 h-12 text-sm",
    md: "w-16 h-16 text-base",
    lg: "w-20 h-20 text-lg",
  };

  const Icon = icon;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
        <div className="flex flex-col items-center">
          <span className="text-white font-bold leading-none">{score}</span>
          {size !== "sm" && <Icon className="w-3 h-3 text-white/80 mt-0.5" />}
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow" />
      </div>
      {size !== "sm" && <span className="text-xs font-semibold text-gray-700">{label}</span>}
      {showBreakdown && breakdown && (
        <div className="bg-white rounded-lg border p-3 space-y-2 text-xs">
          <div className="flex justify-between"><span>Rating</span><span className="font-semibold">{breakdown.rating}%</span></div>
          <div className="flex justify-between"><span>Affordability</span><span className="font-semibold">{breakdown.affordability}%</span></div>
          <div className="flex justify-between"><span>Popularity</span><span className="font-semibold">{breakdown.popularity}%</span></div>
          <div className="flex justify-between"><span>Facilities</span><span className="font-semibold">{breakdown.facilitiesQuality}%</span></div>
          <div className="flex justify-between"><span>Match for you</span><span className="font-semibold">{breakdown.userPreferenceMatch}%</span></div>
        </div>
      )}
    </div>
  );
};

export default SmartScoreBadge;
