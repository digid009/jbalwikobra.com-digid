import React from 'react';
import ImageUploader from '../../../../components/ImageUploader';

interface ImagesSectionProps {
  images: string[];
  onChange: (images: string[]) => void;
  onUpload: (files: File[], onProgress?: (done: number, total: number) => void) => Promise<string[]>;
}
export const ImagesSection: React.FC<ImagesSectionProps> = ({ images, onChange, onUpload }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Product Images</h3>
  <ImageUploader images={images} onChange={onChange} onUpload={(files, progress)=> onUpload(files, progress)} max={15} />
    </div>
  );
};
export default ImagesSection;
