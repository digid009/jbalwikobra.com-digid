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
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200',
          dragOver || uploading
            ? 'border-ios-primary bg-ios-primary/10'
            : 'border-ios-border bg-ios-surface hover:bg-ios-background hover:border-ios-primary/50',
          uploading && 'pointer-events-none'
        )}
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
      >
        <div className="flex flex-col items-center space-y-4">
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center transition-colors',
            dragOver || uploading
              ? 'bg-ios-primary text-white'
              : 'bg-ios-text/10 text-ios-text-secondary'
          )}>
            {uploading ? (
              <Upload className="w-6 h-6 animate-pulse" />
            ) : (
              <Camera className="w-6 h-6" />
            )}
          </div>
          
          <div>
            <p className="text-ios-text font-medium mb-2">
              {uploading 
                ? `Uploading ${progress.done}/${progress.total}...`
                : dragOver
                  ? 'Drop images here'
                  : 'Drag & drop images here'
              }
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                uploading
                  ? 'bg-ios-text/20 text-ios-text-secondary cursor-not-allowed'
                  : 'bg-ios-primary text-white hover:bg-ios-primary/90'
              )}
            >
              {uploading ? 'Uploading...' : 'Choose Images'}
            </button>
          </div>
          
          <p className="text-xs text-ios-text-secondary">
            Maximum {max} images • {images.length}/{max} uploaded
          </p>
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

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-ios-text">
              {label} ({images.length})
            </h4>
            <p className="text-xs text-ios-text-secondary">
              Drag to reorder
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((src, idx) => (
              <div
                key={`${src}-${idx}`}
                className={cn(
                  'relative aspect-square rounded-xl overflow-hidden bg-ios-surface border border-ios-border',
                  'hover:shadow-lg transition-all duration-200 cursor-move'
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
                  className="w-full h-full object-cover"
                  loading="lazy"
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
                    'bg-ios-error text-white hover:bg-ios-error/90 transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-ios-error/50'
                  )}
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IOSImageUploader;
