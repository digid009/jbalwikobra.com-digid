import React, { useEffect, useMemo, useState } from 'react';
import { Product } from '../../types';
import { ProductService } from '../../services/productService';
import { OptimizedProductService } from '../../services/optimizedProductService';
import { formatNumberID, parseNumberID } from '../../utils/helpers';
import { useToast } from '../../components/Toast';
import { Plus, RefreshCw, Edit, Trash2, Eye, Clock, Zap, Package, TrendingUp, CheckCircle, Calendar } from 'lucide-react';
import { 
  AdminPageHeaderV2, 
  AdminStatCard, 
  AdminFilters, 
  AdminDataTable, 
  StatusBadge 
} from './components/ui';
import type { AdminFiltersConfig, TableColumn, TableAction } from './components/ui';

type FSForm = {
  id?: string;
  product_id: string;
  sale_price: number;
  original_price?: number;
  start_time?: string;
  end_time: string;
  stock?: number;
  is_active?: boolean;
};

const emptyFS: FSForm = {
  product_id: '',
  sale_price: 0,
  original_price: 0,
  start_time: '',
  end_time: '',
  stock: 1,
  is_active: true,
};

const AdminFlashSales: React.FC = () => {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FSForm>(emptyFS);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Filter state for our AdminFilters component
  const [filterValues, setFilterValues] = useState<Record<string, any>>({
    search: '',
    status: 'all',
    timeStatus: 'all',
    sortBy: 'end_time',
    sortOrder: 'desc'
  });

  // Filter configuration for our AdminFilters component
  const filtersConfig: AdminFiltersConfig = {
    searchPlaceholder: 'Search flash sales by product name...',
    filters: [
      {
        key: 'status',
        label: 'Status',
        options: [
          { value: 'all', label: 'All Status' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' }
        ]
      },
      {
        key: 'timeStatus',
        label: 'Time Status',
        options: [
          { value: 'all', label: 'All Time' },
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'ongoing', label: 'Ongoing' },
          { value: 'expired', label: 'Expired' }
        ]
      }
    ],
    sortOptions: [
      { value: 'end_time', label: 'End Time' },
      { value: 'start_time', label: 'Start Time' },
      { value: 'sale_price', label: 'Sale Price' },
      { value: 'original_price', label: 'Original Price' }
    ]
  };

  // Filter handling
  const handleFilterChange = (filters: Record<string, any>) => {
    setFilterValues(filters);
  };

  // Helper function to get time status
  const getTimeStatus = (flashSale: any) => {
    const now = new Date();
    const start = new Date(flashSale.start_time || flashSale.startTime);
    const end = new Date(flashSale.end_time || flashSale.endTime);
    
    if (now < start) return 'upcoming';
    if (now > end) return 'expired';
    return 'ongoing';
  };

  // Apply filters to flash sales
  const filteredFlashSales = flashSales.filter(sale => {
    // Search filter
    if (filterValues.search) {
      const searchTerm = filterValues.search.toLowerCase();
      const product = products.find(p => p.id === (sale.product_id || sale.productId));
      if (!product?.name?.toLowerCase().includes(searchTerm)) {
        return false;
      }
    }

    // Status filter
    if (filterValues.status !== 'all') {
      const isActive = sale.is_active ?? sale.isActive;
      if (filterValues.status === 'active' && !isActive) return false;
      if (filterValues.status === 'inactive' && isActive) return false;
    }

    // Time status filter
    if (filterValues.timeStatus !== 'all') {
      const timeStatus = getTimeStatus(sale);
      if (filterValues.timeStatus !== timeStatus) return false;
    }

    return true;
  }).sort((a, b) => {
    const sortBy = filterValues.sortBy;
    const order = filterValues.sortOrder === 'desc' ? -1 : 1;
    
    if (sortBy === 'start_time' || sortBy === 'end_time') {
      const aDate = new Date(a[sortBy] || a[sortBy.replace('_', '')]).getTime();
      const bDate = new Date(b[sortBy] || b[sortBy.replace('_', '')]).getTime();
      return (aDate - bDate) * order;
    }
    
    if (sortBy === 'sale_price' || sortBy === 'original_price') {
      const aValue = Number(a[sortBy] || a[sortBy.replace('_', '')]) || 0;
      const bValue = Number(b[sortBy] || b[sortBy.replace('_', '')]) || 0;
      return (aValue - bValue) * order;
    }
    
    return 0;
  });

  // Statistics calculation
  const stats = {
    total: flashSales.length,
    active: flashSales.filter(sale => sale.is_active ?? sale.isActive).length,
    ongoing: flashSales.filter(sale => getTimeStatus(sale) === 'ongoing').length,
    upcoming: flashSales.filter(sale => getTimeStatus(sale) === 'upcoming').length
  };

  // Table columns configuration
  const columns: TableColumn<any>[] = [
    {
      key: 'product',
      label: 'Product',
      render: (sale) => {
        const product = products.find(p => p.id === (sale.product_id || sale.productId));
        return (
          <div>
            <div className="font-medium text-ds-text">{product?.name || 'Unknown Product'}</div>
            <div className="text-sm text-ds-text-secondary">{product?.gameTitleId || 'N/A'}</div>
          </div>
        );
      }
    },
    {
      key: 'prices',
      label: 'Prices',
      render: (sale) => (
        <div>
          <div className="font-medium text-green-400">
            Rp {(sale.sale_price || sale.salePrice || 0).toLocaleString('id-ID')}
          </div>
          {(sale.original_price || sale.originalPrice) && (
            <div className="text-sm text-ds-text-secondary line-through">
              Rp {(sale.original_price || sale.originalPrice).toLocaleString('id-ID')}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'time',
      label: 'Duration',
      render: (sale) => {
        const start = new Date(sale.start_time || sale.startTime);
        const end = new Date(sale.end_time || sale.endTime);
        const timeStatus = getTimeStatus(sale);
        
        return (
          <div>
            <div className="text-sm text-ds-text">
              {start.toLocaleDateString('id-ID')} - {end.toLocaleDateString('id-ID')}
            </div>
            <StatusBadge
              status={timeStatus === 'ongoing' ? 'active' : timeStatus === 'upcoming' ? 'pending' : 'inactive'}
              customLabel={timeStatus.charAt(0).toUpperCase() + timeStatus.slice(1)}
            />
          </div>
        );
      }
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (sale) => sale.stock || 'N/A'
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (sale) => (
        <StatusBadge
          status={(sale.is_active ?? sale.isActive) ? 'active' : 'inactive'}
        />
      )
    }
  ];

  // Table actions configuration
  const actions: TableAction<any>[] = [
    {
      label: 'View',
      icon: <Eye size={16} />,
      onClick: (sale) => {
        const product = products.find(p => p.id === (sale.product_id || sale.productId));
        push(`Viewing flash sale for: ${product?.name || 'Unknown Product'}`, 'info');
      }
    },
    {
      label: 'Edit',
      icon: <Edit size={16} />,
      onClick: (sale) => {
        startEdit(sale);
      }
    },
    {
      label: 'Delete',
      icon: <Trash2 size={16} />,
      onClick: (sale) => {
        if (confirm(`Are you sure you want to delete this flash sale?`)) {
          remove(sale.id);
        }
      },
      variant: 'danger'
    }
  ];

  useEffect(() => {
    (async () => {
      try {
        const [paginatedResponse, fs] = await Promise.all([
          OptimizedProductService.getProductsPaginated(
            {}, // No filters - get all active products  
            { limit: 500 } // Admin view with large limit
          ),
          ProductService.getFlashSales(),
        ]);
        setProducts(paginatedResponse.data);
        setFlashSales(fs);
      } finally { setLoading(false); }
    })();
  }, []);

  const startCreate = () => {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    // Format for datetime-local (YYYY-MM-DDTHH:MM)
    const fmt = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setForm({
      product_id: '',
      sale_price: 0,
      original_price: 0,
      start_time: fmt(now),
      end_time: fmt(in24h),
      stock: 1,
      is_active: true,
    });
    setShowForm(true);
  };
  const startEdit = (row: any) => {
    setForm({
      id: row.id,
      product_id: row.productId || row.product_id,
      sale_price: row.salePrice || row.sale_price,
      original_price: row.originalPrice || row.original_price,
      start_time: row.startTime || row.start_time,
      end_time: row.endTime || row.end_time,
      stock: row.stock,
      is_active: row.isActive ?? row.is_active,
    });
    setShowForm(true);
  };
  const cancelForm = () => { setForm(emptyFS); setShowForm(false); };

  const remove = async (id: string) => {
    try {
      await ProductService.deleteFlashSale(id);
      push('Flash sale deleted successfully', 'success');
      refresh();
    } catch (error) {
      console.error('Error deleting flash sale:', error);
      push('Failed to delete flash sale', 'error');
    }
  };

  const refresh = async () => {
    const fs = await ProductService.getFlashSales();
    setFlashSales(fs);
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!form.product_id) errs.push('Produk wajib dipilih');
    if (!form.end_time) errs.push('Waktu berakhir wajib diisi');
    if (form.sale_price === undefined || Number(form.sale_price) <= 0) errs.push('Harga sale harus lebih dari 0');
    if (form.original_price && Number(form.original_price) <= Number(form.sale_price)) errs.push('Harga asli harus lebih besar dari harga sale');
    if (form.start_time && form.end_time && new Date(form.start_time) >= new Date(form.end_time)) errs.push('Waktu mulai harus sebelum waktu berakhir');
    return errs;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Compute safe defaults to satisfy DB NOT NULL constraints
      const selected = products.find(p => p.id === form.product_id);
      const computedOriginal = (form.original_price && Number(form.original_price) > 0)
        ? Number(form.original_price)
        : (selected?.originalPrice && Number(selected.originalPrice) > 0)
          ? Number(selected.originalPrice)
          : Number(selected?.price || form.sale_price || 0);

      const computedStart = form.start_time && form.start_time.trim().length > 0
        ? new Date(form.start_time).toISOString()
        : new Date().toISOString();

      const computedEnd = form.end_time ? new Date(form.end_time).toISOString() : '';

      // Re-validate with computed values
      const v = (() => {
        const errs: string[] = [];
        if (!form.product_id) errs.push('Produk wajib dipilih');
        if (!computedEnd) errs.push('Waktu berakhir wajib diisi');
        if (Number(form.sale_price) <= 0) errs.push('Harga sale harus lebih dari 0');
        if (computedOriginal <= Number(form.sale_price)) errs.push('Harga asli harus lebih besar dari harga sale');
        if (new Date(computedStart) >= new Date(computedEnd)) errs.push('Waktu mulai harus sebelum waktu berakhir');
        return errs;
      })();
      setErrors(v);
      if (v.length) { setSaving(false); return; }

      const payload = {
        product_id: form.product_id,
        sale_price: Number(form.sale_price),
        original_price: computedOriginal,
        start_time: computedStart,
        end_time: computedEnd,
        stock: form.stock ?? null,
        is_active: form.is_active ?? true,
      };

      if (form.id) await ProductService.updateFlashSale(form.id, payload);
      else await ProductService.createFlashSale(payload);
      await refresh();
      setShowForm(false);
  push('Flash sale disimpan', 'success');
    } catch (e: any) {
  const msg = e?.message || e?.error?.message || 'Terjadi kesalahan';
  push(`Gagal menyimpan: ${msg}` , 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus flash sale ini?')) return;
  const ok = await ProductService.deleteFlashSale(id);
  if (ok) { await refresh(); push('Flash sale dihapus', 'success'); } else { push('Gagal menghapus', 'error'); }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeaderV2
        title="Flash Sales"
        subtitle="Manage flash sale events and time-limited product discounts"
        icon={Zap}
        actions={[
          {
            key: 'add',
            label: 'Create Flash Sale',
            onClick: startCreate,
            variant: 'primary',
            icon: Plus
          }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminStatCard
          title="Total Flash Sales"
          value={stats.total}
          icon={Zap}
          iconColor="text-blue-400"
          iconBgColor="bg-blue-500/20"
        />
        <AdminStatCard
          title="Active"
          value={stats.active}
          icon={CheckCircle}
          iconColor="text-green-400"
          iconBgColor="bg-green-500/20"
        />
        <AdminStatCard
          title="Ongoing"
          value={stats.ongoing}
          icon={Clock}
          iconColor="text-yellow-400"
          iconBgColor="bg-yellow-500/20"
        />
        <AdminStatCard
          title="Upcoming"
          value={stats.upcoming}
          icon={Calendar}
          iconColor="text-purple-400"
          iconBgColor="bg-purple-500/20"
        />
      </div>

      <AdminFilters
        config={filtersConfig}
        values={filterValues}
        onFiltersChange={handleFilterChange}
        totalItems={flashSales.length}
        filteredItems={filteredFlashSales.length}
  loading={loading}
  defaultCollapsed={true}
      />

      <AdminDataTable
        data={filteredFlashSales}
        columns={columns}
        actions={actions}
        loading={loading}
        emptyMessage="No flash sales found"
      />

      {showForm && (
        <div className="bg-ds-surface border border-ds-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-ds-text mb-4">
            {form.id ? 'Edit Flash Sale' : 'Create Flash Sale'}
          </h3>
          
          {errors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded p-3 mb-4">
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                  Product
                </label>
                <select
                  value={form.product_id}
                  onChange={(e) => {
                    const id = e.target.value;
                    const product = products.find(p => p.id === id);
                    const newOriginal = product ? (product.originalPrice && Number(product.originalPrice) > 0 ? Number(product.originalPrice) : Number(product.price)) : 0;
                    setForm({...form, product_id: id, original_price: newOriginal});
                  }}
                  className="w-full bg-ds-surface border border-ds-border rounded-lg px-3 py-2 text-ds-text"
                >
                  <option value="">-- Select Product --</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                    Sale Price
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.sale_price ? formatNumberID(form.sale_price) : ''}
                    onChange={(e) => setForm({...form, sale_price: parseNumberID(e.target.value)})}
                    placeholder="0"
                    className="w-full bg-ds-surface border border-ds-border rounded-lg px-3 py-2 text-ds-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                    Original Price (Optional)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.original_price ? formatNumberID(form.original_price) : ''}
                    onChange={(e) => setForm({...form, original_price: parseNumberID(e.target.value)})}
                    placeholder="0"
                    className="w-full bg-ds-surface border border-ds-border rounded-lg px-3 py-2 text-ds-text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                    Start Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={form.start_time || ''}
                    max={form.end_time || undefined}
                    onChange={(e) => setForm({...form, start_time: e.target.value})}
                    className="w-full bg-ds-surface border border-ds-border rounded-lg px-3 py-2 text-ds-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    min={form.start_time || undefined}
                    value={form.end_time}
                    onChange={(e) => setForm({...form, end_time: e.target.value})}
                    className="w-full bg-ds-surface border border-ds-border rounded-lg px-3 py-2 text-ds-text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                    Stock (Optional)
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({...form, stock: Number(e.target.value)})}
                    className="w-full bg-ds-surface border border-ds-border rounded-lg px-3 py-2 text-ds-text"
                  />
                </div>
                <div className="flex items-center gap-2 mt-8">
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={!!form.is_active}
                    onChange={(e) => setForm({...form, is_active: e.target.checked})}
                    className="rounded border-ds-border"
                  />
                  <label htmlFor="is_active" className="text-ds-text">
                    Active
                  </label>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-ds-surface-secondary border border-ds-border rounded-lg p-4">
                <h4 className="font-semibold text-ds-text mb-3">Preview</h4>
                <div className="space-y-2 text-sm">
                  <div className="text-ds-text-secondary">
                    Product: <span className="text-ds-text">{products.find(p => p.id === form.product_id)?.name || '-'}</span>
                  </div>
                  <div className="text-ds-text-secondary">
                    Sale Price: <span className="text-green-400">Rp {Number(form.sale_price || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="text-ds-text-secondary">
                    Original Price: <span className="text-ds-text">Rp {Number(form.original_price || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="text-ds-text-secondary">
                    End Time: <span className="text-ds-text">{form.end_time || '-'}</span>
                  </div>
                  <div className="text-ds-text-secondary">
                    Status: <span className={form.is_active ? 'text-green-400' : 'text-gray-400'}>{form.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={cancelForm}
              className="px-4 py-2 rounded-lg border border-ds-border text-ds-text hover:bg-ds-surface-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-ds-primary text-white hover:bg-ds-primary-hover disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFlashSales;
