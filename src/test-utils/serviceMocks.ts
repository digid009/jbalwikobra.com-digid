// Shared mock data for services used across tests
export const mockProducts = [
  {
    id: 'p1',
    name: 'Alpha Product',
    description: 'First product description',
    price: 1000,
    original_price: 1200,
    stock: 5,
    tier_id: 'tier1',
    category_id: 'cat-a',
    categoryData: { id: 'cat-a', name: 'Category A', slug: 'category-a' },
  game_title_id: 'game1-id',
  game_titles: { id: 'game1-id', name: 'Game 1', slug: 'game-1', icon: 'Icon' },
    is_active: true,
    created_at: new Date().toISOString(),
    image: '',
    images: []
  },
  {
    id: 'p2',
    name: 'Beta Product',
    description: 'Second product description',
    price: 2000,
    original_price: 2500,
    stock: 2,
    tier_id: 'tier2',
    category_id: 'cat-b',
    categoryData: { id: 'cat-b', name: 'Category B', slug: 'category-b' },
  game_title_id: 'game2-id',
  game_titles: { id: 'game2-id', name: 'Game 2', slug: 'game-2', icon: 'Icon' },
    is_active: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    image: '',
    images: []
  }
];

export const mockCategories = [
  { id: 'cat-a', name: 'Category A', slug: 'category-a' },
  { id: 'cat-b', name: 'Category B', slug: 'category-b' }
];
