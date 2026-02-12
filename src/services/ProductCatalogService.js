/**
 * Product Catalog Service
 *
 * Handles persistence of product catalog items via Supabase.
 */

import { supabase } from '@/lib/supabase'

// ============================================
// PUBLIC API
// ============================================

/**
 * List all products for a user
 */
export async function listProducts(userId) {
  try {
    const { data, error } = await supabase
      .from('product_catalog')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, data: (data || []).map(transformProduct) }
  } catch (error) {
    console.error('Failed to list products:', error)
    return { success: false, error: error.message, data: [] }
  }
}

/**
 * Create a new product
 */
export async function createProduct(userId, product) {
  try {
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
    const { error } = await supabase
      .from('product_catalog')
      .delete()
      .eq('id', productId)
      .eq('user_id', userId)

    if (error) throw error
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
