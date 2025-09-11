import React, { useEffect, useState } from 'react';

const StatCard: React.FC<{ label: string; value: string; hint?: string }> = ({ label, value, hint }) => (
  <div className="bg-ios-surface border border-ios-border rounded-xl p-6 hover:border-ios-accent/30 transition-colors">
    <div className="text-sm font-medium text-ios-text-secondary mb-2">{label}</div>
    <div className="text-3xl font-bold text-ios-text mb-1">{value}</div>
    {hint && <div className="text-xs text-ios-text-secondary">{hint}</div>}
  </div>
);

const AdminDashboard: React.FC = () => {
  const [counts, setCounts] = useState({ products: 0, flash: 0, orders7: 0, revenue7: 0 });
  useEffect(()=>{
    (async()=>{
      try {
        // Fetch dashboard data from consolidated admin API endpoint
        const response = await fetch('/api/admin?action=dashboard');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch dashboard data');
        }
        
        const data = result.data;
        setCounts({ 
          products: data.products, 
          flash: data.flashSales, 
          orders7: data.orders7days, 
          revenue7: data.revenue7days 
        });
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        // Set default values on error
        setCounts({ products: 0, flash: 0, orders7: 0, revenue7: 0 });
      }
    })();
  }, []);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-ios-text">Dashboard</h1>
        <p className="text-ios-text-secondary mt-2">Ringkasan performa toko Anda hari ini</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard label="Produk Aktif" value={String(counts.products)} hint="Termasuk flash sale" />
        <StatCard label="Flash Sale Aktif" value={String(counts.flash)} hint="Berakhir >= sekarang" />
        <StatCard label="Pesanan 7 Hari" value={String(counts.orders7)} />
        <StatCard label="Pendapatan 7 Hari" value={`Rp ${counts.revenue7.toLocaleString('id-ID')}`} />
      </div>
    </div>
  );
};

export default AdminDashboard;
