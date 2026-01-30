/**
 * Product Catalog Service
 *
 * Handles persistence of product catalog items.
 * Uses localStorage as primary storage with Supabase support when available.
 */

const STORAGE_KEY = 'ai_studio_product_catalog'

// ============================================
// LOCAL STORAGE HELPERS
// ============================================

function loadCatalogFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveCatalogToStorage(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
    return true
  } catch {
    return false
  }
}

// ============================================
// PUBLIC API
// ============================================

/**
 * List all products for a user
 */
export async function listProducts(userId) {
  try {
    // Check if Supabase is available
    let supabase = null
    try {
      const mod = await import('@/lib/supabase')
      supabase = mod.supabase
    } catch {
      // Supabase not configured
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('product_catalog')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data: (data || []).map(transformProduct) }
    }

    // Fallback to localStorage
    const products = loadCatalogFromStorage()
    return { success: true, data: products }
  } catch (error) {
    console.error('Failed to list products:', error)
    // Fallback to localStorage on error
    const products = loadCatalogFromStorage()
    return { success: true, data: products }
  }
}

/**
 * Create a new product
 */
export async function createProduct(userId, product) {
  try {
    let supabase = null
    try {
      const mod = await import('@/lib/supabase')
      supabase = mod.supabase
    } catch {
      // Supabase not configured
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('product_catalog')
        .insert([
          {
            user_id: userId,
            name: product.name,
            sku: product.sku || null,
            price: product.price || null,
            product_url: product.productUrl || null,
            image_url: product.imageUrl || null,
          },
        ])
        .select()
        .single()

      if (error) throw error
      return { success: true, data: transformProduct(data) }
    }

    // Fallback: create locally
    const newProduct = {
      id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: product.name,
      sku: product.sku || '',
      price: product.price || null,
      productUrl: product.productUrl || '',
      imageUrl: product.imageUrl || '',
      createdAt: new Date().toISOString(),
    }
    const products = loadCatalogFromStorage()
    products.unshift(newProduct)
    saveCatalogToStorage(products)
    return { success: true, data: newProduct }
  } catch (error) {
    console.error('Failed to create product:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(userId, productId, updates) {
  try {
    let supabase = null
    try {
      const mod = await import('@/lib/supabase')
      supabase = mod.supabase
    } catch {
      // Supabase not configured
    }

    if (supabase) {
      const updateData = {}
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.sku !== undefined) updateData.sku = updates.sku
      if (updates.price !== undefined) updateData.price = updates.price
      if (updates.productUrl !== undefined) updateData.product_url = updates.productUrl
      if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl

      const { data, error } = await supabase
        .from('product_catalog')
        .update(updateData)
        .eq('id', productId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data: transformProduct(data) }
    }

    // Fallback: update locally
    const products = loadCatalogFromStorage()
    const index = products.findIndex((p) => p.id === productId)
    if (index === -1) return { success: false, error: 'Product not found' }
    products[index] = { ...products[index], ...updates }
    saveCatalogToStorage(products)
    return { success: true, data: products[index] }
  } catch (error) {
    console.error('Failed to update product:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(userId, productId) {
  try {
    let supabase = null
    try {
      const mod = await import('@/lib/supabase')
      supabase = mod.supabase
    } catch {
      // Supabase not configured
    }

    if (supabase) {
      const { error } = await supabase
        .from('product_catalog')
        .delete()
        .eq('id', productId)
        .eq('user_id', userId)

      if (error) throw error
      return { success: true }
    }

    // Fallback: delete locally
    const products = loadCatalogFromStorage()
    const filtered = products.filter((p) => p.id !== productId)
    saveCatalogToStorage(filtered)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete product:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// TRANSFORM HELPERS
// ============================================

function transformProduct(record) {
  if (!record) return null
  return {
    id: record.id,
    name: record.name,
    sku: record.sku || '',
    price: record.price !== null && record.price !== undefined ? Number(record.price) : null,
    productUrl: record.product_url || '',
    imageUrl: record.image_url || '',
    createdAt: record.created_at,
  }
}

export const productCatalogService = {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
}

export default productCatalogService
