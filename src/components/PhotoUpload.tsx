import React from "react";
import { Camera, Lock } from "lucide-react";
import { CONFIG } from "../constants/config";

const PhotoUpload: React.FC = () => {

  // Upload readiness from config
  const isUploadReady = CONFIG.PHOTOS.IS_UPLOAD_READY

  const getMessageContent = () => {
    if (isUploadReady) {
      // Future state: If you decide to flip a boolean in config to activate it
      return {
        icon: <Camera size={24} />,
        text: "Upload Yours!",
        subtext: "Share your favorite moments with us!",
        className: "bg-primary hover:brightness-90 text-white cursor-pointer shadow-md",
      };
    } else {
      return {
        icon: <Lock size={24} />,
        text: "Upload Available Soon",
        subtext: "We are looking forward to seeing your photos after the wedding!",
        className: "bg-neutral/10 text-neutral/50 cursor-not-allowed border border-neutral/20",
      };
    }
  };

  const { icon, text, subtext, className } = getMessageContent();

  return (
    <div className="flex flex-col items-center relative w-full">
      {/* This link/button does nothing, as it's a placeholder */}
      <div 
        role="button"
        aria-disabled={!isUploadReady}
        className={`w-full px-8 py-4 rounded-md transition-all font-alice flex items-center justify-center gap-3 text-lg select-none ${className}`}
      >
        {icon}
        <span>{text}</span>
      </div>
      
      <p className="text-sm text-neutral/70 mt-3 text-center">{subtext}</p>
    </div>
  );
};

export default PhotoUpload;