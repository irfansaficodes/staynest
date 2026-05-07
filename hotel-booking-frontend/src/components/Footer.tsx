import { memo } from "react";
import { Building2, Mail, MapPin, Github, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = memo(() => {
  return (
    <footer className="relative bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white overflow-hidden" role="contentinfo">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-5">
            <Link to="/" className="inline-flex items-center space-x-2 group">
              <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl shadow-primary-glow group-hover:bg-white/15 transition-colors">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <span className="text-2xl font-display font-bold group-hover:text-primary transition-colors">
                StayNest
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed text-sm max-w-xs">
              Find your perfect stay — from boutique hotels to luxury resorts.
              Book with confidence and travel without worry.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors hover:scale-105"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4 text-gray-400" />
              </a>
              <a
                href="mailto:createwitirfan@atomicmail.io"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors hover:scale-105"
                aria-label="Email"
              >
                <Mail className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-500 hover:text-white transition-colors text-sm flex items-center gap-1 group">
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-500 hover:text-white transition-colors text-sm flex items-center gap-1 group">
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  Search Hotels
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="text-gray-500 hover:text-white transition-colors text-sm flex items-center gap-1 group">
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Account</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/sign-in" className="text-gray-500 hover:text-white transition-colors text-sm flex items-center gap-1 group">
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-500 hover:text-white transition-colors text-sm flex items-center gap-1 group">
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  Register
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-500 hover:text-white transition-colors text-sm flex items-center gap-1 group">
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/customer-dashboard" className="text-gray-500 hover:text-white transition-colors text-sm flex items-center gap-1 group">
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Get in Touch</h3>
            <div className="space-y-4">
              <a
                href="mailto:createwitirfan@atomicmail.io"
                className="flex items-center gap-3 text-gray-500 hover:text-white transition-colors text-sm group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                createwitirfan@atomicmail.io
              </a>
              <div className="flex items-center gap-3 text-gray-500 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                India
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} StayNest. All rights reserved.
          </p>
          <span className="text-gray-700 text-xs">
            Made for educational purposes
          </span>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
