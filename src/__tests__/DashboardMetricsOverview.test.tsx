// Mock before importing component for consistency
jest.mock('../services/adminService', () => ({
  adminService: {
    getDashboardStats: jest.fn().mockResolvedValue({
      totalOrders: 10,
      totalRevenue: 500000,
      totalUsers: 3,
      totalProducts: 7,
      totalReviews: 4,
      averageRating: 4.5,
      pendingOrders: 2,
      completedOrders: 8
    })
  }
}));

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DashboardMetricsOverview } from '../pages/admin/components/DashboardMetricsOverview';

describe('DashboardMetricsOverview', () => {
  test('renders metrics after load', async () => {
    render(<DashboardMetricsOverview />);
    expect(screen.getByText(/overview/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Total Revenue/i)).toBeInTheDocument());
    expect(screen.getByText(/Rp/)).toBeInTheDocument();
  });
  test('refresh button triggers reload', async () => {
    render(<DashboardMetricsOverview />);
    const btn = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(btn);
    await waitFor(() => expect(btn).toBeEnabled());
  });
});
