import React from "react";
import { X } from "lucide-react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  altText: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageSrc, altText }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl w-full animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-primary transition-colors"
        >
          <X size={32} />
        </button>
        <img 
          src={imageSrc} 
          alt={altText} 
          className="w-full h-auto max-h-[85vh] object-contain rounded-md shadow-2xl" 
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
        />
      </div>
    </div>
  );
};

export default ImageModal;