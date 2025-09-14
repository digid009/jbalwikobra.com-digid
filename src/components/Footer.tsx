import React from 'react';

// DEPRECATED COMPONENT
// Footer.tsx sudah tidak digunakan lagi. Gunakan `ModernFooter`.
// File ini dibiarkan dengan placeholder untuk menghindari import lama yang mungkin tertinggal.
// Jika yakin tidak ada referensi sama sekali, file bisa dihapus sepenuhnya.

const Footer: React.FC = () => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[Deprecated] `Footer` lama dipanggil. Gunakan `ModernFooter` sebagai pengganti.');
  }
  return null; // Tidak merender apa pun.
};

export default Footer;
