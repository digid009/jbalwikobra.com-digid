// Admin Routes with proper URL navigation
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/orders" element={<AdminDashboard />} />
      <Route path="/users" element={<AdminDashboard />} />
      <Route path="/products" element={<AdminDashboard />} />
      <Route path="/feed" element={<AdminDashboard />} />
      <Route path="/banners" element={<AdminDashboard />} />
      <Route path="/flash-sales" element={<AdminDashboard />} />
      <Route path="/reviews" element={<AdminDashboard />} />
      <Route path="/notifications" element={<AdminDashboard />} />
      <Route path="/settings" element={<AdminDashboard />} />
      {/* Redirect any unknown admin routes to dashboard */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
