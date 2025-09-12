// Place mocks before component import to ensure they apply before module evaluation
jest.mock('../services/adminService', () => ({
  adminService: {
  getProducts: jest.fn().mockResolvedValue({
      data: [
        {
          id: 'p1',
          name: 'Alpha Product',
          description: 'First product description',
          price: 1000,
          original_price: 1200,
          stock: 5,
          tier_id: 'tier1',
          category: 'tier1',
          game_title: 'game1',
          is_active: true,
          created_at: new Date().toISOString(),
          image: '',
          images: []
        },
        {
          id: 'p2',
          name: 'Beta Product',
          description: 'Second product description',
          price: 2000,
          original_price: 2500,
          stock: 2,
          tier_id: 'tier2',
          category: 'tier2',
          game_title: 'game2',
          is_active: false,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          image: '',
          images: []
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
    getProductById: jest.fn(),
    updateProduct: jest.fn(),
    createProduct: jest.fn(),
    deleteProduct: jest.fn()
  }
}));

jest.mock('../services/supabase', () => {
  const chainResult = { data: [], error: null };
  return {
    supabase: {
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve(chainResult)
          }),
          order: () => Promise.resolve(chainResult)
        })
      })
    }
  };
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdminProductsManagement } from '../pages/admin/components/AdminProductsManagement';

describe('AdminProductsManagement sorting', () => {
  test('announces sort changes via live region', async () => {
    render(<AdminProductsManagement />);
    // find Product header button
  // Wait for table to appear
  await waitFor(() => expect(screen.queryByRole('table')).toBeInTheDocument());
  const productHeader = screen.getAllByRole('button').find(b => /sort by product/i.test(b.getAttribute('aria-label') || ''))!;
    fireEvent.click(productHeader);
    // second click toggles direction
    fireEvent.click(productHeader);
    await waitFor(() => {
      const liveRegion = screen.getByRole('table').parentElement?.querySelector('[aria-live="polite"]');
      expect(liveRegion?.textContent).toMatch(/sorted by/i);
    });
  });
});
