import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, AlertTriangle, Image as ImageIcon } from 'lucide-react';
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
      <div className="space-y-6 p-6 min-h-screen">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Manajemen Feed Posts</h2>
          <div className="text-sm text-gray-200">Loading...</div>
        </div>
        <DataPanel>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ds-pink"></div>
          </div>
        </DataPanel>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Manajemen Feed Posts</h2>
          <p className="text-sm text-gray-200">{`${filteredPosts.length} posts total`}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <DataPanel>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari berdasarkan judul atau konten..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cx(adminInputBase, 'pl-10 pr-3 py-2 w-full')}
              />
            </div>
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'post' | 'announcement')}
              className={cx(adminSelectBase, 'w-full px-3 py-2')}
            >
              <option value="all">Semua Tipe</option>
              <option value="post">Post</option>
              <option value="announcement">Pengumuman</option>
            </select>
          </div>
          <div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Buat Post Baru
            </button>
          </div>
        </div>
      </DataPanel>

      {/* Posts Table */}
      <DataPanel>
        <div className="overflow-x-auto admin-table-container">
          <table className="admin-table admin-table-sticky zebra compact w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Judul</th>
                <th className="text-left">Tipe</th>
                <th className="text-left">Gambar</th>
                <th className="text-left">Likes</th>
                <th className="text-left">Comments</th>
                <th className="text-left">Tanggal</th>
                <th className="text-left">Pin</th>
                <th className="text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <div>
                      <div className="font-medium text-white">{post.title || 'Untitled'}</div>
                      <div className="text-xs text-white/50 mt-1 truncate max-w-xs">{post.content}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${post.type === 'announcement' ? 'badge-warning' : 'badge-primary'}`}>
                      {post.type === 'announcement' ? 'Pengumuman' : 'Post'}
                    </span>
                  </td>
                  <td>
                    {post.image_url ? (
                      <div className="flex items-center gap-1 text-emerald-400">
                        <ImageIcon size={16} />
                        <span>Ada</span>
                      </div>
                    ) : (
                      <div className="text-white/40 text-sm">Tidak</div>
                    )}
                  </td>
                  <td>
                    <div className="text-sm font-medium text-white/80">{post.likes_count}</div>
                  </td>
                  <td>
                    <div className="text-sm font-medium text-white/80">{post.comments_count}</div>
                  </td>
                  <td>
                    <div className="text-sm text-white/70">{new Date(post.created_at).toLocaleDateString('id-ID')}</div>
                  </td>
                  <td>
                    <button
                      onClick={() => handleTogglePin(post)}
                      className={cx('btn btn-secondary btn-xs', post.is_pinned && 'btn-warning')}
                    >
                      {post.is_pinned ? 'Pinned' : 'Pin'}
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(post)}
                        className="btn btn-secondary btn-xs"
                        aria-label="Edit post"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { setDeletingPost(post); setShowDeleteModal(true); }}
                        className="btn btn-danger btn-xs"
                        aria-label="Delete post"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-zinc-400 mb-2">Tidak ada posts ditemukan</div>
            <button className="btn btn-secondary" onClick={() => setShowCreateModal(true)}>Buat Post Pertama</button>
          </div>
        )}
      </DataPanel>

      {/* Pagination (DS) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-stack-lg border-t border-surface-tint-gray/30">
          <div className="fs-sm text-surface-tint-gray">
            Page {currentPage} of {totalPages}
          </div>
          <nav className="flex items-center gap-cluster-sm" role="navigation" aria-label="Pagination">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="dashboard-data-panel padded rounded-xl p-stack-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingPost ? 'Edit Post' : 'Buat Post Baru'}
              </h2>
              <button
                className="btn btn-ghost btn-sm"
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
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Tipe Post *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'post' | 'announcement' })}
                  className={cx(adminSelectBase, 'w-full px-3 py-2')}
                  required
                >
                  <option value="post">Post</option>
                  <option value="announcement">Pengumuman</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Judul {formData.type === 'announcement' ? '*' : '(Opsional)'}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={cx(adminInputBase, 'px-3 py-2 w-full')}
                  placeholder={formData.type === 'announcement' ? 'Masukkan judul pengumuman' : 'Masukkan judul post (opsional)'}
                  required={formData.type === 'announcement'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Konten *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className={cx(adminInputBase, 'px-3 py-2 w-full resize-none')}
                  placeholder="Masukkan konten post"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Gambar (Maksimal 2)
                </label>
                {/* Minimal DS-styled image picker */}
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {uploadedImages.map((url, idx) => (
                      <div key={idx} className="relative">
                        <img src={url} alt={`uploaded-${idx}`} className="w-20 h-20 object-cover rounded border border-surface-tint-gray/30" />
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 btn btn-ghost btn-xs"
                          onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== idx))}
                          aria-label="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
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
                        const urls = await handleImageUpload(toUpload);
                        setUploadedImages([...uploadedImages, ...urls]);
                        e.currentTarget.value = '';
                      }}
                      className="hidden"
                    />
                    <label htmlFor="feed-images-input" className="btn btn-secondary btn-sm">Upload Images</label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_pinned"
                  checked={formData.is_pinned}
                  onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                  className={cx(adminCheckboxBase, 'w-4 h-4')}
                />
                <label htmlFor="is_pinned" className="text-sm text-zinc-400">
                  Pin post di atas (akan muncul lebih dulu)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="btn btn-secondary"
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
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Menyimpan...' : (editingPost ? 'Update Post' : 'Buat Post')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="dashboard-data-panel padded rounded-xl p-stack-lg w-full max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Hapus Post?</h2>
              <p className="text-zinc-400 mb-6">
                Post "{deletingPost.title || 'Untitled'}" akan dihapus permanen dan tidak dapat dikembalikan.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  className="btn btn-secondary"
                  onClick={() => { setShowDeleteModal(false); setDeletingPost(null); }}
                >
                  Batal
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedManagement;
