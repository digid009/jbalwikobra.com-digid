import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, AlertTriangle, Image as ImageIcon, Pin, Calendar, Eye } from 'lucide-react';
// DS primitives and utilities
import { DataPanel } from '../layout/DashboardPrimitives';
import { adminInputBase, adminSelectBase, adminCheckboxBase, cx } from './ui/InputStyles';
import { adminService, type FeedPost } from '../../../services/adminService';
import { uploadFile } from '../../../services/storageService';

// Form data interface
interface FeedFormData {
  title: string;
  content: string;
  type: 'post' | 'announcement';
  image_url?: string;
  is_pinned: boolean;
}

const AdminFeedManagement: React.FC = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'post' | 'announcement'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPost, setEditingPost] = useState<FeedPost | null>(null);
  const [deletingPost, setDeletingPost] = useState<FeedPost | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<FeedFormData>({
    title: '',
    content: '',
    type: 'post',
    image_url: '',
    is_pinned: false
  });

  // Image upload states
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Load posts from API
  useEffect(() => {
    loadPosts();
  }, [currentPage]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const result = await adminService.getFeedPosts(currentPage, 10);
      setPosts(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error loading feed posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = (post.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (post.content?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || post.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Handle image upload
  const handleImageUpload = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(file => uploadFile(file, 'feed'));
    const results = await Promise.all(uploadPromises);
    return results.map(result => result.url).filter(Boolean);
  };

  // Handle create/edit post
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUploading(true);
      
      // Use first uploaded image as image_url
      const imageUrl = uploadedImages.length > 0 ? uploadedImages[0] : formData.image_url;
      
      const postData = {
        ...formData,
        image_url: imageUrl
      };

      if (editingPost) {
        await adminService.updateFeedPost(editingPost.id, postData);
      } else {
        await adminService.createFeedPost(postData);
      }
      
      // Reset form and reload
      setFormData({
        title: '',
        content: '',
        type: 'post',
        image_url: '',
        is_pinned: false
      });
      setUploadedImages([]);
      setShowCreateModal(false);
      setEditingPost(null);
      await loadPosts();
      
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Error saving post. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle edit post
  const handleEdit = (post: FeedPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      content: post.content || '',
      type: post.type,
      image_url: post.image_url || '',
      is_pinned: post.is_pinned
    });
    setUploadedImages(post.image_url ? [post.image_url] : []);
    setShowCreateModal(true);
  };

  // Handle toggle pin
  const handleTogglePin = async (post: FeedPost) => {
    try {
      await adminService.toggleFeedPostPin(post.id);
      await loadPosts();
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingPost) return;
    
    try {
      await adminService.deleteFeedPostPermanent(deletingPost.id);
      setShowDeleteModal(false);
      setDeletingPost(null);
      await loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mr-4"></div>
            <span className="text-gray-400">Loading feed posts...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent">
              Feed Management
            </h1>
            <p className="text-gray-400 mt-1">{`${filteredPosts.length} posts • Modern admin interface`}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-fuchsia-700 transition-all duration-200 shadow-lg hover:shadow-pink-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Post</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="group relative overflow-hidden bg-black border border-gray-800 rounded-2xl p-6 hover:border-pink-500/30 transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search posts by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                typeFilter === 'all' 
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/25' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setTypeFilter('all')}
            >
              All
            </button>
            <button
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                typeFilter === 'post' 
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/25' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setTypeFilter('post')}
            >
              Posts
            </button>
            <button
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                typeFilter === 'announcement' 
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/25' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setTypeFilter('announcement')}
            >
              Announcements
            </button>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="group relative overflow-hidden bg-black border border-gray-800 rounded-2xl p-12 text-center hover:border-pink-500/30 transition-all duration-300">
            <div className="text-gray-400">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-white mb-2">No posts found</p>
              <p className="text-sm">Create your first post to get started</p>
            </div>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="group relative overflow-hidden bg-black border border-gray-800 rounded-2xl p-6 hover:border-pink-500/30 transition-all duration-300 hover:transform hover:scale-[1.02]">
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-fuchsia-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">
                        {post.title || 'Untitled Post'}
                      </h3>
                      {post.is_pinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-lg border border-yellow-500/30">
                          <Pin className="w-3 h-3" />
                          Pinned
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-lg border ${
                        post.type === 'announcement' 
                          ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' 
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {post.type === 'announcement' ? 'Announcement' : 'Post'}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          ❤️ {post.likes_count} likes
                        </span>
                        <span className="flex items-center gap-1">
                          💬 {post.comments_count} comments
                        </span>
                        {post.image_url && (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <ImageIcon className="w-4 h-4" />
                            Has image
                          </span>
                        )}
                      </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleTogglePin(post)}
                    className={`p-2 rounded-lg border transition-all duration-200 ${
                      post.is_pinned 
                        ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30' 
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                    title={post.is_pinned ? 'Unpin post' : 'Pin post'}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(post)}
                    className="p-2 bg-gray-800 border border-gray-700 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-200"
                    title="Edit post"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setDeletingPost(post); setShowDeleteModal(true); }}
                    className="p-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-200"
                    title="Delete post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                </div>
                {post.image_url && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-gray-700">
                    <img 
                      src={post.image_url} 
                      alt="Post image"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          >
            Previous
          </button>
          <span className="text-gray-400 text-sm px-4">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h2>
              <button
                className="p-2 bg-gray-800 border border-gray-700 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-200"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingPost(null);
                  setFormData({
                    title: '',
                    content: '',
                    type: 'post',
                    image_url: '',
                    is_pinned: false
                  });
                  setUploadedImages([]);
                }}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Post Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'post' | 'announcement' })}
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  required
                >
                  <option value="post">Regular Post</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title {formData.type === 'announcement' ? '*' : '(Optional)'}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                  placeholder={formData.type === 'announcement' ? 'Enter announcement title' : 'Enter post title (optional)'}
                  required={formData.type === 'announcement'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 resize-none"
                  placeholder="Enter post content..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Images (Maximum 2)
                </label>
                <div className="space-y-4">
                  {uploadedImages.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {uploadedImages.map((url, idx) => (
                        <div key={idx} className="relative">
                          <img 
                            src={url} 
                            alt={`Upload ${idx + 1}`} 
                            className="w-20 h-20 object-cover rounded-lg border border-gray-700" 
                          />
                          <button
                            type="button"
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== idx))}
                            aria-label="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {uploadedImages.length < 2 && (
                    <div>
                      <input
                        id="feed-images-input"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (!files.length) return;
                          const remaining = Math.max(0, 2 - uploadedImages.length);
                          const toUpload = files.slice(0, remaining);
                          setUploading(true);
                          try {
                            const urls = await handleImageUpload(toUpload);
                            setUploadedImages([...uploadedImages, ...urls]);
                          } catch (error) {
                            console.error('Error uploading images:', error);
                          } finally {
                            setUploading(false);
                          }
                          e.currentTarget.value = '';
                        }}
                        className="hidden"
                      />
                      <label 
                        htmlFor="feed-images-input" 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-200 cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Upload Images
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_pinned}
                    onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-pink-500 focus:ring-pink-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-300">
                    Pin this post (appears at the top)
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
                <button
                  type="button"
                  className="px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700 hover:text-white transition-all duration-200"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingPost(null);
                    setFormData({
                      title: '',
                      content: '',
                      type: 'post',
                      image_url: '',
                      is_pinned: false
                    });
                    setUploadedImages([]);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-fuchsia-700 transition-all duration-200 shadow-lg hover:shadow-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                      Saving...
                    </>
                  ) : (
                    editingPost ? 'Update Post' : 'Create Post'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Delete Post?</h2>
              <p className="text-gray-400 mb-8">
                Post "{deletingPost.title || 'Untitled'}" will be permanently deleted and cannot be recovered.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  className="px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700 hover:text-white transition-all duration-200"
                  onClick={() => { setShowDeleteModal(false); setDeletingPost(null); }}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-red-500/25"
                  onClick={handleDelete}
                >
                  Delete Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminFeedManagement;
