import React from 'react';

interface Props { description?: string | null; }

const DescriptionSection: React.FC<Props> = ({ description }) => (
  <div className="mt-12 bg-black rounded-xl border border-gray-700 p-6">
    <h2 className="text-2xl font-bold text-white mb-4">Deskripsi Produk</h2>
    <div className="max-w-none">
      <p className="text-white/70 leading-relaxed">{description}</p>
    </div>
  </div>
);

export default DescriptionSection;
