import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { IOSButton } from '../../../../components/ios/IOSDesignSystem';

interface ProductImagesUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

export const ProductImagesUpload: React.FC<ProductImagesUploadProps> = ({
  images,
  onImagesChange,
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the 15 image limit
    if (images.length + files.length > 15) {
      alert(`Maximum 15 images allowed. You can add ${15 - images.length} more images.`);
      return;
    }

    setUploading(true);
    
    try {
      // Simulate upload - in real implementation, you'd upload to storage service
      const newImages = Array.from(files).map((file) => {
        return URL.createObjectURL(file); // This is just for demo
      });
      
      onImagesChange([...images, ...newImages]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="bg-gradient-to-br from-white/5 via-white/3 to-transparent backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
          <ImageIcon className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Product Images</h3>
      </div>

      <div className="space-y-4">
        {/* Upload Area */}
        <div className={`border-2 border-dashed rounded-xl p-6 transition-all duration-300 ${
          images.length >= 15 
            ? 'border-gray-600/30 bg-gray-800/20' 
            : 'border-white/20 hover:border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-fuchsia-500/5'
        }`}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="image-upload"
            disabled={uploading || images.length >= 15}
          />
          <label
            htmlFor="image-upload"
            className={`flex flex-col items-center justify-center space-y-3 ${
              images.length >= 15 ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              images.length >= 15 
                ? 'bg-gray-600/20' 
                : 'bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20'
            }`}>
              <Upload className={`w-6 h-6 ${
                images.length >= 15 
                  ? 'text-gray-500' 
                  : uploading 
                    ? 'text-pink-400 animate-pulse' 
                    : 'text-pink-400'
              }`} />
            </div>
            <div className="text-center">
              <p className={`font-medium ${
                images.length >= 15 ? 'text-gray-500' : 'text-white'
              }`}>
                {images.length >= 15 
                  ? 'Maximum Images Reached' 
                  : uploading 
                    ? 'Uploading...' 
                    : 'Upload Images'
                }
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {images.length >= 15 
                  ? `${images.length}/15 images uploaded`
                  : 'PNG, JPG up to 10MB each'
                }
              </p>
            </div>
          </label>
        </div>

        {/* Image Preview Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative group bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-xl overflow-hidden aspect-square border border-white/10 hover:border-pink-500/30 transition-all duration-300"
              >
                <img
                  src={image}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <IOSButton
                    onClick={() => removeImage(index)}
                    className="p-2 bg-red-500/20 border-red-500/30 hover:bg-red-500/30 backdrop-blur-sm"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </IOSButton>
                </div>
                {index === 0 && (
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 text-pink-200 text-xs rounded-full border border-pink-500/30 backdrop-blur-sm">
                      Main Image
                    </span>
                  </div>
                )}
                <div className="absolute bottom-2 right-2">
                  <span className="px-2 py-1 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm">
                    {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Management Info */}
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-200 font-medium">📸 Image Guidelines:</p>
            <span className="text-xs text-blue-300 bg-blue-500/20 px-2 py-1 rounded-full">
              {images.length}/15 images
            </span>
          </div>
          <ul className="text-xs text-blue-300/80 space-y-1">
            <li>• First image will be used as the main product image</li>
            <li>• Recommended resolution: 1080x1080px or higher</li>
            <li>• Maximum 15 images per product</li>
            <li>• Supported formats: PNG, JPG, WEBP</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
