// Admin Dashboard Hooks
import { useState, useEffect } from 'react';
import { AdminService } from '../services/AdminService';
import { Product, Order, User, FeedPost, DashboardStats } from '../types';

export const useAdminData = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setError(null);
      const data = await AdminService.fetchDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchStats();
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AdminService.fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const saveProduct = async (product: Partial<Product>) => {
    try {
      setError(null);
      const savedProduct = await AdminService.saveProduct(product);
      
      if (product.id) {
        // Update existing product
        setProducts(prev => prev.map(p => p.id === product.id ? savedProduct : p));
      } else {
        // Add new product
        setProducts(prev => [savedProduct, ...prev]);
      }
      
      return savedProduct;
    } catch (err) {
      console.error('Failed to save product:', err);
      setError('Failed to save product');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      setError(null);
      await AdminService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete product:', err);
      setError('Failed to delete product');
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    saveProduct,
    deleteProduct
  };
};

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AdminService.fetchOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders
  };
};

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AdminService.fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers
  };
};

export const useFeedPosts = () => {
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AdminService.fetchFeedPosts();
      setFeedPosts(data);
    } catch (err) {
      console.error('Failed to load feed posts:', err);
      setError('Failed to load feed posts');
    } finally {
      setLoading(false);
    }
  };

  const saveFeedPost = async (post: Partial<FeedPost>) => {
    try {
      setError(null);
      const savedPost = await AdminService.saveFeedPost(post);
      
      if (post.id) {
        // Update existing post
        setFeedPosts(prev => prev.map(p => p.id === post.id ? savedPost : p));
      } else {
        // Add new post
        setFeedPosts(prev => [savedPost, ...prev]);
      }
      
      return savedPost;
    } catch (err) {
      console.error('Failed to save feed post:', err);
      setError('Failed to save feed post');
      throw err;
    }
  };

  const deleteFeedPost = async (id: string) => {
    try {
      setError(null);
      await AdminService.deleteFeedPost(id);
      setFeedPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete feed post:', err);
      setError('Failed to delete feed post');
      throw err;
    }
  };

  useEffect(() => {
    fetchFeedPosts();
  }, []);

  return {
    feedPosts,
    loading,
    error,
    refetch: fetchFeedPosts,
    saveFeedPost,
    deleteFeedPost
  };
};
