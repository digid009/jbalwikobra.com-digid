import React, { useEffect, useState } from 'react';
import { ArrowLeft, BarChart3, CreditCard, DollarSign, Edit, Eye, MessageSquare, Plus, ShoppingCart, Trash2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FloatingNotifications from './FloatingNotifications';

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
  const [tab, setTab] = useState<'products' | 'orders' | 'users' | 'feed'>('products');
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

  const handleImageUpload: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const urls = files.map(f => URL.createObjectURL(f));
    setNewProduct(prev => ({ ...prev, images: [...(prev.images || []), ...urls] }));
  };

  const resetProductForm = () => {
    setNewProduct({ title: '', description: '', price: 0, originalPrice: 0, category: '', stock: 1, isFlashSale: false, images: [] });
    setEditingProduct(null);
    setShowProductDialog(false);
  };

  const handleSaveProduct = () => {
    if (!newProduct.title || !newProduct.description || !newProduct.price || !newProduct.category) return;
    const productData: Product = {
      id: editingProduct?.id || `product_${Date.now()}`,
      title: newProduct.title!,
      description: newProduct.description!,
      price: newProduct.price!,
      originalPrice: newProduct.originalPrice || undefined,
      images: newProduct.images && newProduct.images.length ? newProduct.images : ['/api/placeholder/300/200'],
      category: newProduct.category!,
      isFlashSale: !!newProduct.isFlashSale,
      flashSaleEndTime: newProduct.isFlashSale ? new Date(Date.now() + 24*60*60*1000) : undefined,
      stock: newProduct.stock || 1,
      seller: 'JB Alwikobra',
      createdAt: editingProduct?.createdAt || new Date()
    };
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? productData : p));
    } else {
      setProducts(prev => [productData, ...prev]);
    }
    resetProductForm();
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct(product);
    setShowProductDialog(true);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const totalRevenue = purchases.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalProducts = products.length;
  const totalUsers = users.length;
  const totalOrders = purchases.length;

  return (
    <div className="min-h-screen bg-gray-50">
  {/* Floating Notifications */}
  <FloatingNotifications />
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

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Revenue" value={formatPrice(totalRevenue)} icon={<DollarSign className="h-8 w-8 text-green-600" />} />
          <StatCard label="Total Produk" value={totalProducts} icon={<ShoppingCart className="h-8 w-8 text-blue-600" />} />
          <StatCard label="Total Users" value={totalUsers} icon={<Users className="h-8 w-8 text-purple-600" />} />
          <StatCard label="Total Orders" value={totalOrders} icon={<BarChart3 className="h-8 w-8 text-orange-600" />} />
        </div>

        {/* Tabs */}
        <div className="space-y-4">
          <div className="grid grid-cols-4 rounded-lg border overflow-hidden">
            {(['products','orders','users','feed'] as const).map(key => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`text-sm py-2.5 font-medium border-r last:border-r-0 transition-colors ${
                  tab === key ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'
                }`}
              >
                {key === 'products' && 'Produk'}
                {key === 'orders' && 'Pesanan'}
                {key === 'users' && 'Users'}
                {key === 'feed' && 'Feed'}
              </button>
            ))}
          </div>

          {/* Products Tab */}
          {tab === 'products' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Manajemen Produk</h2>
                <button className="px-3 py-2 rounded bg-black text-white text-sm flex items-center gap-2" onClick={() => setShowProductDialog(true)}>
                  <Plus className="h-4 w-4" /> Tambah Produk
                </button>
              </div>

              <div className="grid gap-4">
                {products.map((product) => (
                  <div key={product.id} className="bg-white border rounded-xl p-4">
                    <div className="flex items-start gap-4">
                      <img src={product.images[0]} alt={product.title} className="w-20 h-20 object-cover rounded" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{product.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="font-bold text-pink-600">{formatPrice(product.price)}</span>
                              {product.originalPrice && (
                                <span className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                              )}
                              <span className="text-xs border rounded px-2 py-0.5">{product.category}</span>
                              {product.isFlashSale && (
                                <span className="text-xs bg-red-500 text-white rounded px-2 py-0.5">Flash Sale</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Stok: {product.stock}</p>
                          </div>
                          <div className="flex gap-2">
                            <button className="px-2 py-2 rounded border" onClick={() => handleEditProduct(product)}>
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="px-2 py-2 rounded border" onClick={() => handleDeleteProduct(product.id)}>
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="text-sm text-gray-500">Belum ada produk.</div>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {tab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Daftar Pesanan</h2>
              <div className="space-y-3">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                    <div>
                      <p className="font-medium">Order #{purchase.id}</p>
                      <p className="text-sm text-gray-600">
                        {formatPrice(purchase.amount)} • {purchase.paymentMethod || '—'}
                      </p>
                      <p className="text-xs text-gray-500">{purchase.createdAt.toLocaleDateString('id-ID')}</p>
                    </div>
                    <div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        purchase.status === 'paid' ? 'bg-green-100 text-green-700' :
                        purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {purchase.status}
                      </span>
                    </div>
                  </div>
                ))}
                {purchases.length === 0 && <div className="text-sm text-gray-500">Belum ada pesanan.</div>}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {tab === 'users' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Daftar Users</h2>
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.whatsapp && <p className="text-sm text-gray-600">{user.whatsapp}</p>}
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded ${user.isVerified ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}>
                        {user.isVerified ? 'Terverifikasi' : 'Belum Verifikasi'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{user.createdAt.toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                ))}
                {users.length === 0 && <div className="text-sm text-gray-500">Belum ada user.</div>}
              </div>
            </div>
          )}

          {/* Feed Tab */}
          {tab === 'feed' && (
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
          )}
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

      {/* Product Dialog */}
      {showProductDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl w-full max-w-2xl p-4 max-h-[80vh] overflow-y-auto">
            <div className="text-lg font-semibold mb-2">{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-sm">Judul Produk *</label>
                <input className="w-full border rounded px-3 py-2 text-sm" value={newProduct.title || ''} onChange={(e)=> setNewProduct(p=> ({...p, title: e.target.value}))} placeholder="Contoh: Mobile Legends Epic Account" />

                <label className="text-sm">Deskripsi *</label>
                <textarea className="w-full border rounded px-3 py-2 text-sm" rows={4} value={newProduct.description || ''} onChange={(e)=> setNewProduct(p=> ({...p, description: e.target.value}))} placeholder="Deskripsi detail produk..." />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm">Harga *</label>
                    <input type="number" className="w-full border rounded px-3 py-2 text-sm" value={newProduct.price || 0} onChange={(e)=> setNewProduct(p=> ({...p, price: Number(e.target.value)}))} />
                  </div>
                  <div>
                    <label className="text-sm">Harga Asli</label>
                    <input type="number" className="w-full border rounded px-3 py-2 text-sm" value={newProduct.originalPrice || 0} onChange={(e)=> setNewProduct(p=> ({...p, originalPrice: Number(e.target.value)}))} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm">Kategori *</label>
                  <select className="w-full border rounded px-3 py-2 text-sm" value={newProduct.category || ''} onChange={(e)=> setNewProduct(p=> ({...p, category: e.target.value}))}>
                    <option value="">Pilih kategori</option>
                    <option>Mobile Legends</option>
                    <option>PUBG Mobile</option>
                    <option>Free Fire</option>
                    <option>Genshin Impact</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm">Stok</label>
                  <input type="number" className="w-full border rounded px-3 py-2 text-sm" value={newProduct.stock || 0} onChange={(e)=> setNewProduct(p=> ({...p, stock: Number(e.target.value)}))} />
                </div>
                <div className="flex items-center gap-2">
                  <input id="flashSale" type="checkbox" checked={!!newProduct.isFlashSale} onChange={(e)=> setNewProduct(p=> ({...p, isFlashSale: e.target.checked}))} />
                  <label htmlFor="flashSale" className="text-sm">Flash Sale</label>
                </div>
                <div>
                  <label className="text-sm">Upload Gambar</label>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="w-full border rounded px-3 py-2 text-sm" />
                  {newProduct.images && newProduct.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {newProduct.images.map((img, idx) => (
                        <img key={idx} src={img} alt={`img-${idx}`} className="w-full h-20 object-cover rounded border" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={resetProductForm} className="px-3 py-2 rounded border text-sm">Batal</button>
              <button onClick={handleSaveProduct} className="px-3 py-2 rounded bg-black text-white text-sm">{editingProduct ? 'Update Produk' : 'Simpan Produk'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
