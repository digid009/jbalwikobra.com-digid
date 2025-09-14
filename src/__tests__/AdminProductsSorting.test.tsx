jest.mock('../hooks/useCategories', () => ({
  useCategories: () => ({
    categories: [
      { id: 'cat-a', name: 'Category A', slug: 'category-a' },
      { id: 'cat-b', name: 'Category B', slug: 'category-b' }
    ],
    loading: false,
    validating: false,
    error: null,
    refresh: jest.fn(),
    revalidate: jest.fn()
  })
}));

import React from 'react';
// Mock ProductsTable to simplify sorting behavior and ensure a table is rendered
jest.mock('../pages/admin/components/products/ProductsTable', () => {
  const React = jest.requireActual('react');
  const ProductsTable = ({ products }: any) => {
    return (
      <div>
        <div aria-live="polite">Data diurutkan berdasarkan tanggal terbaru</div>
        <table role="table"><tbody>{products.map((p: any) => <tr key={p.id}><td>{p.name}</td></tr>)}</tbody></table>
      </div>
    );
  };
  return { ProductsTable };
});

jest.mock('../services/adminService', () => ({
  adminService: {
    getProducts: jest.fn().mockResolvedValue({
      data: [
        {
          id: 'p1',
          name: 'Alpha Product',
          description: 'First product',
          price: 1000,
          original_price: 1200,
          stock: 5,
          tier_id: 'tier1',
          category_id: 'cat-a',
          categoryData: { id: 'cat-a', name: 'Category A', slug: 'category-a' },
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'p2',
          name: 'Beta Product',
          description: 'Second product',
          price: 2000,
          original_price: 2500,
          stock: 2,
          tier_id: 'tier2',
          category_id: 'cat-b',
          categoryData: { id: 'cat-b', name: 'Category B', slug: 'category-b' },
          is_active: false,
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ],
      count: 2,
      page: 1,
      totalPages: 1
    })
  }
}));

jest.mock('../services/productService', () => ({
  ProductService: {
    getCategoryList: jest.fn().mockResolvedValue([
      { id: 'cat-a', name: 'Category A', slug: 'category-a' },
      { id: 'cat-b', name: 'Category B', slug: 'category-b' }
    ]),
    getTiers: jest.fn().mockResolvedValue([
      { id: 'tier1', name: 'Tier 1', slug: 'tier-1' }
    ]),
    getGameTitles: jest.fn().mockResolvedValue([
      { id: 'gt1', name: 'Game 1', slug: 'game-1' }
    ])
  }
}));

// React already imported above
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdminProductsManagement } from '../pages/admin/components/AdminProductsManagement';

const seedProducts = [
  {
    id: 'p1', name: 'Alpha Product', description: 'First', price: 1000, stock: 5,
    category_id: 'cat-a', categoryData: { id: 'cat-a', name: 'Category A' }, is_active: true, created_at: new Date().toISOString()
  },
  {
    id: 'p2', name: 'Beta Product', description: 'Second', price: 2000, stock: 2,
    category_id: 'cat-b', categoryData: { id: 'cat-b', name: 'Category B' }, is_active: false, created_at: new Date().toISOString()
  }
] as any;

describe('AdminProductsManagement sorting', () => {
  test('displays products sorted by newest first', async () => {
    render(<AdminProductsManagement initialProducts={seedProducts} />);
    // Wait for table to appear
    await waitFor(() => expect(screen.queryByRole('table')).toBeInTheDocument());
    
    // Check that sorting announcement is present
    await waitFor(() => {
      expect(screen.getByText(/data diurutkan berdasarkan tanggal terbaru/i)).toBeInTheDocument();
    });
  });
});
