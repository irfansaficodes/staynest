import { Button } from "./ui/button";
import UsernameMenu from "./UsernameMenu";
import { Link } from "react-router-dom";
import useAppContext from "../hooks/useAppContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown, FileText, Activity, Heart, Sparkles, Wallet, BarChart3 } from "lucide-react";
import { getHotelsSearchUrl } from "../lib/nav-utils";

const NAV_AUTH_WIDTH = "min-w-[120px]";

const MainNav = ({ scrolled }: { scrolled?: boolean }) => {
  const { isLoggedIn } = useAppContext();
  const userRole = typeof window !== "undefined" ? localStorage.getItem("user_role") : null;

  const navLinkClass = scrolled
    ? "flex items-center text-gray-700 hover:text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-all duration-200"
    : "flex items-center text-white/90 hover:text-white px-4 py-2 rounded-lg font-medium hover:bg-white/10 transition-all duration-200";

  return (
    <nav className="flex items-center gap-1 lg:gap-2" role="navigation" aria-label="Main navigation">
      <Link to={getHotelsSearchUrl()} className={navLinkClass} aria-label="Browse hotels">
        Hotels
      </Link>
      <Link to="/mood-search" className={navLinkClass} aria-label="Search by mood">
        <Sparkles className="w-4 h-4 mr-1" aria-hidden="true" />
        <span>Mood Search</span>
      </Link>
      <Link to="/budget-planner" className={navLinkClass} aria-label="Plan your budget">
        <Wallet className="w-4 h-4 mr-1" aria-hidden="true" />
        <span>Budget</span>
      </Link>
      {isLoggedIn && (
        <Link to="/wishlist" className={navLinkClass} aria-label="View your wishlist">
          <Heart className="w-4 h-4 mr-1" aria-hidden="true" />
          <span>Wishlist</span>
        </Link>
      )}
      {isLoggedIn && (
        <Link to="/my-bookings" className={navLinkClass} aria-label="View your bookings">
          My Bookings
        </Link>
      )}

      {isLoggedIn && (userRole === "hotel_owner" || userRole === "admin") && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`${navLinkClass} flex items-center gap-1 focus:outline-none ${scrolled ? "focus:ring-primary-500" : "focus:ring-white/50"} focus:ring-offset-2 ${scrolled ? "focus:ring-offset-transparent" : "focus:ring-offset-primary-600"} rounded-lg`}
              aria-label="Insights menu"
            >
              <BarChart3 className="w-4 h-4" aria-hidden="true" />
              <span>Insights</span>
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-white" role="menu">
            <DropdownMenuItem asChild>
              <Link to="/my-hotels" className="flex items-center gap-2 cursor-pointer text-gray-900" role="menuitem">
                My Hotels
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/business-insights" className="flex items-center gap-2 cursor-pointer text-gray-900" role="menuitem">
                Business Insights
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/customer-dashboard" className="flex items-center gap-2 cursor-pointer text-gray-900" role="menuitem">
                My Dashboard
              </Link>
            </DropdownMenuItem>
            {userRole === "admin" && (
              <DropdownMenuItem asChild>
                <Link to="/admin-dashboard" className="flex items-center gap-2 cursor-pointer text-gray-900" role="menuitem">
                  Admin Panel
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {isLoggedIn && userRole === "admin" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`${navLinkClass} flex items-center gap-1 focus:outline-none ${scrolled ? "focus:ring-primary-500" : "focus:ring-white/50"} focus:ring-offset-2 ${scrolled ? "focus:ring-offset-transparent" : "focus:ring-offset-primary-600"} rounded-lg`}
              aria-label="API resources"
            >
              <span>API</span>
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white" role="menu">
            <DropdownMenuItem asChild>
              <Link
                to="/api-docs"
                className="flex items-center gap-2 cursor-pointer text-gray-900"
                role="menuitem"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                API Docs
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/api-status"
                className="flex items-center gap-2 cursor-pointer text-gray-900"
                role="menuitem"
              >
                <Activity className="h-4 w-4" aria-hidden="true" />
                API Status
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div className={`flex items-center justify-end ${NAV_AUTH_WIDTH}`}>
        {isLoggedIn ? (
          <UsernameMenu />
        ) : (
          <Link to="/sign-in">
            <Button
              variant="ghost"
              className="font-bold bg-white text-primary-600 hover:bg-primary-50 hover:text-primary-700 border-2 border-white/80"
              aria-label="Sign in to your account"
            >
              Log In
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default MainNav;
