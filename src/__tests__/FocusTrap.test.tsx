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
        }
      ],
      count: 1,
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

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdminProductsManagement } from '../pages/admin/components/AdminProductsManagement';

const seedProducts = [
  {
    id: 'p1', name: 'Alpha Product', description: 'First', price: 1000, stock: 5,
    category_id: 'cat-a', categoryData: { id: 'cat-a', name: 'Category A' }, is_active: true, created_at: new Date().toISOString()
  }
] as any;

describe('Product form focus trap', () => {
  test('dialog opens with multiple focusable elements and Escape closes it', async () => {
  render(<AdminProductsManagement initialProducts={seedProducts} />);
  fireEvent.click(await screen.findByRole('button', { name: /add product/i }));
  const dialog = await screen.findByRole('dialog');
    const focusables = dialog.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    expect(focusables.length).toBeGreaterThan(5);
  // Dispatch Escape on document to match global listener
  fireEvent.keyDown(document, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
