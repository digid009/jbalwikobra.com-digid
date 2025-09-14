import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ProductService } from '../services/productService';
import { SettingsService } from '../services/settingsService';
import { Product, Customer, RentalOption } from '../types';
import {
  formatCurrency, 
  calculateTimeRemaining,
  generateWhatsAppUrl,
  generateRentalMessage,
  generatePurchaseMessage
} from '../utils/helpers';
import {
  Star,
  Clock,
  Shield,
  Zap,
  ChevronLeft,
  Heart,
  Share2,
  MessageCircle,
  CreditCard,
  Calendar,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { createXenditInvoice } from '../services/paymentService';
// Extracted components
import ProductDetailLoadingSkeleton from '../components/public/product-detail/LoadingSkeleton';
import BreadcrumbNav from '../components/public/product-detail/BreadcrumbNav';
import ImageGallery from '../components/public/product-detail/ImageGallery';
import FlashSaleTimer from '../components/public/product-detail/FlashSaleTimer';
import RentalOptions from '../components/public/product-detail/RentalOptions';
import ActionButtons from '../components/public/product-detail/ActionButtons';
import TrustBadges from '../components/public/product-detail/TrustBadges';
import DescriptionSection from '../components/public/product-detail/DescriptionSection';
import CheckoutModal from '../components/public/product-detail/CheckoutModal';
import { getCurrentUserProfile, isLoggedIn, getAuthUserId } from '../services/authService';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../components/Toast';
import { Link } from 'react-router-dom';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const cameFromFlashSaleCard = Boolean((location as any)?.state?.fromFlashSaleCard);
  const cameFromCatalogPage = Boolean((location as any)?.state?.fromCatalogPage);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedRental, setSelectedRental] = useState<RentalOption | null>(null);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [checkoutType, setCheckoutType] = useState<'purchase' | 'rental'>('purchase');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    email: '',
    phone: ''
  });
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [paymentAttemptId, setPaymentAttemptId] = useState<string | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState<string>(process.env.REACT_APP_WHATSAPP_NUMBER || '6281234567890');
  React.useEffect(() => { 
    (async () => { 
      try { 
        const s = await SettingsService.get(); 
        if (s?.whatsappNumber) setWhatsappNumber(s.whatsappNumber); 
      } catch (_e) { /* ignore settings fetch */ } 
    })(); 
  }, []);
  const currentUrl = window.location.href;

  // Handle share functionality
  const handleBackToCatalog = () => {
    if (cameFromCatalogPage) {
      // Jika datang dari katalog, kembali dengan state untuk restore pagination
      navigate('/products', { state: { fromProductDetail: true } });
    } else {
      // Jika tidak dari katalog, navigate normal
      navigate('/products');
    }
  };

  const handleShare = async () => {
    if (!product) return;
    
    const shareData = {
      title: product.name,
      text: `Lihat ${product.name} di JB Alwikobra - ${formatCurrency(effectivePrice)}`,
      url: currentUrl
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        showToast('Link produk telah disalin ke clipboard!', 'success');
      }
    } catch (error) {
      // Additional fallback: Manual copy
      const textToCopy = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('Link produk telah disalin ke clipboard!', 'success');
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
    const wishlistItem = {
      id: product.id,
      name: product.name,
      price: effectivePrice,
      image: product.images?.[0] || '',
      rating: 5, // Default rating since it's not in Product type
  category: (product as any).categoryData?.name || '',
      available: true // Default to available since it's not in Product type
    };

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(wishlistItem);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const data = await ProductService.getProductById(id);
        setProduct(data);
        if (data?.rentalOptions && data.rentalOptions.length > 0) {
          setSelectedRental(data.rentalOptions[0]);
        }

        // If navigated from a flash sale card, try to enrich with live flash sale info
        if (data && cameFromFlashSaleCard) {
          const sale = await ProductService.getActiveFlashSaleByProductId(data.id);
          if (sale) {
            setProduct(prev => prev ? {
              ...prev,
              isFlashSale: true,
              flashSaleEndTime: sale.endTime,
              price: sale.salePrice,
              originalPrice: sale.originalPrice ?? prev.originalPrice
            } : prev);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Prefill customer if logged in
  useEffect(() => {
    (async () => {
      const logged = await isLoggedIn();
      if (logged) {
        const profile = await getCurrentUserProfile();
        if (profile) {
          setCustomer({
            name: profile.name || '',
            email: profile.email || '',
            phone: profile.phone || '',
          });
        }
      }
    })();
  }, []);

  // Live countdown state (updates every second when viewing from flash sale)
  const [timeRemaining, setTimeRemaining] = useState<ReturnType<typeof calculateTimeRemaining> | null>(null);

  useEffect(() => {
    if (!cameFromFlashSaleCard || !product?.flashSaleEndTime) {
      setTimeRemaining(null);
      return;
    }
    // Set immediately
    setTimeRemaining(calculateTimeRemaining(product.flashSaleEndTime));
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(product.flashSaleEndTime!));
    }, 1000);
    return () => clearInterval(timer as any);
  }, [cameFromFlashSaleCard, product?.flashSaleEndTime]);

  // Show flash sale price/timer only when user arrives from flash sale card AND sale is active
  const isFlashSaleActive = cameFromFlashSaleCard && product?.isFlashSale && timeRemaining && !timeRemaining.isExpired;

  const handlePurchase = () => {
    setCheckoutType('purchase');
    setShowCheckoutForm(true);
  setAcceptedTerms(false);
  };

  // Determine effective price to display/charge
  const effectivePrice = (() => {
    if (!product) return 0;
    if (isFlashSaleActive && product.originalPrice && product.originalPrice > product.price) {
      return product.price; // sale price when active via flash sale navigation
    }
    // Not from flash sale or no active sale: show original/base price
    return product.originalPrice && product.originalPrice > 0 ? product.originalPrice : product.price;
  })();

  const handleRental = (rentalOption: RentalOption) => {
    setSelectedRental(rentalOption);
    setCheckoutType('rental');
    setShowCheckoutForm(true);
  setAcceptedTerms(false);
  };

  const handleWhatsAppContact = (type: 'purchase' | 'rental') => {
    if (!product) return;

    let message = '';
    
    if (type === 'purchase') {
      // Enforce Xendit for purchases: redirect to checkout modal instead of WA
      setCheckoutType('purchase');
      setShowCheckoutForm(true);
      return;
    } else if (type === 'rental' && selectedRental) {
      message = generateRentalMessage(product.name, selectedRental.duration, selectedRental.price, currentUrl);
    }

    const whatsappUrl = generateWhatsAppUrl(whatsappNumber, message);
    window.open(whatsappUrl, '_blank');
  };

  const handleCheckout = async () => {
    if (!product) return;
    
    // Validate required fields
    if (!customer.name.trim()) {
      showToast('Nama lengkap wajib diisi.', 'error');
      return;
    }
    
    if (!customer.email.trim()) {
      showToast('Email wajib diisi.', 'error');
      return;
    }
    
    if (!customer.phone.trim()) {
      showToast('Nomor WhatsApp wajib diisi.', 'error');
      return;
    }
    
    if (!isPhoneValid) {
      showToast('Nomor WhatsApp tidak valid. Pastikan format sudah benar.', 'error');
      return;
    }
    
    if (checkoutType === 'purchase') {
      if (!acceptedTerms) {
        showToast('Harap setujui Syarat & Ketentuan terlebih dahulu.', 'error');
        return;
      }
      if (creatingInvoice) return; // guard double submit
      setCreatingInvoice(true);
      try {
        // Stable external id within this attempt to ensure idempotency on retries/double-clicks
        const fallbackExternalId = paymentAttemptId || `order_${product.id}_${Date.now()}`;
        if (!paymentAttemptId) setPaymentAttemptId(fallbackExternalId);
        const uid = await getAuthUserId();
        
        // Validate product ID before sending
        if (!product.id) {
          console.error('[ProductDetail] ERROR: product.id is missing or invalid:', product.id);
          showToast('Error: Product ID tidak valid. Silakan refresh halaman.', 'error');
          return;
        }
        
        console.log('[ProductDetail] Creating invoice with order data:', {
          externalId: fallbackExternalId,
          amount: effectivePrice,
          customer: customer.name,
          productId: product.id,
          productIdType: typeof product.id,
          productIdLength: product.id?.length,
          userId: uid
        });
        
        const invoice = await createXenditInvoice({
          externalId: fallbackExternalId,
          amount: effectivePrice,
          payerEmail: customer.email,
          description: `Pembelian akun: ${product.name}`,
          // We cannot know the server-created order_id ahead of time. We will update via webhook and let user return manually.
          successRedirectUrl: `${window.location.origin}/payment-status`,
          failureRedirectUrl: `${window.location.origin}/payment-status`,
          customer: {
            given_names: customer.name,
            email: customer.email,
            mobile_number: customer.phone,
          },
          order: {
            product_id: product.id,
            customer_name: customer.name,
            customer_email: customer.email,
            customer_phone: customer.phone,
            order_type: 'purchase',
            amount: effectivePrice,
            rental_duration: null,
            user_id: uid || undefined as any,
          }
        });
        
        console.log('[ProductDetail] Invoice response:', invoice);
        
        if (invoice?.invoice_url) {
          // reset flag; browser will navigate away
          setCreatingInvoice(false);
          window.location.href = invoice.invoice_url;
          return;
        }
      } catch (e: any) {
        console.error('[ProductDetail] Invoice creation failed:', e);
        showToast(`Gagal membuat invoice: ${e?.message || e}`, 'error');
      } finally {
        setCreatingInvoice(false);
      }
      return;
    }

    if (checkoutType === 'rental' && selectedRental) {
      handleWhatsAppContact('rental');
      return;
    }

    setShowCheckoutForm(false);
  };

  if (loading) return <ProductDetailLoadingSkeleton />;

  if (!product) {
    return (
  <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
      <h2 className="text-2xl font-bold text-white mb-2">Produk tidak ditemukan</h2>
  <p className="text-white/70 mb-4">Produk yang Anda cari tidak tersedia</p>
          <Link
            to="/products"
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
          >
            Kembali ke Katalog
          </Link>
        </div>
      </div>
    );
  }

  // Build gallery: ensure at least 5 images (fill with placeholders) and at most 15 images
  let images: string[] = [];
  const baseList: string[] = (product.images && product.images.length > 0)
    ? product.images.slice(0, 15)
    : (product.image ? [product.image] : []);
  if (baseList.length < 5) {
    const needed = 5 - baseList.length;
    const placeholders = Array.from({ length: needed }, (_, i) => `https://source.unsplash.com/collection/190727/400x400?sig=${i}`);
    images = [...baseList, ...placeholders];
  } else {
    images = baseList.slice(0, 15);
  }

  return (
    <div className="min-h-screen bg-black text-white main-content">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BreadcrumbNav productName={product.name} onBack={handleBackToCatalog} />

        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          <ImageGallery
            images={images}
            selectedIndex={selectedImage}
            onSelect={setSelectedImage}
            isFlashSaleActive={isFlashSaleActive}
            productName={product.name}
          />

          {/* Product Info */}
          <div className="mt-6">
            {/* Tags: Game Title and Tier only */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* Game Title - with fallback */}
              <span className="bg-pink-500/10 text-pink-400 px-3 py-1 rounded-full text-sm font-medium border border-pink-500/30">
                {product.gameTitleData?.name || 'GAME'}
              </span>

              {/* Tier (fallback to legacy tier name) - always show */}
              <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium border border-gray-700">
                {product.tierData?.name || 'Reguler'}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-white mb-4">{product.name}</h1>

            {/* Rating & Reviews removed as per requirements */}
            <div className="h-2"></div>

            {/* Price */}
            <div className="mb-6">
              {isFlashSaleActive && product.originalPrice && product.originalPrice > product.price ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold text-pink-400">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-1 rounded text-sm font-medium whitespace-nowrap leading-none">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  </div>
                  <span className="text-lg text-white/70 line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                </div>
              ) : (
                  <span className="text-3xl font-bold text-white">
                  {formatCurrency(effectivePrice)}
                </span>
              )}
            </div>

            <FlashSaleTimer timeRemaining={timeRemaining} />

            {/* accountLevel/accountDetails removed */}

            {/* Rental Options - hidden if user came from flash sale card */}
            <RentalOptions
              options={product.rentalOptions || []}
              selected={selectedRental}
              onSelect={setSelectedRental}
              hidden={cameFromFlashSaleCard || !product.hasRental}
            />

            <ActionButtons
              stock={product.stock || 0}
              hasRental={!!product.hasRental}
              selectedRental={selectedRental}
              cameFromFlashSaleCard={cameFromFlashSaleCard}
              onPurchase={handlePurchase}
              onRental={handleRental}
            />

            {/* Additional Actions */}
  <div className="flex items-center space-x-4 text-white/70">
              <button 
                onClick={handleWishlistToggle}
                className={`flex items-center space-x-1 transition-colors ${
                  product && isInWishlist(product.id) 
                    ? 'text-red-400 hover:text-red-300' 
                    : 'hover:text-red-400'
                }`}
              >
                <Heart 
                  size={16} 
                  className={product && isInWishlist(product.id) ? 'fill-current' : ''} 
                />
                <span>Favorit</span>
              </button>
              <button 
                onClick={handleShare}
        className="flex items-center space-x-1 hover:text-pink-400 transition-colors"
              >
                <Share2 size={16} />
                <span>Bagikan</span>
              </button>
            </div>

            <TrustBadges />
          </div>
        </div>

  <DescriptionSection description={product.description} />

        <CheckoutModal
          visible={showCheckoutForm}
          onClose={() => setShowCheckoutForm(false)}
          checkoutType={checkoutType}
          productName={product.name}
          effectivePrice={effectivePrice}
          selectedRental={selectedRental}
          customer={customer}
          setCustomer={setCustomer}
          isPhoneValid={isPhoneValid}
          setIsPhoneValid={setIsPhoneValid}
          acceptedTerms={acceptedTerms}
          setAcceptedTerms={setAcceptedTerms}
            creatingInvoice={creatingInvoice}
          onCheckout={handleCheckout}
          onWhatsAppRental={() => handleWhatsAppContact('rental')}
        />
      </div>
    </div>
  );
};

export default ProductDetailPage;
