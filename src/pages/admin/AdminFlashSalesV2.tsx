import React, { useEffect, useState, useMemo } from 'react';
import { Product } from '../../types';
import { ProductService } from '../../services/productService';
import { OptimizedProductService } from '../../services/optimizedProductService';
import { IOSContainer, IOSCard, IOSButton, IOSInput, IOSGrid, IOSSectionHeader } from '../../components/ios/IOSDesignSystemV2';
import { useToast } from '../../components/Toast';
import { formatCurrency, parseNumberID } from '../../utils/helpers';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Clock,
  Percent,
  Search,
  Filter,
  Calendar,
  Package,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

type FlashSaleForm = {
  id?: string;
  product_id: string;
  sale_price: number;
  original_price?: number;
  discount_percentage?: number;
  start_time: string;
  end_time: string;
  stock?: number;
  is_active: boolean;
};

const emptyForm: FlashSaleForm = {
  product_id: '',
  sale_price: 0,
  original_price: 0,
  discount_percentage: 0,
  start_time: new Date().toISOString().slice(0, 16),
  end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  stock: 1,
  is_active: true,
};

interface FlashSalesFilters {
  search: string;
  status: 'all' | 'active' | 'inactive' | 'expired' | 'scheduled';
  product: string;
}

const AdminFlashSalesV2: React.FC = () => {
  const { push } = useToast();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FlashSaleForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [filters, setFilters] = useState<FlashSalesFilters>({
    search: '',
    status: 'all',
    product: ''
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsResponse, flashSalesData] = await Promise.all([
        OptimizedProductService.getProductsPaginated({}, { limit: 500 }),
        ProductService.getFlashSales()
      ]);
      setProducts(productsResponse.data);
      setFlashSales(flashSalesData);
    } catch (error) {
      console.error('Error loading data:', error);
      push('Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    
    const activeCount = flashSales.filter(sale => {
      const startTime = new Date(sale.startTime || sale.start_time);
      const endTime = new Date(sale.endTime || sale.end_time);
      return sale.isActive !== false && now >= startTime && now <= endTime;
    }).length;

    const scheduledCount = flashSales.filter(sale => {
      const startTime = new Date(sale.startTime || sale.start_time);
      return sale.isActive !== false && now < startTime;
    }).length;

    const expiredCount = flashSales.filter(sale => {
      const endTime = new Date(sale.endTime || sale.end_time);
      return now > endTime;
    }).length;

    const totalRevenue = flashSales.reduce((acc, sale) => {
      const salePrice = sale.salePrice || sale.sale_price || 0;
      return acc + salePrice;
    }, 0);

    return {
      total: flashSales.length,
      active: activeCount,
      scheduled: scheduledCount,
      expired: expiredCount,
      totalRevenue
    };
  }, [flashSales]);

  // Filter flash sales
  const filteredFlashSales = useMemo(() => {
    let filtered = [...flashSales];
    const now = new Date();

    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(sale => {
        const product = products.find(p => p.id === (sale.productId || sale.product_id));
        return product?.name.toLowerCase().includes(query);
      });
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(sale => {
        const startTime = new Date(sale.startTime || sale.start_time);
        const endTime = new Date(sale.endTime || sale.end_time);
        const isActive = sale.isActive !== false;

        switch (filters.status) {
          case 'active':
            return isActive && now >= startTime && now <= endTime;
          case 'inactive':
            return !isActive;
          case 'expired':
            return now > endTime;
          case 'scheduled':
            return isActive && now < startTime;
          default:
            return true;
        }
      });
    }

    // Product filter
    if (filters.product) {
      filtered = filtered.filter(sale => 
        (sale.productId || sale.product_id) === filters.product
      );
    }

    return filtered;
  }, [flashSales, filters, products]);

  const getStatusInfo = (sale: any) => {
    const now = new Date();
    const startTime = new Date(sale.startTime || sale.start_time);
    const endTime = new Date(sale.endTime || sale.end_time);
    const isActive = sale.isActive !== false;

    if (!isActive) {
      return { status: 'Inactive', color: 'bg-gray-100 text-gray-800', icon: EyeOff };
    } else if (now < startTime) {
      return { status: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: Calendar };
    } else if (now >= startTime && now <= endTime) {
      return { status: 'Active', color: 'bg-green-100 text-green-800', icon: Eye };
    } else {
      return { status: 'Expired', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);
    
    if (validationErrors.length > 0) return;

    try {
      setSaving(true);

      const selectedProduct = products.find(p => p.id === form.product_id);
      if (!selectedProduct) {
        setErrors(['Produk tidak ditemukan']);
        return;
      }

      const payload = {
        product_id: form.product_id,
        sale_price: Number(form.sale_price),
        original_price: form.original_price || selectedProduct.price,
        discount_percentage: form.discount_percentage || calculateDiscount(form.original_price || selectedProduct.price, form.sale_price),
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        stock: form.stock || 1,
        is_active: form.is_active
      };

      if (form.id) {
        await ProductService.updateFlashSale(form.id, payload);
        push('Flash sale berhasil diperbarui', 'success');
      } else {
        await ProductService.createFlashSale(payload);
        push('Flash sale berhasil dibuat', 'success');
      }

      await loadData();
      setShowForm(false);
      setForm(emptyForm);
    } catch (error) {
      console.error('Error saving flash sale:', error);
      push('Gagal menyimpan flash sale', 'error');
    } finally {
      setSaving(false);
    }
  };

  const calculateDiscount = (originalPrice: number, salePrice: number): number => {
    if (!originalPrice || originalPrice === 0) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!form.product_id) errors.push('Produk harus dipilih');
    if (!form.sale_price || form.sale_price <= 0) errors.push('Harga sale harus lebih dari 0');
    if (!form.end_time) errors.push('Waktu berakhir harus diisi');
    
    if (form.original_price && form.original_price <= form.sale_price) {
      errors.push('Harga asli harus lebih besar dari harga sale');
    }
    
    if (form.start_time && form.end_time && new Date(form.start_time) >= new Date(form.end_time)) {
      errors.push('Waktu mulai harus sebelum waktu berakhir');
    }

    return errors;
  };

  const startCreate = () => {
    setForm({
      ...emptyForm,
      start_time: new Date().toISOString().slice(0, 16),
      end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
    });
    setShowForm(true);
    setErrors([]);
  };

  const startEdit = (sale: any) => {
    setForm({
      id: sale.id,
      product_id: sale.productId || sale.product_id,
      sale_price: sale.salePrice || sale.sale_price,
      original_price: sale.originalPrice || sale.original_price,
      discount_percentage: sale.discountPercentage || sale.discount_percentage,
      start_time: new Date(sale.startTime || sale.start_time).toISOString().slice(0, 16),
      end_time: new Date(sale.endTime || sale.end_time).toISOString().slice(0, 16),
      stock: sale.stock || 1,
      is_active: sale.isActive !== false
    });
    setShowForm(true);
    setErrors([]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus flash sale ini?')) return;

    try {
      await ProductService.deleteFlashSale(id);
      await loadData();
      push('Flash sale berhasil dihapus', 'success');
    } catch (error) {
      console.error('Error deleting flash sale:', error);
      push('Gagal menghapus flash sale', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <IOSContainer>
          <div className="py-16 space-y-8">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-white/60">Memuat data flash sales...</p>
            </div>
          </div>
        </IOSContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <IOSContainer className="py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Flash Sales Management</h1>
            <p className="text-white/60">Kelola flash sales untuk produk Anda</p>
          </div>
          <IOSButton
            variant="primary"
            icon={Plus}
            onClick={startCreate}
          >
            Buat Flash Sale
          </IOSButton>
        </div>

        {/* Statistics */}
        <IOSGrid cols={2} gap="md" className="lg:grid-cols-5">
          <IOSCard variant="elevated" className="p-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">{stats.total}</div>
            <div className="text-sm text-white/60">Total</div>
          </IOSCard>
          <IOSCard variant="elevated" className="p-6 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{stats.active}</div>
            <div className="text-sm text-white/60">Aktif</div>
          </IOSCard>
          <IOSCard variant="elevated" className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">{stats.scheduled}</div>
            <div className="text-sm text-white/60">Terjadwal</div>
          </IOSCard>
          <IOSCard variant="elevated" className="p-6 text-center">
            <div className="text-2xl font-bold text-red-400 mb-1">{stats.expired}</div>
            <div className="text-sm text-white/60">Expired</div>
          </IOSCard>
          <IOSCard variant="elevated" className="p-6 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div className="text-sm text-white/60">Total Nilai</div>
          </IOSCard>
        </IOSGrid>

        {/* Filters */}
        <IOSCard variant="elevated" className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-12 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="scheduled">Terjadwal</option>
              <option value="expired">Expired</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={filters.product}
              onChange={(e) => setFilters(prev => ({ ...prev, product: e.target.value }))}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none"
            >
              <option value="">Semua Produk</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        </IOSCard>

        {/* Flash Sales Table */}
        <IOSCard variant="elevated">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Flash Sales ({filteredFlashSales.length})
            </h2>
            
            {filteredFlashSales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/80 font-medium">Produk</th>
                      <th className="text-left py-3 px-4 text-white/80 font-medium">Harga</th>
                      <th className="text-left py-3 px-4 text-white/80 font-medium">Diskon</th>
                      <th className="text-left py-3 px-4 text-white/80 font-medium">Periode</th>
                      <th className="text-left py-3 px-4 text-white/80 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-white/80 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFlashSales.map((sale) => {
                      const product = products.find(p => p.id === (sale.productId || sale.product_id));
                      const statusInfo = getStatusInfo(sale);
                      const discount = calculateDiscount(
                        sale.originalPrice || sale.original_price,
                        sale.salePrice || sale.sale_price
                      );

                      return (
                        <tr key={sale.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4">
                            <div className="text-white font-medium">{product?.name || 'Unknown Product'}</div>
                            <div className="text-white/60 text-sm">Stock: {sale.stock || 0}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white font-medium">
                              {formatCurrency(sale.salePrice || sale.sale_price)}
                            </div>
                            <div className="text-white/60 text-sm line-through">
                              {formatCurrency(sale.originalPrice || sale.original_price)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 text-sm font-medium">
                              {discount}%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white text-sm">
                              {new Date(sale.startTime || sale.start_time).toLocaleDateString('id-ID')}
                            </div>
                            <div className="text-white/60 text-sm">
                              s/d {new Date(sale.endTime || sale.end_time).toLocaleDateString('id-ID')}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium ${statusInfo.color}`}>
                              <statusInfo.icon className="w-3 h-3 mr-1" />
                              {statusInfo.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <IOSButton
                                variant="ghost"
                                size="sm"
                                icon={Edit2}
                                onClick={() => startEdit(sale)}
                              >
                                Edit
                              </IOSButton>
                              <IOSButton
                                variant="destructive"
                                size="sm"
                                icon={Trash2}
                                onClick={() => handleDelete(sale.id)}
                              >
                                Hapus
                              </IOSButton>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Tidak ada flash sale</h3>
                <p className="text-white/60 mb-4">Belum ada flash sale yang dibuat</p>
                <IOSButton variant="primary" onClick={startCreate}>
                  Buat Flash Sale Pertama
                </IOSButton>
              </div>
            )}
          </div>
        </IOSCard>

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <IOSCard variant="elevated" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {form.id ? 'Edit Flash Sale' : 'Buat Flash Sale Baru'}
                </h2>

                {errors.length > 0 && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <h4 className="text-red-400 font-medium mb-2">Error:</h4>
                    <ul className="text-red-300 text-sm space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Product Selection */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Produk *
                    </label>
                    <select
                      value={form.product_id}
                      onChange={(e) => {
                        const productId = e.target.value;
                        const selectedProduct = products.find(p => p.id === productId);
                        setForm(prev => ({
                          ...prev,
                          product_id: productId,
                          original_price: selectedProduct?.price || 0
                        }));
                      }}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none"
                      required
                    >
                      <option value="">Pilih Produk</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {formatCurrency(product.price)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Harga Asli
                      </label>
                      <input
                        type="number"
                        value={form.original_price || ''}
                        onChange={(e) => setForm(prev => ({ ...prev, original_price: Number(e.target.value) }))}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Harga Sale *
                      </label>
                      <input
                        type="number"
                        value={form.sale_price || ''}
                        onChange={(e) => setForm(prev => ({ ...prev, sale_price: Number(e.target.value) }))}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>

                  {/* Time Period */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Waktu Mulai
                      </label>
                      <input
                        type="datetime-local"
                        value={form.start_time}
                        onChange={(e) => setForm(prev => ({ ...prev, start_time: e.target.value }))}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Waktu Berakhir *
                      </label>
                      <input
                        type="datetime-local"
                        value={form.end_time}
                        onChange={(e) => setForm(prev => ({ ...prev, end_time: e.target.value }))}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Stock & Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={form.stock || ''}
                        onChange={(e) => setForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="1"
                        min="1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Status
                      </label>
                      <select
                        value={form.is_active ? 'active' : 'inactive'}
                        onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.value === 'active' }))}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none"
                      >
                        <option value="active">Aktif</option>
                        <option value="inactive">Tidak Aktif</option>
                      </select>
                    </div>
                  </div>

                  {/* Discount Preview */}
                  {form.original_price && form.sale_price && form.original_price > form.sale_price && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <div className="flex items-center gap-2 text-green-400 mb-2">
                        <Percent className="w-5 h-5" />
                        <span className="font-medium">Preview Diskon</span>
                      </div>
                      <div className="text-white">
                        Diskon: <span className="font-bold">{calculateDiscount(form.original_price, form.sale_price)}%</span>
                      </div>
                      <div className="text-white/60 text-sm">
                        Hemat: {formatCurrency(form.original_price - form.sale_price)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 mt-8">
                  <IOSButton
                    variant="secondary"
                    onClick={() => {
                      setShowForm(false);
                      setForm(emptyForm);
                      setErrors([]);
                    }}
                  >
                    Batal
                  </IOSButton>
                  <IOSButton
                    variant="primary"
                    onClick={handleSubmit}
                    loading={saving}
                  >
                    {form.id ? 'Update' : 'Buat'} Flash Sale
                  </IOSButton>
                </div>
              </div>
            </IOSCard>
          </div>
        )}
      </IOSContainer>
    </div>
  );
};

export default AdminFlashSalesV2;
