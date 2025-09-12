import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, MessageSquare, Plus, Eye, Edit, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { adminService, FeedPost, PaginatedResponse } from '../../../services/adminService';
import { IOSCard, IOSButton, IOSSectionHeader, IOSPagination } from '../../../components/ios/IOSDesignSystem';
import { RLSDiagnosticsBanner } from '../../../components/ios/RLSDiagnosticsBanner';
import { cn } from '../../../styles/standardClasses';

export const AdminFeedManagement: React.FC = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadFeedPosts();
  }, []);

  const loadFeedPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminService.getFeedPosts(1, 50);
      setPosts(result.data);
    } catch (err) {
      console.error('Error loading feed posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load feed posts');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'video':
        return <span className="text-xs">🎥</span>;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image':
        return 'bg-ios-primary/10 text-ios-primary border-ios-primary/30';
      case 'video':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      default:
        return 'bg-ios-background/50 text-white border-gray-700/30';
    }
  };

  return (
    <div className="space-y-6 p-6 bg-ios-background min-h-screen">
      <RLSDiagnosticsBanner 
        hasErrors={!!error}
        errorMessage={error || ''}
        statsLoaded={!loading}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <IOSSectionHeader
          title="Feed Management"
          subtitle="Manage user feed posts and content"
        />
        <div className="flex items-center space-x-3">
          <IOSButton 
            variant="ghost" 
            onClick={loadFeedPosts}
            className="flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </IOSButton>
          <IOSButton 
            variant="primary" 
            className="flex items-center space-x-2"
            onClick={() => window.location.href = '/admin/posts'}
          >
            <Plus className="w-4 h-4" />
            <span>Add Post</span>
          </IOSButton>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <IOSCard variant="elevated" padding="medium" className="border-ios-error/20 bg-ios-error/5">
          <div className="flex items-center space-x-3 text-ios-error">
            <div className="w-2 h-2 rounded-full bg-ios-error"></div>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </IOSCard>
      )}

      {/* Search */}
      <IOSCard variant="elevated" padding="medium">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
          <input
            type="text"
            placeholder="Search feed posts by title, author, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-ios-background border border-gray-700 rounded-xl 
                       focus:ring-2 focus:ring-ios-primary focus:border-pink-500 
                       transition-colors duration-200 text-white placeholder-ios-text/60"
          />
        </div>
      </IOSCard>

      {/* Feed Posts Table */}
      <IOSCard variant="elevated" padding="none">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-white/60" />
            <p className="text-white/60 font-medium">Loading feed posts...</p>
          </div>
        ) : paginatedPosts.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-ios-background/50 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Post
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Preview
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Engagement
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ios-border/30">
                  {paginatedPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-ios-background/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm font-semibold text-white truncate">
                            {post.title}
                          </div>
                          {post.content && (
                            <div className="text-sm text-white/70 truncate mt-1">
                              {post.content.substring(0, 100)}...
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-white">{post.author_name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-full border ${getTypeColor(post.type)}`}>
                          {getTypeIcon(post.type)}
                          <span>{post.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {post.image ? (
                          <div className="flex items-center space-x-2">
                            <img
                              src={post.image}
                              alt="Post preview"
                              className="w-12 h-12 rounded-2xl object-cover cursor-pointer hover:opacity-80 transition-opacity border border-gray-700/30"
                              onClick={() => setSelectedImage(post.image!)}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <IOSButton
                              variant="ghost"
                              size="small"
                              onClick={() => setSelectedImage(post.image!)}
                              className="p-2"
                            >
                              <Eye className="w-4 h-4 text-white/70" />
                            </IOSButton>
                          </div>
                        ) : (
                          <span className="text-sm text-white/40">No image</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1 text-sm text-white">
                            <span>❤️</span>
                            <span className="font-medium">{post.likes_count}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-white">
                            <span>💬</span>
                            <span className="font-medium">{post.comments_count}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-white/70">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <IOSButton variant="ghost" size="small" className="p-2">
                            <Eye className="w-4 h-4 text-white/70" />
                          </IOSButton>
                          <IOSButton variant="ghost" size="small" className="p-2">
                            <Edit className="w-4 h-4 text-white/70" />
                          </IOSButton>
                          <IOSButton variant="ghost" size="small" className="p-2">
                            <Trash2 className="w-4 h-4 text-ios-error hover:text-ios-error/80" />
                          </IOSButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-700/30 bg-ios-background/50">
                <IOSPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredPosts.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ios-background flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-white/60 font-medium mb-1">No feed posts found</p>
            <p className="text-white/40 text-sm">Try adjusting your search or add your first post</p>
          </div>
        )}
      </IOSCard>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-4xl max-h-4xl p-4">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 text-white bg-ios-background/20 backdrop-blur-md rounded-full p-2 
                         hover:bg-ios-background/30 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Full size preview"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              onClick={() => setSelectedImage(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
