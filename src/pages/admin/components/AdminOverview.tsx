import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, Users, TrendingUp, DollarSign, Eye } from 'lucide-react';
import { adminService, Product, Order } from '../../../services/adminService';
import { IOSCard, IOSButton, IOSSectionHeader, IOSBadge } from '../../../components/ios/IOSDesignSystem';
import { RLSDiagnosticsBanner } from '../../../components/ios/RLSDiagnosticsBanner';
import { cn } from '../../../styles/standardClasses';
import { formatCurrencyIDR, formatShortDate } from '../../../utils/format';

interface AdminOverviewProps {
  onNavigate: (section: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load stats and recent data in parallel
      const [statsData, productsData, ordersData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getProducts(1, 5),
        adminService.getOrders(1, 5)
      ]);

      setStats(statsData);
      setRecentProducts(productsData.data);
      setRecentOrders(ordersData.data);
    } catch (err) {
      console.error('Error loading overview data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load overview data');
    } finally {
      setLoading(false);
    }
  };

  const getProductStatusColor = (product: Product) => {
    if (!product.is_active) return 'bg-ios-danger/10 text-ios-danger border-ios-danger/20';
    if (product.stock <= 0) return 'bg-ios-warning/10 text-ios-warning border-ios-warning/20';
    if (product.is_flash_sale) return 'bg-pink-500/10 text-pink-500 border-ios-accent/20';
    return 'bg-ios-success/10 text-ios-success border-ios-success/20';
  };

  const getProductStatusText = (product: Product) => {
    if (!product.is_active) return 'Inactive';
    if (product.stock <= 0) return 'Out of Stock';
    if (product.is_flash_sale) return 'Flash Sale';
    return 'Active';
  };

  const statsConfig = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-ios-primary bg-ios-primary/10',
      onClick: () => onNavigate('products')
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-ios-success bg-ios-success/10',
      onClick: () => onNavigate('orders')
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-pink-500 bg-pink-500/10',
      onClick: () => onNavigate('users')
    },
    {
      title: 'Total Revenue',
      value: formatCurrencyIDR(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-ios-warning bg-ios-warning/10',
      onClick: () => onNavigate('analytics')
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6 p-6 bg-ios-background min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-black rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-black rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-black rounded-xl"></div>
        </div>
      </div>
    );
  }

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
          title="Admin Overview"
          subtitle="Monitor your business at a glance"
        />
        <IOSButton 
          onClick={loadOverviewData} 
          disabled={loading}
          className="flex items-center space-x-2"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Refresh</span>
        </IOSButton>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((stat, index) => (
          <IOSCard 
            key={index}
            variant="elevated" 
            padding="medium"
            className="cursor-pointer hover:scale-105 transition-all duration-200"
            onClick={stat.onClick}
          >
            <div className="flex items-center space-x-4">
              <div className={cn('p-3 rounded-xl', stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-200">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </IOSCard>
        ))}
      </div>

      {/* Recent Products */}
      <IOSCard variant="elevated" padding="none">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Recent Products</h3>
            <IOSButton 
              variant="ghost" 
              onClick={() => onNavigate('products')}
              className="flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>View All</span>
            </IOSButton>
          </div>
        </div>
        <div className="divide-y divide-ios-border">
          {recentProducts.length > 0 ? (
            recentProducts.map((product) => (
              <div key={product.id} className="p-6 hover:bg-black/50 transition-colors">
                <div className="flex items-center space-x-4">
                  {product.image && (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-12 h-12 rounded-2xl object-cover bg-black"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{product.name}</h4>
                    <p className="text-sm text-gray-200 truncate">{product.game_title || product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{formatCurrencyIDR(product.price)}</p>
                    <IOSBadge 
                      className={cn('text-xs border', getProductStatusColor(product))}
                    >
                      {getProductStatusText(product)}
                    </IOSBadge>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-200" />
              <p className="text-gray-200">No products found</p>
              <IOSButton 
                variant="primary" 
                onClick={() => onNavigate('products')}
                className="mt-4"
              >
                Add First Product
              </IOSButton>
            </div>
          )}
        </div>
      </IOSCard>

      {/* Recent Orders */}
      <IOSCard variant="elevated" padding="none">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
            <IOSButton 
              variant="ghost" 
              onClick={() => onNavigate('orders')}
              className="flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>View All</span>
            </IOSButton>
          </div>
        </div>
        <div className="divide-y divide-ios-border">
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-black/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">{order.customer_name}</h4>
                    <p className="text-sm text-gray-200">{order.product_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{formatCurrencyIDR(order.amount)}</p>
                    <p className="text-xs text-gray-200">{formatShortDate(order.created_at)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-200" />
              <p className="text-gray-200">No orders yet</p>
              <p className="text-sm text-gray-200 mt-2">
                Orders will appear here once customers start purchasing
              </p>
            </div>
          )}
        </div>
      </IOSCard>
    </div>
  );
};
