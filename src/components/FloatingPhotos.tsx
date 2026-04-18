import React, { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { CONFIG } from "../constants/config";

interface FloatingPhotosProps {
  scrollToSection: (id: string) => void;
}

const FloatingPhotos: React.FC<FloatingPhotosProps> = ({ scrollToSection }) => {
  const [isVisible, setIsVisible] = useState(false);

  const today = new Date();
  const uploadOpenDate = new Date(CONFIG.PHOTOS.UPLOAD_OPEN_ISO);
  const isUploadOpen = CONFIG.PHOTOS.IS_UPLOAD_READY && today >= uploadOpenDate;

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  if (!isUploadOpen || !isVisible) return null;

  return (
    <button
      onClick={() => scrollToSection("photos")}
      className="fixed bottom-4 right-4 z-50 bg-primary text-white px-5 py-3 rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-110 flex items-center gap-2"
      aria-label="Go to Photos"
    >
      <Camera size={20} />
      <span className="font-alice text-sm font-semibold">Photos</span>
    </button>
  );
};

export default FloatingPhotos;
