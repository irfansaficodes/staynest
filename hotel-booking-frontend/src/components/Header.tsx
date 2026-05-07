import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSearchContext from "../hooks/useSearchContext";
import MobileNav from "./MobileNav";
import MainNav from "./MainNav";
import DarkModeToggle from "./DarkModeToggle";
import { Building2 } from "lucide-react";

const Header = () => {
  const search = useSearchContext();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoClick = () => {
    search.clearSearchValues();
    navigate("/");
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 h-[72px] flex items-center shrink-0 ${
        scrolled
          ? "glass border-b border-white/20 shadow-elevated backdrop-blur-xl"
          : "bg-gradient-to-r from-primary-600 to-primary-700 dark:from-gray-900 dark:to-gray-800 shadow-large"
      }`}
      role="banner"
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className={`flex justify-between items-center transition-all duration-500 ${scrolled ? "h-[64px]" : "h-full"}`}>
          <button
            onClick={handleLogoClick}
            className="flex items-center space-x-2 group"
            aria-label="Go to homepage"
          >
            <div className={`rounded-xl shadow-soft transition-all duration-500 group-hover:shadow-medium ${
              scrolled
                ? "bg-primary/10 p-2 shadow-primary-glow group-hover:scale-105"
                : "bg-white p-2"
            }`}>
              <Building2 className={`w-6 h-6 transition-colors duration-500 ${
                scrolled ? "text-primary" : "text-primary-600"
              }`} aria-hidden="true" />
            </div>
            <span className={`text-2xl font-display font-bold tracking-tight transition-all duration-500 ${
              scrolled
                ? "text-foreground group-hover:text-primary"
                : "text-white group-hover:text-primary-100"
            }`}>
              StayNest
            </span>
          </button>
          <div className="md:hidden">
            <MobileNav scrolled={scrolled} />
          </div>
          <div className="hidden md:flex items-center gap-2">
            <DarkModeToggle scrolled={scrolled} />
            <MainNav scrolled={scrolled} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
