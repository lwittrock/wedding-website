import React, { useState } from "react";
import { Lock, Image as ImageIcon } from "lucide-react";
import { CONFIG } from "../constants/config";

const PhotoDownload: React.FC = () => {
  const [showPatienceMessage, setShowPatienceMessage] = useState(false);

  const isReady = CONFIG.PHOTOS.IS_READY;
  const galleryLink = CONFIG.PHOTOS.GALLERY_URL;

  // 1. Calculate if today is before the wedding
  const today = new Date();
  const weddingDate = new Date(CONFIG.DATES.WEDDING_DAY_ISO);
  const isBeforeWedding = today < weddingDate;

  const handleClick = (e: React.MouseEvent) => {
    if (!isReady) {
      e.preventDefault();
      setShowPatienceMessage(true);
      setTimeout(() => setShowPatienceMessage(false), 4000);
    }
  };

  return (
    <div className="flex flex-col items-center relative w-full">
      <a
        href={isReady ? galleryLink : "#"}
        target={isReady ? "_blank" : "_self"}
        rel={isReady ? "noopener noreferrer" : ""}
        onClick={handleClick}
        className={`w-full px-8 py-4 rounded-md transition-all font-alice flex items-center justify-center gap-3 text-lg select-none
          ${isReady 
            ? "bg-primary hover:brightness-90 text-white cursor-pointer shadow-md" 
            : "bg-neutral/10 text-neutral/50 cursor-not-allowed border border-neutral/20"
          }`}
      >
        {isReady ? <ImageIcon size={24} /> : <Lock size={24} />}
        <span>{isReady ? "View Official Photos" : "Official Photos"}</span>
      </a>

      {/* The Dynamic Patience Message Popup */}
      <div 
        className={`absolute -top-16 left-1/2 -translate-x-1/2 w-max max-w-[90vw] bg-primary text-white text-sm px-4 py-3 rounded shadow-lg transition-all duration-300 transform z-10 text-center
          ${showPatienceMessage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}
        `}
      >
        <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rotate-45"></div>
        
        {/* 2. Toggle the message based on the date */}
        {isBeforeWedding ? (
           <>
             <span className="font-semibold">You're very early!</span> Photos will be available after the wedding.
           </>
        ) : (
           <>
             <span className="font-semibold">A bit more patience</span>, the photos are coming soon! 📸
           </>
        )}
        
      </div>
      
      <p className="text-sm text-neutral/70 mt-3 text-center">
        {isReady 
          ? "The photos are ready! Enjoy browsing and downloading your favorites." 
          : "Professional photos will be available here after the wedding."}
      </p>
    </div>
  );
};

export default PhotoDownload;