import { memo } from "react";
import { Search, MapPin, Calendar, Users, Star } from "lucide-react";
import AdvancedSearch from "./AdvancedSearch";

const Hero = memo(({ onSearch }: { onSearch?: (searchData: { destination: string; checkIn: Date; checkOut: Date; adultCount: number; childCount: number }) => void }) => {
  return (
    <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 overflow-hidden" role="banner">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-transparent" />

      <div className="absolute top-20 left-20 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-float" />
      <div className="absolute bottom-20 right-20 w-36 h-36 bg-white/5 rounded-full blur-2xl animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="w-full px-4 sm:px-6 lg:px-8 pt-12 pb-12 relative">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-md rounded-full px-6 py-2 mb-8 animate-fade-in-up">
            <Star className="w-4 h-4 text-yellow-400 mr-2" />
            <span className="text-white font-medium text-sm">
              Trusted by 10,000+ travelers
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold text-white mb-6 leading-none tracking-tight">
            <span className="block animate-fade-in-up">Find Your Perfect</span>
            <span className="block bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent animate-fade-in-up" style={{ animationDelay: "150ms" }}>
              Dream Stay
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            Discover amazing hotels, resorts, and accommodations worldwide.
            <br className="hidden md:block" />
            Book with confidence and enjoy unforgettable experiences.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 mb-14 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <div className="flex items-center text-white/70">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-2">
                <Search className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Smart Search</span>
            </div>
            <div className="flex items-center text-white/70">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-2">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Global Destinations</span>
            </div>
            <div className="flex items-center text-white/70">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-2">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Flexible Booking</span>
            </div>
            <div className="flex items-center text-white/70">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-2">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">24/7 Support</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto animate-fade-in-up" style={{ animationDelay: "500ms" }}>
          <div className="glass rounded-2xl p-1 shadow-primary-glow">
            <AdvancedSearch onSearch={onSearch || (() => {})} />
          </div>
        </div>
      </div>
    </section>
  );
});

export default Hero;
