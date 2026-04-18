// PhotoUpload.tsx
import React, { useState } from "react";
import { Camera, LockKeyhole } from "lucide-react";
import { CONFIG } from "../constants/config";
import PhotoUploadModal from "./PhotoUploadModal";

const PhotoUpload: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = new Date();
  const uploadOpenDate = new Date(CONFIG.PHOTOS.UPLOAD_OPEN_ISO);
  const isDateOpen = today >= uploadOpenDate;
  const isUploadOpen = CONFIG.PHOTOS.IS_UPLOAD_READY && isDateOpen;

  const getMessageContent = () => {
    if (isUploadOpen) {
      return {
        icon: <Camera size={24} />,
        text: "Upload Yours!",
        subtext: "Share your favorite moments with us after the wedding!",
        className: "bg-primary hover:brightness-90 text-white cursor-pointer shadow-md",
      };
    } else {
      return {
        icon: <LockKeyhole size={24} />,
        text: "Upload Opens Soon",
        subtext: "The uploader will open the day before the wedding.",
        className: "bg-neutral/10 text-neutral/50 cursor-not-allowed border border-neutral/20",
      };
    }
  };

  const { icon, text, subtext, className } = getMessageContent();

  const handleClick = () => {
    if (isUploadOpen) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center relative w-full">
        <div 
          role="button"
          aria-disabled={!isUploadOpen}
          onClick={handleClick}
          className={`w-full px-8 py-4 rounded-md transition-all font-alice flex items-center justify-center gap-3 text-lg select-none ${className}`}
        >
          {icon}
          <span>{text}</span>
        </div>
        
        <p className="text-sm text-neutral/70 mt-3 text-center">{subtext}</p>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <PhotoUploadModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
};

export default PhotoUpload;