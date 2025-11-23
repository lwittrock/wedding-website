import React, { useState, useEffect } from "react";
import { Mail } from "lucide-react";

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
      className="fixed bottom-6 right-6 z-50 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-110 flex items-center gap-2"
      aria-label="RSVP Now"
    >
      <Mail size={24} />
      <span className="font-alice hidden md:inline">RSVP</span>
    </button>
  );
};

export default FloatingRSVP;