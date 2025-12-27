/**
 * ProductsHero - Hero section component for products page
 * Features gradient background and product catalog branding
 */

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { IOSHero } from '../ios/IOSDesignSystem';

export const ProductsHero = React.memo(() => {
  return (
    <IOSHero
      title="Katalog Produk"
      subtitle="Temukan akun game impian Anda dengan koleksi lengkap dari berbagai game populer"
      icon={ShoppingBag}
      backgroundGradient="from-blue-500 via-purple-500 to-pink-500"
    />
  );
});

ProductsHero.displayName = 'ProductsHero';
