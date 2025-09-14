import React, { useState, useRef } from 'react';
import { X, Cloud } from 'lucide-react';

interface ProductImagesUploadProps { images: string[]; onImagesChange: (images: string[]) => void; }

export const ProductImagesUpload: React.FC<ProductImagesUploadProps> = ({ images, onImagesChange }) => {
  const [uploading, setUploading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dragItemIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  const MAX_IMAGES = 15; // business rule retained
  const TOTAL_SLOTS = 16; // 8 columns * 2 rows (slot 0 is uploader)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files; if (!files || !files.length) return;
    if (images.length + files.length > MAX_IMAGES) { alert(`Maximum ${MAX_IMAGES} images allowed. You can add ${MAX_IMAGES - images.length} more images.`); return; }
    setUploading(true);
    try {
      const newImages = Array.from(files).map(f => URL.createObjectURL(f));
      onImagesChange([...images, ...newImages]);
    } finally { setUploading(false); }
  };

  const removeImage = (index: number) => { const updated = images.filter((_, i) => i !== index); onImagesChange(updated); if (activeIndex === index) setActiveIndex(null); };

  // Drag & Drop Handlers (skip slot 0 uploader)
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => { if(index===0) return; dragItemIndex.current = index - 1; e.dataTransfer.effectAllowed = 'move'; };
  const handleDragEnter = (_e: React.DragEvent<HTMLDivElement>, index: number) => { if(index===0) return; dragOverIndex.current = index - 1; };
  const handleDragEnd = () => {
    const from = dragItemIndex.current; const to = dragOverIndex.current;
    if (from===null || to===null || from===to) { dragItemIndex.current = dragOverIndex.current = null; return; }
    const reordered = [...images]; const [moved] = reordered.splice(from,1); reordered.splice(to,0,moved); onImagesChange(reordered); dragItemIndex.current = dragOverIndex.current = null; setActiveIndex(to); };

  // Build slots: slot 0 is uploader, remaining 15 map to images indices 0..14
  const slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => i);

  return (
    <div className="section-block stack-lg">
      <div className="section-title">Gambar <span className="text-xs text-white/50">({images.length}/{MAX_IMAGES})</span></div>
  <div className="images-grid-8x2">
        {slots.map(slotIndex => {
          if (slotIndex === 0) {
            return (
              <label
                key={slotIndex}
                htmlFor="image-upload"
                className="relative aspect-square rounded-xl flex items-center justify-center cursor-pointer bg-black/40 border border-white/8 hover:border-pink-500/50 hover:bg-black/50 transition-soft group"
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-pink-500/25 text-pink-300 group-hover:bg-pink-500/35 group-hover:text-pink-200 transition-colors">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-white/55 tracking-wide">Upload Max {MAX_IMAGES}</span>
                </div>
                <input id="image-upload" type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading || images.length>=MAX_IMAGES} />
              </label>
            );
          }
          const imgIndex = slotIndex - 1; // map to images array
          const image = images[imgIndex];
          const isActive = activeIndex === imgIndex;
          return (
            <div
              key={slotIndex}
              className={
                image
                  ? `relative aspect-square rounded-xl overflow-hidden group border ${isActive ? 'border-pink-500 shadow-[0_0_0_1px_rgba(236,72,153,0.4)]' : 'border-white/15 hover:border-pink-400/60'} transition-soft cursor-move`
                  : 'relative aspect-square rounded-xl bg-transparent border border-transparent cursor-default'
              }
              draggable={!!image}
              onDragStart={(e)=>handleDragStart(e, slotIndex)}
              onDragEnter={(e)=>handleDragEnter(e, slotIndex)}
              onDragEnd={handleDragEnd}
              onDragOver={(e)=> image && e.preventDefault()}
              onClick={() => image && setActiveIndex(imgIndex)}
            >
              {image ? (
                <>
                  <img src={image} alt={`Image ${imgIndex+1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-1.5">
                    <button
                      type="button"
                      onClick={(e)=>{ e.stopPropagation(); removeImage(imgIndex); }}
                      className="p-1 rounded-md bg-black/60 hover:bg-red-500/80 border border-white/10 hover:border-red-400/70 transition-soft"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
