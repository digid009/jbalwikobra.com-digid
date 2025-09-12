import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/TraditionalAuthContext';
import { supabase } from '../../services/supabase';
import { enhancedFeedService, type FeedPost } from '../../services/enhancedFeedService';
import { IOSCard, IOSButton, IOSContainer } from '../../components/ios/IOSDesignSystem';
import { Plus, Edit, Trash2, Pin, PinOff, Eye } from 'lucide-react';

const AdminPosts: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'announcement',
    title: '',
    content: '',
    rating: null as number | null,
    image_url: '',
    is_pinned: false
  });

  const loadPosts = async () => {
    try {
      setLoading(true);
      if (!supabase) throw new Error('Supabase not configured');
      
      const { data, error } = await supabase
        .from('feed_posts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const transformedPosts = (data || []).map(post => ({
        ...post,
        authorName: 'Admin',
        counts: {
          likes: post.likes_count || 0,
          comments: post.comments_count || 0
        }
      }));
      
      setPosts(transformedPosts);
    } catch (err: any) {
      console.error('Failed to load posts:', err);
      setMessage(err.message || 'Gagal memuat posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.content.trim()) {
      setMessage('Konten post harus diisi');
      return;
    }
    
    if (!supabase || !user) {
      setMessage('Supabase atau user belum siap');
      return;
    }
    
    setCreating(true);
    setMessage(null);
    
    try {
      const { data, error } = await supabase
        .from('feed_posts')
        .insert([{
          user_id: user.id,
          type: formData.type,
          title: formData.title || null,
          content: formData.content,
          rating: formData.rating,
          image_url: formData.image_url || null,
          is_pinned: formData.is_pinned,
          likes_count: 0,
          comments_count: 0,
          is_deleted: false
        }])
        .select('*')
        .single();
        
      if (error) throw error;
      
      setMessage('Post berhasil dibuat');
      setFormData({
        type: 'announcement',
        title: '',
        content: '',
        rating: null,
        image_url: '',
        is_pinned: false
      });
      setShowCreateForm(false);
      loadPosts(); // Refresh list
    } catch (err: any) {
      console.error('Failed to create post:', err);
      setMessage(err.message || 'Gagal membuat post');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!supabase) return;
    if (!confirm('Yakin ingin menghapus post ini?')) return;
    
    try {
      const { error } = await supabase
        .from('feed_posts')
        .update({ is_deleted: true })
        .eq('id', postId);
        
      if (error) throw error;
      
      setMessage('Post berhasil dihapus');
      loadPosts();
    } catch (err: any) {
      console.error('Failed to delete post:', err);
      setMessage(err.message || 'Gagal menghapus post');
    }
  };

  const togglePin = async (postId: string, currentPinned: boolean) => {
    if (!supabase) return;
    
    try {
      const { error } = await supabase
        .from('feed_posts')
        .update({ is_pinned: !currentPinned })
        .eq('id', postId);
        
      if (error) throw error;
      
      setMessage(`Post ${!currentPinned ? 'dipinned' : 'dipinned'}`);
      loadPosts();
    } catch (err: any) {
      console.error('Failed to toggle pin:', err);
      setMessage(err.message || 'Gagal mengubah pin status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  return (
    <IOSContainer maxWidth="full" className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Feed Management</h1>
        <IOSButton 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          <span>Buat Post Baru</span>
        </IOSButton>
      </div>

      {message && (
        <IOSCard padding="medium" className="mb-4 border-l-4 border-l-ios-accent">
          <p className="text-sm text-white">{message}</p>
        </IOSCard>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <IOSCard padding="large" className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Buat Post Baru</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white-secondary mb-2">
                  Tipe Post
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-700 bg-black text-white rounded-lg focus:ring-2 focus:ring-ios-accent"
                  required
                >
                  <option value="announcement">Pengumuman</option>
                  <option value="review">Review</option>
                  <option value="update">Update</option>
                  <option value="promotion">Promosi</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white-secondary mb-2">
                  Judul (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-700 bg-black text-white rounded-lg focus:ring-2 focus:ring-ios-accent"
                  placeholder="Judul post..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white-secondary mb-2">
                Konten *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-700 bg-black text-white rounded-lg focus:ring-2 focus:ring-ios-accent"
                rows={4}
                placeholder="Tulis konten post..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white-secondary mb-2">
                  URL Gambar (Opsional)
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-700 bg-black text-white rounded-lg focus:ring-2 focus:ring-ios-accent mb-2"
                  placeholder="https://..."
                />
                {/* Image Preview */}
                {formData.image_url && (
                  <div className="mt-2">
                    <img
                      src={formData.image_url}
                      alt="Image preview"
                      className="w-24 h-24 object-cover rounded-lg border border-gray-700"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white-secondary mb-2">
                  Rating (1-5, Opsional)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating || ''}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-700 bg-black text-white rounded-lg focus:ring-2 focus:ring-ios-accent"
                  placeholder="1-5"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_pinned"
                checked={formData.is_pinned}
                onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                className="rounded border-gray-700"
              />
              <label htmlFor="is_pinned" className="text-sm text-white">
                Pin post di atas
              </label>
            </div>

            <div className="flex gap-3">
              <IOSButton type="submit" disabled={creating}>
                {creating ? 'Membuat...' : 'Buat Post'}
              </IOSButton>
              <IOSButton 
                type="button" 
                variant="secondary" 
                onClick={() => setShowCreateForm(false)}
              >
                Batal
              </IOSButton>
            </div>
          </form>
        </IOSCard>
      )}

      {/* Posts List */}
      <IOSCard padding="none">
        <div className="p-4 border-b border-gray-700">
          <h2 className="font-semibold text-white">Semua Feed Posts</h2>
          <p className="text-sm text-white-secondary">
            {posts.filter(p => !p.is_deleted).length} posts aktif
          </p>
        </div>
        
        {loading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-black rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-ios-border">
            {posts.filter(p => !p.is_deleted).map((post) => (
              <div key={post.id} className="p-4 hover:bg-black/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    {/* Image Preview */}
                    {post.image_url && (
                      <div className="flex-shrink-0">
                        <img
                          src={post.image_url}
                          alt={post.title || 'Post image'}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-700"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 bg-pink-500/20 text-pink-500 rounded-full">
                          {post.type}
                        </span>
                        {post.is_pinned && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-1">
                            <Pin size={12} />
                            Pinned
                          </span>
                        )}
                        {post.title && (
                          <span className="font-medium text-white">{post.title}</span>
                        )}
                      </div>
                      
                      <p className="text-sm text-white-secondary mb-2 line-clamp-2">
                        {post.content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-white-secondary">
                        <span>{formatDate(post.created_at)}</span>
                        <span>{post.counts.likes} likes</span>
                        <span>{post.counts.comments} comments</span>
                        {post.rating && <span>⭐ {post.rating}/5</span>}
                        {post.image_url && (
                          <span className="text-pink-400">📷 Has Image</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <IOSButton
                      variant="ghost"
                      size="small"
                      onClick={() => togglePin(post.id, post.is_pinned || false)}
                      className="text-white-secondary hover:text-white"
                    >
                      {post.is_pinned ? <PinOff size={16} /> : <Pin size={16} />}
                    </IOSButton>
                    
                    <IOSButton
                      variant="ghost"
                      size="small"
                      onClick={() => window.open(`/feed`, '_blank')}
                      className="text-white-secondary hover:text-white"
                    >
                      <Eye size={16} />
                    </IOSButton>
                    
                    <IOSButton
                      variant="ghost"
                      size="small"
                      onClick={() => handleDelete(post.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </IOSButton>
                  </div>
                </div>
              </div>
            ))}
            
            {posts.filter(p => !p.is_deleted).length === 0 && (
              <div className="p-8 text-center text-white-secondary">
                <p>Belum ada posts. Buat post pertama!</p>
              </div>
            )}
          </div>
        )}
      </IOSCard>
    </IOSContainer>
  );
};

export default AdminPosts;
