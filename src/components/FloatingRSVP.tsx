import React, { useState, useEffect } from "react";
import { CalendarCheck } from "lucide-react";

interface FloatingRSVPProps {
  scrollToSection: (id: string) => void;
}

const FloatingRSVP: React.FC<FloatingRSVPProps> = ({ scrollToSection }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button after scrolling down 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      onClick={() => scrollToSection("rsvp")}
      className="fixed bottom-4 right-4 z-50 bg-primary text-white px-4 py-2.5 md:px-5 md:py-3 rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-110 flex items-center gap-2"
      aria-label="RSVP Now"
    >
      <CalendarCheck size={18} className="md:w-5 md:h-5" />
      <span className="font-alice text-xs md:text-sm font-semibold">RSVP</span>
    </button>
  );
};

export default FloatingRSVP;