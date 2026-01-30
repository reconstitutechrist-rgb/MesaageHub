/**
 * Product Slice - Manages product catalog state for shoppable content
 *
 * Allows users to maintain a product catalog and tag products on canvas designs.
 */

import { productCatalogService } from '@/services/ProductCatalogService'

/**
 * Product slice for Zustand store
 */
export const createProductSlice = (set, get) => ({
  // State
  productCatalog: [],
  isLoadingCatalog: false,
  catalogError: null,

  // Set full catalog
  setProductCatalog: (products) => {
    set({ productCatalog: products })
  },

  // Add a product to catalog
  addProduct: (product) => {
    set({ productCatalog: [product, ...get().productCatalog] })
  },

  // Update a product in catalog
  updateProduct: (productId, updates) => {
    set({
      productCatalog: get().productCatalog.map((p) =>
        p.id === productId ? { ...p, ...updates } : p
      ),
    })
  },

  // Remove a product from catalog
  removeProduct: (productId) => {
    set({
      productCatalog: get().productCatalog.filter((p) => p.id !== productId),
    })
  },

  // Loading/error helpers
  setCatalogLoading: (isLoading) => {
    set({ isLoadingCatalog: isLoading })
  },

  setCatalogError: (error) => {
    set({ catalogError: error })
  },

  // Async: load catalog from service
  loadProductCatalog: async (userId) => {
    set({ isLoadingCatalog: true, catalogError: null })
    try {
      const result = await productCatalogService.listProducts(userId)
      if (result.success) {
        set({ productCatalog: result.data, isLoadingCatalog: false })
      } else {
        set({ isLoadingCatalog: false, catalogError: result.error })
      }
    } catch (error) {
      set({ isLoadingCatalog: false, catalogError: error.message })
    }
  },

  // Async: save a new product
  saveProduct: async (userId, product) => {
    set({ catalogError: null })
    try {
      const result = await productCatalogService.createProduct(userId, product)
      if (result.success && result.data) {
        set({ productCatalog: [result.data, ...get().productCatalog] })
        return result.data
      }
      set({ catalogError: result.error })
      return null
    } catch (error) {
      set({ catalogError: error.message })
      return null
    }
  },

  // Async: delete a product
  deleteProduct: async (userId, productId) => {
    set({ catalogError: null })
    try {
      const result = await productCatalogService.deleteProduct(userId, productId)
      if (result.success) {
        set({
          productCatalog: get().productCatalog.filter((p) => p.id !== productId),
        })
        return true
      }
      set({ catalogError: result.error })
      return false
    } catch (error) {
      set({ catalogError: error.message })
      return false
    }
  },

  // Reset product state
  resetProductState: () => {
    set({
      productCatalog: [],
      isLoadingCatalog: false,
      catalogError: null,
    })
  },
})
