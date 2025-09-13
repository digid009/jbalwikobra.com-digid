import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, X, AlertTriangle, Pin, PinOff, Image as ImageIcon } from 'lucide-react';
import { 
  IOSCard, 
  IOSButton, 
  IOSSectionHeader,
  IOSInputField
} from '../../../components/ios/IOSDesignSystemV2';
import { IOSImageUploader } from '../../../components/ios/IOSImageUploader';
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
        <IOSSectionHeader
          title="Manajemen Feed Posts"
          subtitle="Loading..."
        />
        <IOSCard padding="md">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        </IOSCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 min-h-screen">
      <IOSSectionHeader
        title="Manajemen Feed Posts"
        subtitle={`${filteredPosts.length} posts total`}
      />

      {/* Search and Filters */}
      <IOSCard padding="md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <IOSInputField
              type="text"
              placeholder="Cari berdasarkan judul atau konten..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leadingIcon={<Search className="w-5 h-5 text-zinc-500" />}
            />
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'post' | 'announcement')}
              className="w-full px-4 py-3 bg-zinc-900/60 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
            >
              <option value="all">Semua Tipe</option>
              <option value="post">Post</option>
              <option value="announcement">Pengumuman</option>
            </select>
          </div>
          <div>
            <IOSButton 
              onClick={() => setShowCreateModal(true)} 
              className="w-full"
            >
              <Plus size={18} />
              Buat Post Baru
            </IOSButton>
          </div>
        </div>
      </IOSCard>

      {/* Posts Table */}
      <IOSCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium text-zinc-400">Judul</th>
                <th className="px-6 py-4 font-medium text-zinc-400">Tipe</th>
                <th className="px-6 py-4 font-medium text-zinc-400">Gambar</th>
                <th className="px-6 py-4 font-medium text-zinc-400">Likes</th>
                <th className="px-6 py-4 font-medium text-zinc-400">Comments</th>
                <th className="px-6 py-4 font-medium text-zinc-400">Tanggal</th>
                <th className="px-6 py-4 font-medium text-zinc-400">Pin</th>
                <th className="px-6 py-4 font-medium text-zinc-400">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id} className="border-b border-zinc-800 hover:bg-zinc-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-white">{post.title || 'Untitled'}</div>
                      <div className="text-sm text-zinc-400 mt-1 truncate max-w-xs">
                        {post.content}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      post.type === 'announcement'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {post.type === 'announcement' ? 'Pengumuman' : 'Post'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {post.image_url ? (
                      <div className="flex items-center gap-1 text-emerald-400">
                        <ImageIcon size={16} />
                        <span>Ada</span>
                      </div>
                    ) : (
                      <span className="text-zinc-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{post.likes_count}</td>
                  <td className="px-6 py-4 text-zinc-300">{post.comments_count}</td>
                  <td className="px-6 py-4 text-zinc-300">
                    {new Date(post.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleTogglePin(post)}
                      className={`p-2 rounded-lg transition-colors ${
                        post.is_pinned
                          ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20'
                          : 'text-zinc-500 hover:text-yellow-400 hover:bg-yellow-500/20'
                      }`}
                    >
                      {post.is_pinned ? <Pin size={16} /> : <PinOff size={16} />}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(post)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingPost(post);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
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
            <IOSButton onClick={() => setShowCreateModal(true)} variant="secondary">
              Buat Post Pertama
            </IOSButton>
          </div>
        )}
      </IOSCard>

      {/* Pagination */}
      {totalPages > 1 && (
        <IOSCard padding="md">
          <div className="flex justify-between items-center">
            <IOSButton
              variant="secondary"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </IOSButton>
            <span className="text-zinc-400">
              Page {currentPage} of {totalPages}
            </span>
            <IOSButton
              variant="secondary"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </IOSButton>
          </div>
        </IOSCard>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <IOSCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingPost ? 'Edit Post' : 'Buat Post Baru'}
              </h2>
              <IOSButton
                variant="ghost"
                size="sm"
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
                className="p-2"
              >
                <X size={20} />
              </IOSButton>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Tipe Post *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'post' | 'announcement' })}
                  className="w-full px-4 py-3 bg-zinc-900/60 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
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
                <IOSInputField
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  className="w-full px-4 py-3 bg-zinc-900/60 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none transition-colors"
                  placeholder="Masukkan konten post"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Gambar (Maksimal 2)
                </label>
                <IOSImageUploader
                  images={uploadedImages}
                  onChange={setUploadedImages}
                  onUpload={handleImageUpload}
                  max={2}
                  label="Post Images"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_pinned"
                  checked={formData.is_pinned}
                  onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                  className="w-4 h-4 text-pink-500 bg-zinc-900 border-zinc-700 rounded focus:ring-pink-500 focus:ring-2"
                />
                <label htmlFor="is_pinned" className="text-sm text-zinc-400">
                  Pin post di atas (akan muncul lebih dulu)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <IOSButton
                  type="button"
                  variant="secondary"
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
                </IOSButton>
                <IOSButton type="submit" disabled={uploading}>
                  {uploading ? 'Menyimpan...' : (editingPost ? 'Update Post' : 'Buat Post')}
                </IOSButton>
              </div>
            </form>
          </IOSCard>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <IOSCard className="w-full max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Hapus Post?</h2>
              <p className="text-zinc-400 mb-6">
                Post "{deletingPost.title || 'Untitled'}" akan dihapus permanen dan tidak dapat dikembalikan.
              </p>
              <div className="flex justify-center gap-3">
                <IOSButton
                  variant="secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingPost(null);
                  }}
                >
                  Batal
                </IOSButton>
                <IOSButton
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Hapus
                </IOSButton>
              </div>
            </div>
          </IOSCard>
        </div>
      )}
    </div>
  );
};

export default AdminFeedManagement;
