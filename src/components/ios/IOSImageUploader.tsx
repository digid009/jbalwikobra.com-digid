import React, { useRef, useState } from 'react';
import { Camera, X, Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../styles/standardClasses';

interface IOSImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  onUpload: (files: File[], onProgress?: (done: number, total: number) => void) => Promise<string[]>;
  max?: number;
  label?: string;
}

export const IOSImageUploader: React.FC<IOSImageUploaderProps> = ({
  images,
  onChange,
  onUpload,
  max = 15,
  label = 'Product Images'
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });
  const [dragOver, setDragOver] = useState(false);
  const dragIndex = useRef<number | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const remainingSlots = Math.max(0, max - images.length);
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    if (filesToUpload.length === 0) {
      alert(`Maximum ${max} images allowed. You already have ${images.length} images.`);
      return;
    }

    setUploading(true);
    setProgress({ done: 0, total: filesToUpload.length });
    
    try {
      const uploadedUrls = await onUpload(filesToUpload, (done, total) => {
        setProgress({ done, total });
      });
      
      if (uploadedUrls.length > 0) {
        onChange([...images, ...uploadedUrls]);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
      setProgress({ done: 0, total: 0 });
    }
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    await handleFiles(e.dataTransfer.files);
  };

  const onDragStart = (idx: number) => (e: React.DragEvent) => {
    dragIndex.current = idx;
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDropReorder = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === idx) return;
    
    const newImages = [...images];
    const [movedImage] = newImages.splice(from, 1);
    newImages.splice(idx, 0, movedImage);
    dragIndex.current = null;
    onChange(newImages);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-white">
          {label} ({images.length}/{max})
        </h4>
        {images.length > 0 && (
          <p className="text-xs text-white-secondary">
            Drag to reorder
          </p>
        )}
      </div>
      
      {/* Compact Image Grid with Add Button */}
      <div 
        className="grid grid-cols-3 gap-3 auto-rows-fr"
        style={{ 
          gridTemplateRows: 'repeat(auto-fit, minmax(0, 1fr))',
          gridAutoRows: 'minmax(0, 1fr)'
        }}
      >
        {images.map((src, idx) => (
          <div
            key={`${src}-${idx}`}
            className={cn(
              'relative w-full aspect-square rounded-xl overflow-hidden bg-black border border-gray-700',
              'hover:shadow-lg transition-all duration-200 cursor-move group'
            )}
            draggable
            onDragStart={onDragStart(idx)}
            onDragOver={onDragOver(idx)}
            onDrop={onDropReorder(idx)}
            title="Drag to reorder"
          >
            <img 
              src={src} 
              alt={`Upload ${idx + 1}`} 
              className="w-full h-full object-cover object-center"
              loading="lazy"
              style={{ aspectRatio: '1 / 1' }}
            />
            
            {/* Primary Badge */}
            {idx === 0 && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-ios-primary text-white text-xs font-medium rounded-md">
                Primary
              </div>
            )}
            
            {/* Remove Button */}
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className={cn(
                'absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center',
                'bg-ios-error text-white hover:bg-ios-error/90 transition-colors opacity-0 group-hover:opacity-100',
                'focus:outline-none focus:ring-2 focus:ring-ios-error/50 focus:opacity-100'
              )}
              title="Remove image"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        {/* Add More Button */}
        {images.length < max && (
          <div
            className={cn(
              'w-full aspect-square rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 flex flex-col items-center justify-center',
              dragOver || uploading
                ? 'border-ios-primary bg-ios-primary/10 scale-[1.02]'
                : 'border-gray-700 bg-black hover:bg-ios-background hover:border-ios-primary/50'
            )}
            style={{ aspectRatio: '1 / 1' }}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragOver(false);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <div className="text-white-secondary text-center">
              {uploading ? (
                <>
                  <Upload className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs font-medium">Uploading...</p>
                  <p className="text-xs opacity-75">{progress.done}/{progress.total}</p>
                </>
              ) : (
                <>
                  <Camera className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-xs font-medium">Add Image</p>
                  <p className="text-xs opacity-75">+ Upload</p>
                </>
              )}
            </div>
            
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
              disabled={uploading}
            />
          </div>
        )}
      </div>
      
      {/* Help Text */}
      <p className="text-xs text-white-secondary text-center">
        {dragOver ? 'Drop images here' : `Drag & drop or click + to add images • JPG, PNG up to 10MB each`}
      </p>
    </div>
  );
};

export default IOSImageUploader;
