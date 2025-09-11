import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Package as PackageIcon, Plus } from 'lucide-react';
import { adminService, Product } from '../../../services/adminService';
import { IOSCard, IOSButton, IOSSectionHeader } from '../../../components/ios/IOSDesignSystem';
import { RLSDiagnosticsBanner } from '../../../components/ios/RLSDiagnosticsBanner';
import { cn } from '../../../styles/standardClasses';

export const AdminProductsManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    loadProducts();
  }, [currentPage]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const result = await adminService.getProducts(currentPage, itemsPerPage, searchTerm);
      setProducts(result.data);
      setTotalCount(result.count);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 bg-ios-background min-h-screen">
      <RLSDiagnosticsBanner 
        hasErrors={false}
        errorMessage={''}
        statsLoaded={!loading}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <IOSSectionHeader
          title="Products Management"
          subtitle="Manage your product catalog"
        />
        <div className="flex items-center space-x-2">
          <IOSButton onClick={loadProducts} className="flex items-center space-x-2" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </IOSButton>
          <IOSButton variant="primary" className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </IOSButton>
        </div>
      </div>

      <IOSCard>
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ios-text/40" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-ios-text/20 rounded-lg focus:ring-2 focus:ring-ios-primary focus:border-transparent"
            />
          </div>
        </div>
      </IOSCard>

      <IOSCard variant="elevated" padding="none">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-ios-accent" />
              <p className="text-ios-text-secondary font-medium">Loading products...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <table className="w-full">
              <thead className={cn(
                'bg-ios-surface border-b border-ios-border'
              )}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-ios-text-secondary uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ios-text/70 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ios-text/70 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ios-text/70 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ios-text/70 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-ios-text-secondary uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ios-border">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-ios-surface transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-ios-text/10 rounded-lg flex items-center justify-center">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <PackageIcon className="w-5 h-5 text-ios-text/60" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-ios-text">{product.name}</div>
                          <div className="text-sm text-ios-text-secondary">{product.description.substring(0, 50)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-ios-text">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-ios-text">
                        Rp {product.price.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${product.stock > 0 ? 'text-ios-success' : 'text-ios-danger'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.is_active 
                          ? 'bg-ios-success/10 text-ios-success border border-ios-success/20' 
                          : 'bg-ios-error/10 text-ios-error border border-ios-error/20'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-ios-text-secondary">
                        {new Date(product.created_at).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-ios-surface/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <PackageIcon className="w-8 h-8 text-ios-text-secondary" />
              </div>
              <p className="text-ios-text-secondary font-medium">No products found</p>
            </div>
          )}
        </div>
      </IOSCard>
    </div>
  );
};
