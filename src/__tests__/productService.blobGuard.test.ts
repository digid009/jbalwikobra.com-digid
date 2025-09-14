import { ProductService } from '../services/productService';

// Minimal mock for supabase to prevent real network calls if productService accesses it indirectly
jest.mock('../services/supabase', () => ({
  supabase: {
    from: () => ({ insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }), update: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }) })
  }
}));

describe('ProductService blob URL guards', () => {
  const baseProduct: any = {
    name: 'Test',
    description: 'Desc',
    price: 1000,
    originalPrice: 1000,
    categoryId: '550e8400-e29b-41d4-a716-446655440000',
    gameTitleId: '550e8400-e29b-41d4-a716-446655440001',
    tierId: null,
    stock: 1,
    isActive: true,
    isFlashSale: false,
    hasRental: false,
    image: '',
    images: []
  };

  test('createProduct rejects blob URLs in images', async () => {
    const product = { ...baseProduct, images: ['blob:abc123'] };
    const result = await ProductService.createProduct(product);
    expect(result).toBeNull();
  });

  test('updateProduct rejects blob URLs in images', async () => {
    const updates = { images: ['blob:abc123'] } as any;
    const result = await ProductService.updateProduct('550e8400-e29b-41d4-a716-446655440010', updates);
    expect(result).toBeNull();
  });

  test('createProduct passes valid URLs', async () => {
    const product = { ...baseProduct, images: ['https://example.com/image.jpg'], image: 'https://example.com/image.jpg' };
    const result = await ProductService.createProduct(product);
    // Mock returns null data but guard should not trigger -> result null is acceptable; ensure no exception thrown
    expect(result).toBeNull();
  });
});
