import { useState } from "react";
import { Heart, Flame, Plane, Briefcase, Sparkles, Coffee, Monitor } from "lucide-react";

const MOODS = [
  { id: "romantic", label: "Romantic", emoji: "💕", icon: Heart, description: "Intimate settings & spa" },
  { id: "family vacation", label: "Family", emoji: "👨‍👩‍👧‍👦", icon: Flame, description: "Kid-friendly stays" },
  { id: "adventure", label: "Adventure", emoji: "🏔️", icon: Plane, description: "Explore the outdoors" },
  { id: "business", label: "Business", emoji: "💼", icon: Briefcase, description: "Work-ready hotels" },
  { id: "relaxation", label: "Relaxation", emoji: "🧘", icon: Sparkles, description: "Wellness & peace" },
  { id: "luxury escape", label: "Luxury", emoji: "✨", icon: Coffee, description: "Premium experience" },
  { id: "workation", label: "Workation", emoji: "💻", icon: Monitor, description: "Work + vacation" },
];

interface MoodSelectorProps {
  onSelect: (mood: string) => void;
}

const MoodSelector = ({ onSelect }: MoodSelectorProps) => {
  const [selected, setSelected] = useState<string>("");

  const handleSelect = (mood: string) => {
    setSelected(mood);
    onSelect(mood);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900">How are you feeling?</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {MOODS.map((mood) => {
        const isSelected = selected === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => handleSelect(mood.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-center group ${
                isSelected
                  ? "border-primary-500 bg-primary-50 shadow-md scale-105"
                  : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
              }`}
            >
              <div className="text-2xl mb-1">{mood.emoji}</div>
              <div className="text-sm font-semibold text-gray-900">{mood.label}</div>
              <div className="text-xs text-gray-500 mt-0.5 hidden sm:block">{mood.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodSelector;
