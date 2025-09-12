// Order mocks before importing component to ensure intercepted module evaluation
jest.mock('../services/adminService', () => ({
  adminService: { 
    getProducts: jest.fn().mockResolvedValue({ 
      data: [], 
      count: 0, 
      page: 1, 
      totalPages: 0 
    }) 
  }
}));

jest.mock('../services/supabase', () => ({
  supabase: { from: () => ({ select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }), order: () => Promise.resolve({ data: [], error: null }) }) }) }
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdminProductsManagement } from '../pages/admin/components/AdminProductsManagement';

describe('Product form focus trap', () => {
  test('dialog opens with multiple focusable elements and Escape closes it', async () => {
    render(<AdminProductsManagement />);
    fireEvent.click(screen.getByRole('button', { name: /add product/i }));
    const dialog = await screen.findByRole('dialog');
    const focusables = dialog.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    expect(focusables.length).toBeGreaterThan(5);
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
