/**
 * Flash Sales Type Definitions
 * Based on the database schema and CSV data structure
 */

export interface FlashSaleProduct {
  id: string;
  name: string;
  image?: string;
  price: number;
  stock: number;
}

export interface FlashSaleData {
  id: string;
  product_id: string;
  product?: FlashSaleProduct;
  sale_price: number;
  original_price: number;
  discount_percentage: number;
  start_time: string;
  end_time: string;
  stock: number;
  is_active: boolean;
  created_at: string;
}

export interface FlashSaleFormData {
  id?: string;
  product_id: string;
  discount_type: 'percentage' | 'fixed';
  discount_percentage: number;
  discount_amount: number;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  stock?: number;
  is_active?: boolean;
}

export interface FlashSaleStats {
  totalFlashSales: number;
  activeFlashSales: number;
  scheduledFlashSales: number;
  expiredFlashSales: number;
  averageDiscount: number;
}

export interface FlashSaleFilters {
  searchTerm: string;
  statusFilter: 'all' | 'active' | 'scheduled' | 'expired' | 'inactive';
  discountFilter: 'all' | 'low' | 'medium' | 'high' | 'super';
  sortBy: 'created_at' | 'start_time' | 'end_time' | 'discount_percentage';
  sortOrder: 'asc' | 'desc';
}

export type FlashSaleStatus = 'active' | 'scheduled' | 'expired' | 'inactive';

export interface FlashSaleStatusInfo {
  status: string;
  color: string;
  icon: any; // LucideIcon type
  description: string;
}

export interface PaginatedFlashSales {
  data: FlashSaleData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
