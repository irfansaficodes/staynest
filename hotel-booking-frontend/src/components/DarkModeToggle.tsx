import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const DarkModeToggle = ({ scrolled }: { scrolled?: boolean }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors ${
        scrolled
          ? "bg-gray-200 hover:bg-gray-300"
          : "bg-white/10 hover:bg-white/20"
      }`}
      aria-label="Toggle dark mode"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-yellow-300" />
      ) : (
        <Moon className={`w-5 h-5 ${scrolled ? "text-gray-800" : "text-white"}`} />
      )}
    </button>
  );
};

export default DarkModeToggle;
