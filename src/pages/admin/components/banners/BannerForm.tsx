import React, { useState, useRef, useEffect } from 'react';
import { X, RefreshCw, Plus, Edit, Upload } from 'lucide-react';
import { IOSButton } from '../../../../components/ios/IOSDesignSystem';
import { BannerFormProps, BannerFormData } from './types';

export const BannerForm: React.FC<BannerFormProps> = ({
  isOpen,
  onClose,
  editingBanner,
  onSubmit,
  submitting
}) => {
  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    cta_text: '',
    sort_order: 1,
    is_active: true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingBanner) {
      setFormData({
        title: editingBanner.title,
        subtitle: editingBanner.subtitle || '',
        image_url: editingBanner.image_url,
        link_url: editingBanner.link_url || '',
        cta_text: editingBanner.cta_text || '',
        sort_order: editingBanner.sort_order,
        is_active: editingBanner.is_active
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        image_url: '',
        link_url: '',
        cta_text: '',
        sort_order: 1,
        is_active: true
      });
    }
  }, [editingBanner, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image_url) return;
    onSubmit(formData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For now, just use a placeholder URL
    // In real implementation, you would upload to storage service
    const mockImageUrl = `https://via.placeholder.com/800x400?text=${encodeURIComponent(file.name)}`;
    setFormData(prev => ({ ...prev, image_url: mockImageUrl }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-black border border-gray-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {editingBanner ? 'Edit Banner' : 'Create Banner'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-section compact">
          {/* Title */}
          <div className="form-field">
            <label htmlFor="banner-title" className="form-label required">Title</label>
            <input
              id="banner-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="form-control"
              placeholder="Enter banner title..."
              required
            />
          </div>

          {/* Subtitle */}
          <div className="form-field">
            <label htmlFor="banner-subtitle" className="form-label">Subtitle</label>
            <input
              id="banner-subtitle"
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
              className="form-control"
              placeholder="Enter banner subtitle..."
            />
          </div>

          {/* Image Upload */}
          <div className="form-field">
            <label htmlFor="banner-image-url" className="form-label required">Banner Image</label>
            <div className="stack-sm">
              <input
                id="banner-image-url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                className="form-control"
                placeholder="Enter image URL or upload file..."
                required
              />
              <div className="cluster-sm items-center">
                <span className="text-secondary typography-caption-1">or</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <IOSButton
                  type="button"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  className="cluster-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Image</span>
                </IOSButton>
              </div>
              {formData.image_url && (
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-xl border-subtle"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>

          {/* Link URL */}
          <div className="form-field">
            <label htmlFor="banner-link" className="form-label">Link URL</label>
            <input
              id="banner-link"
              type="url"
              value={formData.link_url}
              onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
              className="form-control"
              placeholder="https://example.com"
            />
          </div>

          {/* CTA Text */}
          <div className="form-field">
            <label htmlFor="banner-cta" className="form-label">Call to Action Text</label>
            <input
              id="banner-cta"
              type="text"
              value={formData.cta_text}
              onChange={(e) => setFormData(prev => ({ ...prev, cta_text: e.target.value }))}
              className="form-control"
              placeholder="Click here to learn more"
            />
          </div>

          {/* Sort Order */}
          <div className="form-field">
            <label htmlFor="banner-sort" className="form-label">Sort Order</label>
            <input
              id="banner-sort"
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 1 }))}
              className="form-control"
              min="1"
            />
          </div>

          {/* Active Status */}
          <div className="form-field">
            <label className="form-label">Active Banner</label>
            <button
              type="button"
              role="switch"
              aria-checked={formData.is_active}
              onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
              className={`toggle ${formData.is_active ? 'active' : ''}`}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <IOSButton
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </IOSButton>
            <IOSButton
              type="submit"
              variant="primary"
              disabled={submitting || !formData.title || !formData.image_url}
              className="flex items-center space-x-2"
            >
              {submitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : editingBanner ? (
                <Edit className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>
                {submitting ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
              </span>
            </IOSButton>
          </div>
        </form>
      </div>
    </div>
  );
};
