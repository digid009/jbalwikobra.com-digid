/**
 * Shared utility for fetching product information
 * Used by payment creation endpoints to populate order data
 */

/**
 * Fetches the product name for a given product ID
 * Returns null if product not found or on error
 * 
 * @param supabase - Supabase client instance
 * @param productId - UUID of the product
 * @returns Product name or null
 */
export async function fetchProductName(supabase: any, productId: string | null | undefined): Promise<string | null> {
  if (!productId) {
    return null;
  }

  try {
    const { data: productData } = await supabase
      .from('products')
      .select('name')
      .eq('id', productId)
      .single();
    
    const productName = productData?.name || null;
    if (productName) {
      console.log('[Product Utils] Fetched product name:', productName);
    } else {
      console.warn('[Product Utils] Product found but no name:', productId);
    }
    return productName;
  } catch (err) {
    console.warn('[Product Utils] Failed to fetch product name for', productId, ':', err);
    return null;
  }
}
