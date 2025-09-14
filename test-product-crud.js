// Test script untuk create dan update product dengan gambar
const path = require('path');
const fs = require('fs');

// Import ProductService dari direktori src
const { createClient } = require('@supabase/supabase-js');

// Supabase config
const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test data untuk create product
const testProductData = {
  name: 'Test Game Account - ML Legend',
  description: 'Akun Mobile Legends dengan rank Legend, skin rare, dan hero lengkap. Hero: 50+, Skin: 15+ rare skins, BP: 50000+',
  price: 150000,
  originalPrice: 200000,
  image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&h=500&fit=crop',
  images: [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&h=500&fit=crop'
  ],
  categoryId: '2542be0b-ad29-460d-9c83-0c90fae0601a', // Akun category
  gameTitleId: '6df60d8d-65ec-482f-ba35-afc290b1ecec', // Mobile Legends
  tierId: 'ffd8c073-ec77-4ce8-8aee-a70ddaa8ab2f', // Reguler tier
  isFlashSale: false,
  hasRental: false,
  stock: 1,
  isActive: true
};

// Test data untuk update product
const updateProductData = {
  name: 'Test Game Account - ML Mythic (UPDATED)',
  description: 'Akun Mobile Legends dengan rank Mythic, skin epic, dan hero premium. Hero: 70+, Skin: 25+ epic skins, BP: 100000+, Emblem max',
  price: 250000,
  originalPrice: 300000,
  image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=600&fit=crop',
  images: [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=600&h=600&fit=crop'
  ]
};

async function testCreateProduct() {
  console.log('🧪 Testing CREATE Product with Images...\n');
  
  try {
    // Direct insert to products table (simulating ProductService.createProduct)
    const payload = {
      name: testProductData.name,
      description: testProductData.description,
      price: testProductData.price,
      original_price: testProductData.originalPrice,
      image: testProductData.image,
      images: testProductData.images,
      category_id: testProductData.categoryId,
      game_title_id: testProductData.gameTitleId,
      tier_id: testProductData.tierId,
      is_flash_sale: testProductData.isFlashSale,
      has_rental: testProductData.hasRental,
      stock: testProductData.stock,
      is_active: testProductData.isActive
    };

    console.log('📤 Creating product with payload:', {
      name: payload.name,
      price: payload.price,
      images: `${payload.images.length} images`,
      category_id: payload.category_id,
      game_title_id: payload.game_title_id,
      tier_id: payload.tier_id
    });

    const { data, error } = await supabase
      .from('products')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('❌ CREATE ERROR:', error);
      return null;
    }

    console.log('✅ Product created successfully!');
    console.log('📋 Created product details:');
    console.log(`   - ID: ${data.id}`);
    console.log(`   - Name: ${data.name}`);
    console.log(`   - Price: Rp ${data.price.toLocaleString()}`);
    console.log(`   - Images: ${data.images?.length || 0} photos`);
    console.log(`   - Active: ${data.is_active}`);
    console.log('');

    return data;

  } catch (error) {
    console.error('💥 Unexpected error during CREATE:', error);
    return null;
  }
}

async function testUpdateProduct(productId) {
  console.log('🧪 Testing UPDATE Product with Images...\n');
  
  try {
    const payload = {
      name: updateProductData.name,
      description: updateProductData.description,
      price: updateProductData.price,
      original_price: updateProductData.originalPrice,
      image: updateProductData.image,
      images: updateProductData.images
    };

    console.log('📤 Updating product with payload:', {
      name: payload.name,
      price: payload.price,
      images: `${payload.images.length} images`
    });

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('❌ UPDATE ERROR:', error);
      return null;
    }

    console.log('✅ Product updated successfully!');
    console.log('📋 Updated product details:');
    console.log(`   - ID: ${data.id}`);
    console.log(`   - Name: ${data.name}`);
    console.log(`   - Price: Rp ${data.price.toLocaleString()}`);
    console.log(`   - Images: ${data.images?.length || 0} photos`);
    console.log(`   - Active: ${data.is_active}`);
    console.log('');

    return data;

  } catch (error) {
    console.error('💥 Unexpected error during UPDATE:', error);
    return null;
  }
}

async function testDeleteProduct(productId) {
  console.log('🧪 Testing DELETE Product (cleanup)...\n');
  
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('❌ DELETE ERROR:', error);
      return false;
    }

    console.log('✅ Product deleted successfully!');
    return true;

  } catch (error) {
    console.error('💥 Unexpected error during DELETE:', error);
    return false;
  }
}

async function checkPrerequisites() {
  console.log('🔍 Checking prerequisites (categories, game titles, tiers)...\n');
  
  try {
    // Check categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(5);
    
    if (catError) {
      console.warn('⚠️  Categories table check failed:', catError.message);
    } else {
      console.log(`✅ Found ${categories?.length || 0} categories`);
      categories?.forEach(cat => console.log(`   - ${cat.id}: ${cat.name}`));
    }

    // Check game titles
    const { data: gameTitles, error: gameError } = await supabase
      .from('game_titles')
      .select('id, name')
      .limit(5);
    
    if (gameError) {
      console.warn('⚠️  Game titles table check failed:', gameError.message);
    } else {
      console.log(`✅ Found ${gameTitles?.length || 0} game titles`);
      gameTitles?.forEach(game => console.log(`   - ${game.id}: ${game.name}`));
    }

    // Check tiers
    const { data: tiers, error: tierError } = await supabase
      .from('tiers')
      .select('id, name')
      .limit(5);
    
    if (tierError) {
      console.warn('⚠️  Tiers table check failed:', tierError.message);
    } else {
      console.log(`✅ Found ${tiers?.length || 0} tiers`);
      tiers?.forEach(tier => console.log(`   - ${tier.id}: ${tier.name}`));
    }

    console.log('');
    return true;

  } catch (error) {
    console.error('💥 Error checking prerequisites:', error);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Product CRUD Tests with Images\n');
  console.log('🎯 Server should be running on http://localhost:3000\n');
  
  // Check prerequisites
  await checkPrerequisites();
  
  // Test CREATE
  const createdProduct = await testCreateProduct();
  if (!createdProduct) {
    console.log('❌ CREATE test failed, stopping tests');
    return;
  }

  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test UPDATE
  const updatedProduct = await testUpdateProduct(createdProduct.id);
  if (!updatedProduct) {
    console.log('❌ UPDATE test failed');
  }

  // Wait a bit more
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test DELETE (cleanup)
  console.log('🧹 Cleaning up test data...');
  const deleted = await testDeleteProduct(createdProduct.id);
  
  console.log('\n🎉 All tests completed!');
  console.log('📊 Results:');
  console.log(`   - CREATE: ${createdProduct ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`   - UPDATE: ${updatedProduct ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`   - DELETE: ${deleted ? '✅ SUCCESS' : '❌ FAILED'}`);
}

// Run the tests
runTests().catch(console.error);
