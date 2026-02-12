/**
 * Brand Kit Service
 *
 * Handles persistence of brand kits to Supabase
 */

import { supabase } from '@/lib/supabase'

const TABLE_NAME = 'brand_kits'

/**
 * Get all brand kits for a user
 */
export async function getUserBrandKits(userId) {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Failed to fetch brand kits:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get a single brand kit by ID
 */
export async function getBrandKit(brandKitId) {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', brandKitId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Failed to fetch brand kit:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Create a new brand kit
 */
export async function createBrandKit(brandKit) {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([
        {
          user_id: brandKit.userId,
          name: brandKit.name,
          colors: brandKit.colors,
          fonts: brandKit.fonts,
          logo_url: brandKit.logo || null,
          contact_overlay_text: brandKit.contactOverlay?.text || 'Text me at',
        },
      ])
      .select()
      .single()

    if (error) throw error
    return { data: transformBrandKit(data), error: null }
  } catch (error) {
    console.error('Failed to create brand kit:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Update an existing brand kit
 */
export async function updateBrandKit(brandKitId, updates) {
  try {
    const updateData = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.colors !== undefined) updateData.colors = updates.colors
    if (updates.fonts !== undefined) updateData.fonts = updates.fonts
    if (updates.logo !== undefined) updateData.logo_url = updates.logo
    if (updates.contactOverlay?.text !== undefined) {
      updateData.contact_overlay_text = updates.contactOverlay.text
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', brandKitId)
      .select()
      .single()

    if (error) throw error
    return { data: transformBrandKit(data), error: null }
  } catch (error) {
    console.error('Failed to update brand kit:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Delete a brand kit
 */
export async function deleteBrandKit(brandKitId) {
  try {
    const { error } = await supabase.from(TABLE_NAME).delete().eq('id', brandKitId)

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Failed to delete brand kit:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Transform database record to app format
 */
function transformBrandKit(record) {
  if (!record) return null
  return {
    id: record.id,
    userId: record.user_id,
    name: record.name,
    colors: record.colors || {},
    fonts: record.fonts || {},
    logo: record.logo_url,
    contactOverlay: {
      text: record.contact_overlay_text || 'Text me at',
    },
    createdAt: record.created_at,
  }
}

/**
 * Transform multiple records
 */
export function transformBrandKits(records) {
  if (!records) return []
  return records.map(transformBrandKit)
}

export default {
  getUserBrandKits,
  getBrandKit,
  createBrandKit,
  updateBrandKit,
  deleteBrandKit,
  transformBrandKits,
}
