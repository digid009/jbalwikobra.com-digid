import React from 'react';
import { SettingsService } from '../services/settingsService';
import { 
  HelpCircle, 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  MessageSquare, 
  ChevronDown, 
  Search, 
  Sparkles,
  User,
  ShoppingBag,
  Heart,
  Settings,
  Zap,
  Star,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { 
  IOSContainer, 
  IOSCard, 
  IOSButton 
} from '../components/ios/IOSDesignSystem';

const faqs = [
  {
    category: 'Akun & Registrasi',
    q: 'Bagaimana cara membuat akun?',
    a: 'Klik tombol "Masuk" di header, lalu pilih "Daftar". Masukkan email, password, dan nomor WhatsApp (opsional). Setelah registrasi, Anda akan mendapat pesan selamat datang jika nomor WhatsApp tersedia.'
  },
  {
    category: 'Pembelian',
    q: 'Bagaimana cara membeli akun game?',
    a: 'Pilih produk dari katalog → Klik "Detail" → Pilih "Beli Sekarang" → Isi form pembelian dengan data lengkap → Klik "Proses Pembayaran" → Bayar melalui invoice Xendit yang dikirim → Detail akun akan dikirim setelah pembayaran terkonfirmasi.'
  },
  {
    category: 'Pembelian',
    q: 'Apa itu sistem rental dan bagaimana cara kerjanya?',
    a: 'Sistem rental memungkinkan Anda menyewa akun untuk durasi tertentu (harian/bulanan). Klik tombol "Sewa" pada produk, pilih durasi yang diinginkan, dan lakukan pembayaran. Akun akan dikembalikan otomatis setelah masa sewa berakhir.'
  },
  {
    category: 'Pembayaran',
    q: 'Metode pembayaran apa saja yang tersedia?',
    a: 'Pembayaran diproses melalui Xendit dengan opsi: Transfer Bank (BCA, BNI, BRI, Mandiri, dll), E-Wallet (OVO, DANA, GoPay, LinkAja), Virtual Account, QRIS, dan Kartu Kredit/Debit. Pilih metode yang sesuai saat checkout.'
  },
  {
    category: 'Pembayaran',
    q: 'Berapa lama proses konfirmasi pembayaran?',
    a: 'Pembayaran otomatis terkonfirmasi melalui webhook Xendit. Transfer bank biasanya 1-15 menit, e-wallet instan, virtual account 1-5 menit. Status pesanan akan diupdate otomatis di halaman "Riwayat Order".'
  },
  {
    category: 'Keamanan',
    q: 'Apakah data saya aman?',
    a: 'Ya, sangat aman. Kami menggunakan: Row Level Security (RLS) pada database, enkripsi data sensitif, pembayaran melalui Xendit (PCI DSS compliant), dan tidak menyimpan data kartu kredit. Semua transaksi dimonitor 24/7.'
  },
  {
    category: 'Keamanan',
    q: 'Bagaimana jika akun yang dibeli bermasalah?',
    a: 'Kami memberikan garansi untuk semua akun. Jika ada masalah (akun tidak bisa login, data tidak sesuai, dll), hubungi admin dengan bukti pembelian. Tim support akan membantu troubleshoot atau memberikan replacement sesuai kebijakan.'
  },
  {
    category: 'Fitur',
    q: 'Bagaimana cara menggunakan wishlist?',
    a: 'Klik ikon ❤️ pada produk untuk menambah ke wishlist. Akses wishlist melalui navigasi atau profile dashboard. Wishlist tersimpan otomatis dan tersinkron dengan akun Anda. Anda akan mendapat notifikasi jika ada flash sale untuk item wishlist.'
  },
  {
    category: 'Fitur',
    q: 'Apa itu Flash Sale dan bagaimana cara mengikutinya?',
    a: 'Flash Sale adalah diskon terbatas waktu dengan stok terbatas. Akses melalui menu "Flash Sale" atau notifikasi. Timer countdown menunjukkan sisa waktu. Tips: Tambahkan item ke wishlist untuk notifikasi flash sale otomatis.'
  },
  {
    category: 'Bantuan',
    q: 'Bagaimana cara menghubungi customer service?',
    a: 'Customer service tersedia melalui: WhatsApp (respon tercepat, 09:00-21:00 WIB), Email support, atau chat admin melalui tombol bantuan. Untuk masalah urgent, gunakan WhatsApp dengan menyertakan nomor order.'
  }
];

const guides = [
  {
    title: 'Panduan Pembelian Pertama',
    steps: [
      'Daftar akun dengan email valid',
      'Verifikasi nomor WhatsApp (opsional)',
      'Browse katalog produk',
      'Pilih produk dan baca deskripsi',
      'Klik "Beli Sekarang"',
      'Isi data pembeli dengan lengkap',
      'Pilih metode pembayaran',
      'Selesaikan pembayaran dalam 24 jam',
      'Tunggu konfirmasi dan pengiriman akun'
    ]
  },
  {
    title: 'Tips Berbelanja Aman',
    steps: [
      'Selalu login dengan akun resmi',
      'Periksa detail produk dan harga',
      'Gunakan metode pembayaran resmi',
      'Simpan bukti pembayaran',
      'Jangan share data akun dengan orang lain',
      'Update password secara berkala',
      'Hubungi admin jika ada yang mencurigakan'
    ]
  }
];

const HelpPage: React.FC = () => {
  const [open, setOpen] = React.useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('Semua');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [whatsappNumber, setWhatsappNumber] = React.useState<string>(process.env.REACT_APP_WHATSAPP_NUMBER || '6281234567890');
  
  React.useEffect(() => {
    (async () => {
      try {
        const s = await SettingsService.get();
        if (s?.whatsappNumber) setWhatsappNumber(s.whatsappNumber);
      } catch (_e) {
        // ignore settings fetch error in help page
      }
    })();
  }, []);

  const categories = ['Semua', ...Array.from(new Set(faqs.map(faq => faq.category)))];
  
  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'Semua' || faq.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-ios-background">
      {/* Hero */}
      <div className="bg-gradient-to-r from-ios-accent/10 to-ios-accent/5 border-b border-ios-border">
        <IOSContainer maxWidth="lg" className="py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ios-surface border border-ios-border mb-6">
              <HelpCircle className="text-ios-accent w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold text-ios-text mb-4">Pusat Bantuan</h1>
            <p className="text-ios-text-secondary text-lg mb-8 max-w-2xl mx-auto">
              Temukan jawaban untuk pertanyaan umum, panduan lengkap, dan kontak support untuk pengalaman terbaik di JB Alwikobra
            </p>
            <div className="max-w-md mx-auto relative">
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-ios-surface border border-ios-border rounded-xl pl-12 pr-4 py-3 text-ios-text placeholder:text-ios-text-secondary focus:outline-none focus:border-ios-accent focus:ring-2 focus:ring-ios-accent/20" 
                placeholder="Cari: pembelian, pembayaran, keamanan..." 
              />
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-ios-text-secondary" />
            </div>
          </div>
        </IOSContainer>
      </div>

      <IOSContainer className="py-12">

        {/* Quick Topics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
          <IOSCard padding="small" className="text-center hover:border-ios-accent/50 transition-colors cursor-pointer">
            <User className="mx-auto text-ios-accent mb-2" size={24} />
            <p className="text-sm font-medium text-ios-text">Akun</p>
          </IOSCard>
          <IOSCard padding="small" className="text-center hover:border-ios-accent/50 transition-colors cursor-pointer">
            <ShoppingBag className="mx-auto text-ios-accent mb-2" size={24} />
            <p className="text-sm font-medium text-ios-text">Pembelian</p>
          </IOSCard>
          <IOSCard padding="small" className="text-center hover:border-ios-accent/50 transition-colors cursor-pointer">
            <CreditCard className="mx-auto text-ios-accent mb-2" size={24} />
            <p className="text-sm font-medium text-ios-text">Pembayaran</p>
          </IOSCard>
          <IOSCard padding="small" className="text-center hover:border-ios-accent/50 transition-colors cursor-pointer">
            <ShieldCheck className="mx-auto text-ios-accent mb-2" size={24} />
            <p className="text-sm font-medium text-ios-text">Keamanan</p>
          </IOSCard>
          <IOSCard padding="small" className="text-center hover:border-ios-accent/50 transition-colors cursor-pointer">
            <Heart className="mx-auto text-ios-accent mb-2" size={24} />
            <p className="text-sm font-medium text-ios-text">Wishlist</p>
          </IOSCard>
          <IOSCard padding="small" className="text-center hover:border-ios-accent/50 transition-colors cursor-pointer">
            <Zap className="mx-auto text-ios-accent mb-2" size={24} />
            <p className="text-sm font-medium text-ios-text">Flash Sale</p>
          </IOSCard>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <IOSButton
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? 'primary' : 'secondary'}
                size="small"
              >
                {category}
              </IOSButton>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-ios-text mb-6 flex items-center gap-3">
              <MessageSquare className="text-ios-accent" />
              Pertanyaan Umum
            </h2>
            
            <IOSCard className="divide-y divide-ios-border">
              {filteredFaqs.map((item, idx) => (
                <div key={idx} className="p-6">
                  <button
                    onClick={() => setOpen(open === idx ? null : idx)}
                    className="w-full text-left focus:outline-none"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="inline-block px-2 py-1 bg-ios-accent/20 text-ios-accent text-xs rounded-full mb-2">
                          {item.category}
                        </span>
                        <h3 className="font-semibold text-ios-text text-lg">{item.q}</h3>
                      </div>
                      <ChevronDown className={`transition-transform text-ios-accent ${open === idx ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  {open === idx && (
                    <div className="mt-4 text-ios-text-secondary leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </IOSCard>

            {filteredFaqs.length === 0 && (
              <IOSCard padding="large" className="text-center">
                <Search className="mx-auto text-ios-text-secondary mb-4" size={48} />
                <p className="text-ios-text-secondary">Tidak ada FAQ yang cocok dengan pencarian Anda.</p>
                <p className="text-ios-text-secondary text-sm mt-2">Coba gunakan kata kunci lain atau hubungi support.</p>
              </IOSCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <IOSCard padding="large">
              <h3 className="text-xl font-bold text-ios-text mb-4 flex items-center gap-2">
                <MessageSquare className="text-ios-accent" />
                Butuh Bantuan Cepat?
              </h3>
              <p className="text-ios-text-secondary mb-4">
                Tim support kami siap membantu Anda 24/7 melalui WhatsApp.
              </p>
              <a
                href={`https://wa.me/${whatsappNumber}?text=Halo%20admin,%20saya%20butuh%20bantuan%20terkait%20JB%20Alwikobra`}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <IOSButton variant="primary" className="w-full bg-green-600 hover:bg-green-700">
                  <MessageSquare size={18} />
                  Chat WhatsApp Support
                </IOSButton>
              </a>
              <div className="mt-4 space-y-2 text-sm text-ios-text-secondary">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-400" />
                  <span>Respon dalam 5 menit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-400" />
                  <span>Online: 09:00 - 21:00 WIB</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-yellow-400" />
                  <span>Rating 4.9/5 customer satisfaction</span>
                </div>
              </div>
            </IOSCard>

            {/* System Status */}
            <IOSCard padding="large">
              <h3 className="text-lg font-bold text-ios-text mb-4 flex items-center gap-2">
                <Settings className="text-ios-accent" />
                Status Sistem
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-ios-text-secondary">Website</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ios-text-secondary">Pembayaran</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm">Normal</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ios-text-secondary">Database</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm">Optimal</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-ios-text-secondary mt-4">
                Terakhir update: {new Date().toLocaleString('id-ID')}
              </p>
            </IOSCard>
          </div>
        </div>

        {/* Guides Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-ios-text mb-6 flex items-center gap-3">
            <Sparkles className="text-ios-accent" />
            Panduan Lengkap
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {guides.map((guide, idx) => (
              <IOSCard key={idx} padding="large">
                <h3 className="text-xl font-semibold text-ios-text mb-4">{guide.title}</h3>
                <div className="space-y-3">
                  {guide.steps.map((step, stepIdx) => (
                    <div key={stepIdx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-ios-accent text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {stepIdx + 1}
                      </div>
                      <p className="text-ios-text-secondary">{step}</p>
                    </div>
                  ))}
                </div>
              </IOSCard>
            ))}
          </div>
        </div>

        {/* Still Need Help */}
        <div className="mt-12">
          <IOSCard padding="large" className="text-center bg-gradient-to-r from-ios-accent/10 to-ios-accent/5">
            <AlertTriangle className="mx-auto text-yellow-400 mb-4" size={48} />
            <h3 className="text-2xl font-bold text-ios-text mb-4">Masih Belum Menemukan Jawaban?</h3>
            <p className="text-ios-text-secondary mb-6 max-w-2xl mx-auto">
              Tim support kami siap membantu menyelesaikan masalah spesifik Anda. Jangan ragu untuk menghubungi kami kapan saja.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block"
              >
                <IOSButton variant="primary" className="bg-green-600 hover:bg-green-700">
                  WhatsApp Support
                </IOSButton>
              </a>
              <a
                href="mailto:support@jbalwikobra.com"
                className="inline-block"
              >
                <IOSButton variant="primary">
                  Email Support
                </IOSButton>
              </a>
            </div>
          </IOSCard>
        </div>
      </IOSContainer>
    </div>
  );
};

export default HelpPage;
