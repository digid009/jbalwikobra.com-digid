import React, { useState, useEffect, useMemo } from 'react';
import { ProductService } from '../../services/productService';
import { IOSContainer } from '../../components/ios/IOSDesignSystemV2';
import { AdminFlashSalesStats } from '../../components/admin/flash-sales/AdminFlashSalesStats';
import { AdminFlashSalesSearch } from '../../components/admin/flash-sales/AdminFlashSalesSearch';
import { AdminFlashSalesTable } from '../../components/admin/flash-sales/AdminFlashSalesTable';

interface FlashSale {
  id: string;
  product: {
    id: string;
    name: string;
    image?: string;
  };
  original_price: number;
  sale_price: number;
  discount_percentage?: number;
  start_time: string;
  end_time: string;
  stock: number;
  is_active: boolean;
  created_at: string;
}

interface AdminFlashSalesFilters {
  searchQuery: string;
  statusFilter: 'all' | 'active' | 'scheduled' | 'expired' | 'inactive';
  sortBy: 'created_desc' | 'end_time_asc' | 'discount_desc' | 'name_asc';
}

const ModularAdminFlashSalesPage: React.FC = () => {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AdminFlashSalesFilters>({
    searchQuery: '',
    statusFilter: 'all',
    sortBy: 'created_desc'
  });

  // Load flash sales data
  useEffect(() => {
    let mounted = true;

    const fetchFlashSales = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Admin: Fetching flash sales data...');
        const flashSalesData = await ProductService.getFlashSales();
        
        if (mounted) {
          // Transform the data to match our interface
          const transformedData: FlashSale[] = flashSalesData.map(sale => ({
            id: sale.id,
            product: {
              id: sale.product.id,
              name: sale.product.name,
              image: sale.product.image
            },
            original_price: sale.originalPrice,
            sale_price: sale.salePrice,
            discount_percentage: sale.originalPrice > 0 
              ? Math.round(((sale.originalPrice - sale.salePrice) / sale.originalPrice) * 100)
              : 0,
            start_time: sale.startTime,
            end_time: sale.endTime,
            stock: sale.stock || 0,
            is_active: sale.isActive,
            created_at: new Date().toISOString() // Fallback since createdAt might not exist
          }));
          
          console.log(`✅ Admin: Loaded ${transformedData.length} flash sales`);
          setFlashSales(transformedData);
        }
      } catch (err) {
        console.error('❌ Admin: Error fetching flash sales:', err);
        if (mounted) {
          setError('Failed to load flash sales data');
          setFlashSales([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchFlashSales();
    return () => { mounted = false; };
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalFlashSales = flashSales.length;
    const now = new Date();
    
    const activeFlashSales = flashSales.filter(sale => {
      const startTime = new Date(sale.start_time);
      const endTime = new Date(sale.end_time);
      return sale.is_active && now >= startTime && now <= endTime;
    }).length;
    
    // Mock revenue calculation - in real app, get from analytics/orders
    const totalRevenue = flashSales
      .filter(sale => sale.is_active)
      .reduce((acc, sale) => acc + (sale.sale_price * Math.floor(Math.random() * 5 + 1)), 0);
    
    return { totalFlashSales, activeFlashSales, totalRevenue };
  }, [flashSales]);

  // Filter and sort flash sales
  const filteredAndSortedFlashSales = useMemo(() => {
    let filtered = [...flashSales];
    const now = new Date();

    // Apply search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(sale =>
        sale.product.name.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter(sale => {
        const startTime = new Date(sale.start_time);
        const endTime = new Date(sale.end_time);
        
        switch (filters.statusFilter) {
          case 'active':
            return sale.is_active && now >= startTime && now <= endTime;
          case 'scheduled':
            return sale.is_active && now < startTime;
          case 'expired':
            return now > endTime;
          case 'inactive':
            return !sale.is_active;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'created_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'end_time_asc':
          return new Date(a.end_time).getTime() - new Date(b.end_time).getTime();
        case 'discount_desc':
          const discountA = a.discount_percentage || 0;
          const discountB = b.discount_percentage || 0;
          return discountB - discountA;
        case 'name_asc':
          return a.product.name.localeCompare(b.product.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [flashSales, filters]);

  // Handlers
  const handleCreateNew = () => {
    console.log('📝 Create new flash sale clicked');
    // TODO: Open create modal or navigate to create page
  };

  const handleEdit = (flashSale: FlashSale) => {
    console.log('✏️ Edit flash sale:', flashSale.product.name);
    // TODO: Open edit modal with flashSale data
  };

  const handleDelete = async (id: string) => {
    const sale = flashSales.find(s => s.id === id);
    if (!window.confirm(`Hapus flash sale "${sale?.product.name}"?`)) {
      return;
    }
    
    try {
      console.log('🗑️ Deleting flash sale:', id);
      // TODO: Implement actual delete via API
      setFlashSales(prev => prev.filter(sale => sale.id !== id));
    } catch (err) {
      console.error('Error deleting flash sale:', err);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      console.log('🔄 Toggling flash sale status:', id, 'new status:', !currentStatus);
      // TODO: Implement actual API call
      setFlashSales(prev => prev.map(sale => 
        sale.id === id ? { ...sale, is_active: !currentStatus } : sale
      ));
    } catch (err) {
      console.error('Error updating flash sale status:', err);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Flash Sales</h2>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="relative py-8">
        <IOSContainer>
          {/* Stats Section */}
          <AdminFlashSalesStats
            totalFlashSales={stats.totalFlashSales}
            activeFlashSales={stats.activeFlashSales}
            totalRevenue={stats.totalRevenue}
            onCreateNew={handleCreateNew}
          />
          
          {/* Search and Filter Section */}
          <AdminFlashSalesSearch
            filters={filters}
            onFiltersChange={setFilters}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
          />
          
          {/* Flash Sales Table */}
          <AdminFlashSalesTable
            flashSales={filteredAndSortedFlashSales}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        </IOSContainer>
      </div>
    </div>
  );
};

export default ModularAdminFlashSalesPage;
