import React, { useEffect, useState } from 'react';
import { ArrowLeft, BarChart3, CreditCard, DollarSign, Edit, Eye, MessageSquare, Plus, ShoppingCart, Trash2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  isFlashSale?: boolean;
  flashSaleEndTime?: Date;
  stock: number;
  seller?: string;
  createdAt: Date;
};

type Purchase = {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled' | 'failed';
  paymentMethod?: string;
  createdAt: Date;
};

type User = {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  isVerified?: boolean;
  role?: 'user' | 'admin';
  createdAt: Date;
  purchaseHistory: any[];
};

type FeedPost = {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  type: 'post' | 'announcement';
  likes: string[];
  comments: any[];
  createdAt: Date;
};

const StatCard: React.FC<{ label: string; value: string | number; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-ios-surface border border-ios-border rounded-xl p-6 hover:border-ios-accent/30 transition-colors">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-ios-text-secondary mb-2">{label}</div>
        <div className="text-3xl font-bold text-ios-text mb-1">{value}</div>
      </div>
      {icon}
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    title: '', description: '', price: 0, originalPrice: 0, category: '', stock: 1, isFlashSale: false, images: []
  });
  const [newPost, setNewPost] = useState<{ content: string; type: 'post' | 'announcement' }>({ content: '', type: 'post' });
  const navigate = useNavigate();

  useEffect(() => {
    // Mock data load aligned with the reference
    const mockProducts: Product[] = [
      { id: '1', title: 'Mobile Legends Epic Account', description: 'Epic rank account with 50+ heroes and rare skins', price: 150000, originalPrice: 200000, images: ['/api/placeholder/300/200'], category: 'Mobile Legends', isFlashSale: true, flashSaleEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000), stock: 3, seller: 'JB Alwikobra', createdAt: new Date() }
    ];
    const mockPurchases: Purchase[] = [
      { id: '1', userId: 'user1', productId: '1', amount: 150000, status: 'paid', paymentMethod: 'xendit', createdAt: new Date() }
    ];
    const mockUsers: User[] = [
      { id: 'user1', name: 'John Doe', email: 'john@example.com', whatsapp: '08123456789', isVerified: true, role: 'user', createdAt: new Date(), purchaseHistory: [] }
    ];
    setProducts(mockProducts);
    setPurchases(mockPurchases);
    setUsers(mockUsers);
  }, []);

  const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const totalRevenue = purchases.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalProducts = products.length;
  const totalUsers = users.length;
  const totalOrders = purchases.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/')} className="p-2 rounded hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">JB Alwikobra Management Panel</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Revenue" value={formatPrice(totalRevenue)} icon={<DollarSign className="h-8 w-8 text-green-600" />} />
          <StatCard label="Total Produk" value={totalProducts} icon={<ShoppingCart className="h-8 w-8 text-blue-600" />} />
          <StatCard label="Total Users" value={totalUsers} icon={<Users className="h-8 w-8 text-purple-600" />} />
          <StatCard label="Total Orders" value={totalOrders} icon={<BarChart3 className="h-8 w-8 text-orange-600" />} />
        </div>

        {/* Simple Feed preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Manajemen Feed</h2>
            <button className="px-3 py-2 rounded bg-black text-white text-sm flex items-center gap-2" onClick={() => setShowPostDialog(true)}>
              <Plus className="h-4 w-4" /> Buat Post
            </button>
          </div>

          {feedPosts.length === 0 && (
            <div className="text-sm text-gray-500">Belum ada post. Klik "Buat Post" untuk menambah.</div>
          )}

          {feedPosts.map(post => (
            <div key={post.id} className="bg-white border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                <span className={`px-2 py-0.5 rounded text-white ${post.type === 'announcement' ? 'bg-gray-900' : 'bg-gray-300 text-black'}`}>{post.type === 'announcement' ? 'Pengumuman' : 'Post'}</span>
                <span>{post.createdAt.toLocaleDateString('id-ID')}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm">{post.content}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{post.likes.length} likes</span>
                <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" />{post.comments.length} komentar</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post Dialog */}
      {showPostDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl w-full max-w-lg p-4 space-y-3">
            <div className="text-lg font-semibold">Buat Post Baru</div>
            <div className="space-y-2">
              <label className="text-sm">Tipe Post</label>
              <select value={newPost.type} onChange={(e)=> setNewPost(p=> ({...p, type: e.target.value as 'post'|'announcement'}))} className="w-full border rounded px-3 py-2 text-sm">
                <option value="post">Post Biasa</option>
                <option value="announcement">Pengumuman</option>
              </select>
              <label className="text-sm">Konten</label>
              <textarea value={newPost.content} onChange={(e)=> setNewPost(p=> ({...p, content: e.target.value}))} rows={4} className="w-full border rounded px-3 py-2 text-sm" placeholder="Tulis konten post..." />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={()=> setShowPostDialog(false)} className="px-3 py-2 rounded border text-sm">Batal</button>
              <button onClick={()=> {
                if (!newPost.content.trim()) return;
                const post: FeedPost = { id: `post_${Date.now()}`, authorId: 'admin', authorName: 'JB Alwikobra Official', content: newPost.content, type: newPost.type, likes: [], comments: [], createdAt: new Date() };
                setFeedPosts(prev => [post, ...prev]);
                setNewPost({ content: '', type: 'post' });
                setShowPostDialog(false);
              }} className="px-3 py-2 rounded bg-black text-white text-sm">Buat Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
