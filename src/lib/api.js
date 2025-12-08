// Re-export Supabase client for API operations
export { supabase, isSupabaseConfigured } from './supabase'

// Export common API utilities
export const api = {
  // Helper for handling API responses
  async handleResponse(promise) {
    try {
      const response = await promise
      return { data: response, error: null }
    } catch (error) {
      console.error('API Error:', error)
      return { data: null, error: error.message || 'An error occurred' }
    }
  },
}

export default api
