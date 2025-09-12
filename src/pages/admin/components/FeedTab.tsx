import React, { useState } from 'react';
import { MessageSquare, Plus, Edit, Trash2, Calendar, User, Share2, Check } from 'lucide-react';
import { IOSButton, IOSCard, IOSBadge } from '../../../components/ios/IOSDesignSystem';
import { useFeedPosts } from '../hooks/useAdminData';
import { FeedPost } from '../types';
import FeedPostDialog from './FeedPostDialog';

const FeedTab: React.FC = () => {
  const { feedPosts, loading, error, saveFeedPost, deleteFeedPost } = useFeedPosts();
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<FeedPost | null>(null);
  // Share state placed before any early returns to respect hook rules
  const [sharedPostId, setSharedPostId] = useState<string | null>(null);

  const handleAddPost = () => {
    setEditingPost(null);
    setShowPostDialog(true);
  };

  const handleEditPost = (post: FeedPost) => {
    setEditingPost(post);
    setShowPostDialog(true);
  };

  const handleDeletePost = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deleteFeedPost(id);
      } catch (err) {
        console.error('Failed to delete post:', err);
      }
    }
  };

  const handleSavePost = async (postData: Partial<FeedPost>) => {
    try {
      await saveFeedPost(postData);
      setShowPostDialog(false);
      setEditingPost(null);
    } catch (err) {
      console.error('Failed to save post:', err);
    }
  };

  const getPostTypeBadge = (type: FeedPost['type']) => {
    return type === 'announcement' ? (
      <IOSBadge variant="warning">Announcement</IOSBadge>
    ) : (
      <IOSBadge variant="primary">Post</IOSBadge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <IOSCard key={i} className="p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="h-4 bg-black-secondary rounded mb-2"></div>
                <div className="h-3 bg-black-secondary rounded w-1/3"></div>
              </div>
              <div className="h-6 bg-black-secondary rounded w-20"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-black-secondary rounded"></div>
              <div className="h-3 bg-black-secondary rounded w-3/4"></div>
            </div>
          </IOSCard>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <IOSCard className="p-6 text-center">
        <div className="text-ios-destructive mb-4">
          <MessageSquare className="w-12 h-12 mx-auto mb-2" />
          <p className="font-medium">Failed to load feed posts</p>
          <p className="text-sm text-gray-200">{error}</p>
        </div>
      </IOSCard>
    );
  }

  const handleShare = async (post: FeedPost) => {
    const shareData = {
  title: 'Feed Post',
  text: post.content?.substring(0, 120) || 'Check out this post',
  url: `${window.location.origin}/feed/${post.id}`
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
      }
      setSharedPostId(post.id);
      setTimeout(() => setSharedPostId(null), 2500);
    } catch (e) {
      console.error('Share failed', e);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Feed Management</h2>
        <IOSButton
          variant="primary"
          size="medium"
          onClick={handleAddPost}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Post
        </IOSButton>
      </div>

      {/* Posts List */}
      {feedPosts.length === 0 ? (
        <IOSCard className="p-8 text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-200" />
          <h3 className="text-lg font-medium text-white mb-2">No posts found</h3>
          <p className="text-gray-200 mb-4">Start by creating your first feed post</p>
          <IOSButton variant="primary" onClick={handleAddPost}>
            Add Post
          </IOSButton>
        </IOSCard>
      ) : (
  <div className="space-y-4">
          {feedPosts.map((post) => (
            <IOSCard key={post.id} className="p-6 hover:shadow-lg transition-all duration-200">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-ios-primary text-white rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{post.author_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-200">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getPostTypeBadge(post.type)}
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-white whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>
              </div>

              {/* Post Actions */}
              <div className="flex gap-2 pt-4 border-t border-ios-separator flex-wrap">
                <IOSButton
                  variant="secondary"
                  size="small"
                  onClick={() => handleEditPost(post)}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </IOSButton>
                <IOSButton
                  variant="destructive"
                  size="small"
                  onClick={() => handleDeletePost(post.id)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </IOSButton>
                <IOSButton
                  variant="secondary"
                  size="small"
                  onClick={() => handleShare(post)}
                  className="flex items-center gap-2"
                >
                  {sharedPostId === post.id ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                  {sharedPostId === post.id ? 'Copied' : 'Share'}
                </IOSButton>
              </div>
            </IOSCard>
          ))}
        </div>
      )}

      {/* Post Dialog */}
      {showPostDialog && (
        <FeedPostDialog
          post={editingPost}
          onSave={handleSavePost}
          onClose={() => {
            setShowPostDialog(false);
            setEditingPost(null);
          }}
        />
      )}
    </div>
  );
};

export default FeedTab;
