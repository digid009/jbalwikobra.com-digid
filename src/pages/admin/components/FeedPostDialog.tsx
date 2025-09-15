import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
// DS migration: use DS panel and buttons
import { FeedPost } from '../types';

interface FeedPostDialogProps {
  post: FeedPost | null;
  onSave: (post: Partial<FeedPost>) => Promise<void>;
  onClose: () => void;
}

const FeedPostDialog: React.FC<FeedPostDialogProps> = ({
  post,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<Partial<FeedPost>>({
    content: '',
    type: 'post'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData({
        id: post.id,
        content: post.content,
        type: post.type
      });
    }
  }, [post]);

  const handleInputChange = (field: keyof FeedPost, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content?.trim()) {
      alert('Please enter post content');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } catch (err) {
      console.error('Failed to save post:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
  <div className="dashboard-data-panel padded rounded-xl p-stack-lg w-full max-w-2xl">
        {/* Header */}
  <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            {post ? 'Edit Post' : 'Create New Post'}
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm p-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Post Type */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Post Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="post"
                  checked={formData.type === 'post'}
                  onChange={(e) => handleInputChange('type', e.target.value as 'post' | 'announcement')}
                  className="mr-2 text-blue-500"
                />
                <span className="text-white">Regular Post</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="announcement"
                  checked={formData.type === 'announcement'}
                  onChange={(e) => handleInputChange('type', e.target.value as 'post' | 'announcement')}
                  className="mr-2 text-blue-500"
                />
                <span className="text-white">Announcement</span>
              </label>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Content *
            </label>
            <textarea
              value={formData.content || ''}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={8}
              className="w-full p-3 border border-white/10 rounded-2xl bg-black focus:border-blue-500 focus:outline-none resize-none"
              placeholder="Write your post content here..."
              required
            />
            <div className="mt-2 text-sm text-gray-200">
              {formData.content?.length || 0} characters
            </div>
          </div>

          {/* Preview */}
          {formData.content && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Preview
              </label>
              <div className="p-4 border border-white/10 rounded-2xl bg-black-secondary">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    A
                  </div>
                  <div>
                    <p className="font-medium text-white">Administrator</p>
                    <p className="text-xs text-gray-200">Just now</p>
                  </div>
                  {formData.type === 'announcement' && (
                    <span className="ml-auto bg-amber-500 text-white text-xs px-2 py-1 rounded">
                      Announcement
                    </span>
                  )}
                </div>
                <p className="text-white whitespace-pre-wrap">
                  {formData.content}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={saving}
            >
              {saving ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedPostDialog;
