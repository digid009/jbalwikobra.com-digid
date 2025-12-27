// Basic i18n strings registry (Indonesian default) and helper.
// Lightweight approach: can be extended to support multiple locales later.

export type LocaleKey = keyof typeof strings;
export type NamespaceKey = keyof typeof strings['id'];

export const strings = {
  id: {
    common: {
      addProduct: 'Tambah Produk',
      productsManagement: 'Manajemen Produk',
      manageCatalog: 'Kelola katalog produk dan inventaris',
      loadingProducts: 'Memuat produk...',
      noProducts: 'Belum ada produk',
      noMatchingProducts: 'Tidak ada produk yang sesuai',
      searchPlaceholder: 'Cari produk...',
      filters: 'Filter',
      clearAllFilters: 'Bersihkan Semua Filter',
      itemsPerPage: 'Item per halaman',
      total: 'Total',
      previous: 'Sebelumnya',
      next: 'Berikutnya',
      save: 'Simpan',
      saving: 'Menyimpan...',
      cancel: 'Batal',
      archived: 'Diarsipkan',
      restore: 'Pulihkan',
      archive: 'Arsipkan',
      delete: 'Hapus',
      edit: 'Edit',
      view: 'Lihat',
      createProduct: 'Buat Produk',
      active: 'Aktif',
      inactive: 'Nonaktif'
    },
  }
};

let currentLocale: LocaleKey = 'id';

export function setLocale(locale: LocaleKey) {
  if (strings[locale]) currentLocale = locale;
}

export function t(path: string, fallback?: string): string {
  const parts = path.split('.');
  let node: any = strings[currentLocale];
  for (const p of parts) {
    node = node?.[p];
    if (node == null) return fallback || path;
  }
  if (typeof node === 'string') return node;
  return fallback || path;
}
