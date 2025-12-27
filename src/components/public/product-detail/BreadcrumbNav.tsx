import React from 'react';
import { Link } from 'react-router-dom';

interface Props { productName?: string; onBack?: () => void; }

const BreadcrumbNav: React.FC<Props> = ({ productName, onBack }) => (
  <nav className="flex items-center space-x-2 text-sm text-white/60 mb-6" aria-label="Breadcrumb">
    <Link to="/" className="hover:text-white">Beranda</Link>
    <span>/</span>
    <button onClick={onBack} className="hover:text-white bg-transparent border-0 p-0 text-inherit">Produk</button>
    <span>/</span>
    <span className="text-white" aria-current="page">{productName}</span>
  </nav>
);

export default BreadcrumbNav;
