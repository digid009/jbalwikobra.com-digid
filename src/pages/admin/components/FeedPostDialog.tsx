import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { IOSButton, IOSCard } from '../../../components/ios/IOSDesignSystem';
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
      <IOSCard className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ios-separator">
          <h2 className="text-xl font-semibold text-ios-text">
            {post ? 'Edit Post' : 'Create New Post'}
          </h2>
          <IOSButton
            variant="secondary"
            size="small"
            onClick={onClose}
            className="p-2"
          >
            <X className="w-4 h-4" />
          </IOSButton>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Post Type */}
          <div>
            <label className="block text-sm font-medium text-ios-text mb-2">
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
                  className="mr-2 text-ios-primary"
                />
                <span className="text-ios-text">Regular Post</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="announcement"
                  checked={formData.type === 'announcement'}
                  onChange={(e) => handleInputChange('type', e.target.value as 'post' | 'announcement')}
                  className="mr-2 text-ios-primary"
                />
                <span className="text-ios-text">Announcement</span>
              </label>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-ios-text mb-2">
              Content *
            </label>
            <textarea
              value={formData.content || ''}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={8}
              className="w-full p-3 border border-ios-separator rounded-2xl bg-ios-surface focus:border-ios-primary focus:outline-none resize-none"
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
              <label className="block text-sm font-medium text-ios-text mb-2">
                Preview
              </label>
              <div className="p-4 border border-ios-separator rounded-2xl bg-ios-surface-secondary">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-ios-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                    A
                  </div>
                  <div>
                    <p className="font-medium text-ios-text">Administrator</p>
                    <p className="text-xs text-gray-200">Just now</p>
                  </div>
                  {formData.type === 'announcement' && (
                    <span className="ml-auto bg-ios-warning text-white text-xs px-2 py-1 rounded">
                      Announcement
                    </span>
                  )}
                </div>
                <p className="text-ios-text whitespace-pre-wrap">
                  {formData.content}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-ios-separator">
            <IOSButton
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={saving}
            >
              Cancel
            </IOSButton>
            <IOSButton
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={saving}
            >
              {saving ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
            </IOSButton>
          </div>
        </form>
      </IOSCard>
    </div>
  );
};

export default FeedPostDialog;
