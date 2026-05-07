import { MapPin, Utensils, Coffee, Train, Hospital, ShoppingBag } from "lucide-react";

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  attraction: MapPin,
  restaurant: Utensils,
  cafe: Coffee,
  transport: Train,
  hospital: Hospital,
  shopping: ShoppingBag,
};

interface LocalExperiencesProps {
  experiences?: Array<{
    name: string;
    type: string;
    distance: string;
    rating?: number;
  }>;
}

const LocalExperiences = ({ experiences = [] }: LocalExperiencesProps) => {
  if (experiences.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900">Nearby Experiences</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {experiences.map((exp, i) => {
          const Icon = ICON_MAP[exp.type] || MapPin;
          return (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border shadow-sm">
                <Icon className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{exp.name}</p>
                <p className="text-xs text-gray-500">{exp.distance} away</p>
              </div>
              {exp.rating && (
                <span className="text-xs font-semibold text-amber-600">{exp.rating}★</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LocalExperiences;
