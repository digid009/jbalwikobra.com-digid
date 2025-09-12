import React from 'react';
import { IOSImageUploader } from '../../../../components/ios/IOSDesignSystem';

interface ImagesSectionProps {
  images: string[];
  onChange: (images: string[]) => void;
  onUpload: (files: File[], onProgress?: (done: number, total: number) => void) => Promise<string[]>;
}
export const ImagesSection: React.FC<ImagesSectionProps> = ({ images, onChange, onUpload }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Product Images</h3>
  <IOSImageUploader images={images} onChange={onChange} onUpload={(files, progress)=> onUpload(files, progress)} max={15} label="Product Images" />
    </div>
  );
};
export default ImagesSection;
