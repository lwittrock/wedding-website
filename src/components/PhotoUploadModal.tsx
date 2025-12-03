// PhotoUploadModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Upload, CheckCircle, XCircle, Loader2, Camera } from 'lucide-react';

interface UploadResult {
  status: 'success' | 'error';
  fileName: string;
  publicId?: string;
  url?: string;
  folder?: string;
  error?: string;
}

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({ isOpen, onClose }) => {
  const [guestName, setGuestName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  // YOUR CLOUDINARY CONFIG
  const CLOUD_NAME = "davf9thfe";
  const UPLOAD_PRESET = "wedding_guest_upload";

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sanitizeFolderName = (name: string): string => {
    return name
      .trim()
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .toLowerCase();
  };

  const uploadFileToCloudinary = async (file: File, guestName: string): Promise<UploadResult> => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    
    // 📁 CREATE FOLDER PER PERSON
    const folderName = sanitizeFolderName(guestName);
    formData.append("folder", `wedding_photos/${folderName}`);
    
    // Add guest name as context metadata
    formData.append("context", `guest_name=${guestName}`);
    
    // Create unique public ID within that folder
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const publicId = `photo_${timestamp}_${randomStr}`;
    formData.append("public_id", publicId);

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      return { 
        status: 'success', 
        fileName: file.name,
        publicId: data.public_id,
        url: data.secure_url,
        folder: data.folder
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Upload Error:", error);
      return {
        status: 'error',
        fileName: file.name,
        error: errorMessage
      };
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      setShowResults(false);
    }
  };

  const handleUpload = async () => {
    if (!guestName.trim()) {
      alert('Please enter your name');
      return;
    }

    if (selectedFiles.length === 0) {
      alert('Please select at least one photo');
      return;
    }

    setUploading(true);
    setUploadResults([]);

    const results: UploadResult[] = [];
    
    for (const file of selectedFiles) {
      const result = await uploadFileToCloudinary(file, guestName.trim());
      results.push(result);
      setUploadResults([...results]);
    }

    setUploading(false);
    setShowResults(true);
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setUploadResults([]);
    setShowResults(false);
  };

  const handleClose = () => {
    if (!uploading) {
      setGuestName('');
      setSelectedFiles([]);
      setUploadResults([]);
      setShowResults(false);
      onClose();
    }
  };

  const successCount = uploadResults.filter(r => r.status === 'success').length;
  const failCount = uploadResults.filter(r => r.status === 'error').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-alice font-bold text-neutral">
              Share Your Photos
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showResults ? (
            <>
              {/* Name Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-alice">
                  Your Name
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your photos will be organized in a folder with your name
                </p>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-alice">
                  Select Photos
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <span className="text-sm text-gray-600">
                      Click to select photos or drag and drop (maximum 50 at a time)
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PNG, JPG, HEIC up to 10MB each
                    </span>
                  </label>
                </div>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2 font-alice">
                    Selected: {selectedFiles.length} photo{selectedFiles.length !== 1 ? 's' : ''}
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="text-sm text-gray-600 py-1">
                        {file.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                    <span className="text-sm text-gray-600">
                      Uploading {uploadResults.length} of {selectedFiles.length}...
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(uploadResults.length / selectedFiles.length) * 100}%`
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={uploading || selectedFiles.length === 0 || !guestName.trim()}
                className="w-full bg-primary text-white py-3 rounded-lg font-medium font-alice hover:brightness-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                {uploading ? 'Uploading...' : 'Upload Photos'}
              </button>
            </>
          ) : (
            /* Results */
            <div>
              <div className="text-center mb-6">
                {failCount === 0 ? (
                  <>
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-2 font-alice">
                      All Photos Uploaded!
                    </h3>
                    <p className="text-gray-600">
                      Thank you for sharing your memories with us
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-yellow-500 text-xl mb-3">⚠️</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2 font-alice">
                      Upload Complete
                    </h3>
                    <p className="text-gray-600">
                      {successCount} succeeded, {failCount} failed
                    </p>
                  </>
                )}
              </div>

              {/* Results List */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-60 overflow-y-auto">
                {uploadResults.map((result, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                  >
                    <span className="text-sm text-gray-700 truncate flex-1 mr-2">
                      {result.fileName}
                    </span>
                    {result.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium font-alice hover:bg-gray-300 transition"
                >
                  Upload More
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-medium font-alice hover:brightness-90 transition"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoUploadModal;