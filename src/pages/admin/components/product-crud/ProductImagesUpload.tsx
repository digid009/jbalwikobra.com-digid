import React, { useState, useRef, useEffect } from 'react';
import { X, Cloud, RefreshCw } from 'lucide-react';
// Adjusted relative path to storageService
import { uploadFiles, UploadResult } from '../../../../services/storageService';

interface ProductImagesUploadProps { 
  images: string[]; 
  onImagesChange: (images: string[]) => void; 
  onUploadingChange?: (uploading: boolean) => void; // notify parent when upload state changes
}

export const ProductImagesUpload: React.FC<ProductImagesUploadProps> = ({ images, onImagesChange, onUploadingChange }) => {
  const [uploading, setUploading] = useState(false);
  // Internal richer state for progress + status while exposing plain string[] upward
  interface LocalImage { tempUrl: string; finalUrl?: string; status: 'pending'|'uploading'|'success'|'error'; progress: number; file?: File; }
  const [localImages, setLocalImages] = useState<LocalImage[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dragItemIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  const MAX_IMAGES = 15; // business rule retained
  const TOTAL_SLOTS = 16; // 8 columns * 2 rows (slot 0 is uploader)

  // Sync external images -> localImages (mount or parent reset). Only add entries we don't already track.
  useEffect(()=>{
    setLocalImages(prev => {
      const existingFinals = new Set(prev.filter(li=>li.finalUrl).map(li=>li.finalUrl));
      const next: LocalImage[] = [...prev];
      images.forEach(url => {
        if (!existingFinals.has(url)) {
          next.push({ tempUrl: url, finalUrl: url, status: 'success', progress: 100 });
        }
      });
      // Remove any local success entries removed upstream
      return next.filter(li => !li.finalUrl || images.includes(li.finalUrl));
    });
  }, [images]);

  // propagate internal uploading state upward
  useEffect(()=>{ onUploadingChange && onUploadingChange(uploading); }, [uploading, onUploadingChange]);

  // Cleanup: revoke all blob object URLs on unmount
  useEffect(()=>{
    return () => {
      try {
        localImages.forEach(li => { if (li.tempUrl.startsWith('blob:')) URL.revokeObjectURL(li.tempUrl); });
      } catch(e) {
        console.warn('Blob revoke cleanup failed (ignored):', e);
      }
    };
  }, [localImages]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files; 
    if (!files || !files.length) return;
    if (images.length + files.length > MAX_IMAGES) { 
      alert(`Maximum ${MAX_IMAGES} images allowed. You can add ${MAX_IMAGES - images.length} more images.`); 
      return; 
    }
    setUploading(true);
    const fileArr = Array.from(files);
    // Insert local pending entries
    const newEntries: LocalImage[] = fileArr.map(f => ({ tempUrl: URL.createObjectURL(f), status: 'uploading', progress: 0, file: f }));
    setLocalImages(prev => [...prev, ...newEntries]);
    // Expose placeholder blob urls upward (so UI consistent) but they will be blocked from submit
    onImagesChange([ ...images, ...newEntries.map(e=>e.tempUrl) ]);
    try {
      let done = 0;
      const uploaded: UploadResult[] = await uploadFiles(fileArr, 'products', (d, total) => {
        done = d; // simplistic progress: per-file completion
        setLocalImages(prev => prev.map(li => {
          if (li.status === 'uploading' && li.file) {
            // approximate file-level progress (completed files count / total)
            return { ...li, progress: Math.min(99, Math.round((done-1)/total*100)) };
          }
          return li;
        }));
      });
      // Apply final success mapping
      setLocalImages(prev => prev.map(li => {
        if (li.file) {
          const idx = fileArr.indexOf(li.file);
          if (idx !== -1) {
            const up = uploaded[idx];
            if (up && up.url) {
              return { ...li, finalUrl: up.url, status: 'success', progress: 100 };
            }
            if (!up || !up.url) {
              return { ...li, status: 'error', progress: 0 };
            }
          }
        }
        return li;
      }));
      const finalAdditions = uploaded.filter(u=>u && u.url).map(u=>u.url);
      if (finalAdditions.length) {
        onImagesChange([ ...images, ...finalAdditions ]);
      }
    } catch (e) {
      console.error('[ProductImagesUpload] Image upload batch failed:', e);
      setLocalImages(prev => prev.map(li => li.status==='uploading' ? { ...li, status: 'error', progress: 0 } : li));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const removeImage = (index: number) => { 
    const target = localImages[index];
    setLocalImages(prev => prev.filter((_,i)=>i!==index));
    const updated = images.filter((_, i) => i !== index);
    onImagesChange(updated); if (activeIndex === index) setActiveIndex(null); 
    if (target && target.tempUrl.startsWith('blob:')) {
      URL.revokeObjectURL(target.tempUrl);
    }
  };

  const retryImage = async (index: number) => {
    const li = localImages[index];
    if (!li || li.status !== 'error' || !li.file) return;
    setLocalImages(prev => prev.map((img,i)=> i===index ? { ...img, status: 'uploading', progress: 0 } : img));
    setUploading(true);
    try {
      const [result] = await uploadFiles([li.file], 'products');
      if (result && result.url) {
        setLocalImages(prev => prev.map((img,i)=> i===index ? { ...img, finalUrl: result.url, status: 'success', progress: 100 } : img));
        // replace placeholder blob in parent images with final url
  // Replace in current images array (cannot use functional form because prop expects string[])
  onImagesChange(images.map(p => p === li.tempUrl ? result.url : p));
      } else {
        setLocalImages(prev => prev.map((img,i)=> i===index ? { ...img, status: 'error', progress: 0 } : img));
      }
    } catch (e) {
      console.error('Retry upload failed:', e);
      setLocalImages(prev => prev.map((img,i)=> i===index ? { ...img, status: 'error', progress: 0 } : img));
    } finally {
      setUploading(false);
    }
  };

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
                className={`relative aspect-square rounded-xl flex items-center justify-center bg-black/40 border border-white/8 transition-soft group ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-pink-500/50 hover:bg-black/50'}`}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-pink-500/25 text-pink-300 group-hover:bg-pink-500/35 group-hover:text-pink-200 transition-colors">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-white/55 tracking-wide">Upload Max {MAX_IMAGES}</span>
                </div>
                <input id="image-upload" type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading || images.length>=MAX_IMAGES} />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white/70 bg-black/60 rounded-xl">
                    Mengupload...
                  </div>
                )}
              </label>
            );
          }
          const imgIndex = slotIndex - 1; // map to images array
          const local = localImages[imgIndex];
          const image = local?.finalUrl || local?.tempUrl;
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
                  {local && local.status !== 'success' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/70 text-[10px] text-white tracking-wide">
                      {local.status === 'uploading' && (
                        <>
                          <span>Mengupload {local.progress}%</span>
                          <div className="w-10 h-1 bg-white/20 rounded overflow-hidden">
                            <div className="h-full bg-pink-500 transition-all" style={{ width: `${local.progress}%` }} />
                          </div>
                        </>
                      )}
                      {local.status === 'error' && (
                        <button type="button" onClick={(e)=>{ e.stopPropagation(); retryImage(imgIndex); }} className="flex items-center gap-1 px-2 py-1 bg-red-600/80 hover:bg-red-500 rounded text-[10px]">
                          <RefreshCw className="w-3 h-3" /> Retry
                        </button>
                      )}
                      {local.status === 'pending' && <span>Menunggu...</span>}
                    </div>
                  )}
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
