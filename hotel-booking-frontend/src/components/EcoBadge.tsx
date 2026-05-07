import { Leaf } from "lucide-react";

interface EcoBadgeProps {
  score: number;
  badges?: string[];
  size?: "sm" | "md";
}

const EcoBadge = ({ score, badges = [], size = "sm" }: EcoBadgeProps) => {
  if (!score || score === 0) return null;

  const getLevel = (s: number) => {
    if (s >= 80) return { label: "Eco Champion", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    if (s >= 60) return { label: "Eco Friendly", color: "text-green-600 bg-green-50 border-green-200" };
    if (s >= 40) return { label: "Going Green", color: "text-lime-600 bg-lime-50 border-lime-200" };
    return { label: "Eco Conscious", color: "text-teal-600 bg-teal-50 border-teal-200" };
  };

  const { label, color } = getLevel(score);
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <div className={`inline-flex items-center gap-1 rounded-full border ${color} ${sizeClass}`}>
      <Leaf className="w-3 h-3" />
      <span className="font-medium">{label}</span>
      {badges.length > 0 && (
        <span className="ml-1 opacity-75">({badges.slice(0, 2).join(", ")})</span>
      )}
    </div>
  );
};

export default EcoBadge;
