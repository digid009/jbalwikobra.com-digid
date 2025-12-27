import React, { useState, useRef, useEffect } from 'react';
import { X, RefreshCw, Plus, Edit, Upload } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black border border-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {editingBanner ? 'Edit Banner' : 'Create New Banner'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-gray-800 border border-gray-700 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-200"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
              placeholder="Enter banner title..."
              required
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subtitle
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
              className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
              placeholder="Enter banner subtitle..."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Banner Image *
            </label>
            <div className="space-y-4">
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                placeholder="Enter image URL or upload file..."
                required
              />
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">or</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-200"
                >
                  <Upload className="w-4 h-4" />
                  Upload Image
                </button>
              </div>
              {formData.image_url && (
                <div className="rounded-lg overflow-hidden border border-gray-700">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Link URL
            </label>
            <input
              type="url"
              value={formData.link_url}
              onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
              className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
              placeholder="https://example.com"
            />
          </div>

          {/* CTA Text */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Call to Action Text
            </label>
            <input
              type="text"
              value={formData.cta_text}
              onChange={(e) => setFormData(prev => ({ ...prev, cta_text: e.target.value }))}
              className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
              placeholder="Click here to learn more"
            />
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sort Order
            </label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 1 }))}
              className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
              min="1"
            />
          </div>

          {/* Active Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
                formData.is_active 
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full ${formData.is_active ? 'bg-emerald-400' : 'bg-gray-400'}`} />
              {formData.is_active ? 'Active' : 'Inactive'}
            </button>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700 hover:text-white transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.title || !formData.image_url}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-fuchsia-700 transition-all duration-200 shadow-lg hover:shadow-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2 inline-block" />
                  Saving...
                </>
              ) : (
                <>
                  {editingBanner ? (
                    <Edit className="w-4 h-4 mr-2 inline-block" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2 inline-block" />
                  )}
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
