import { createClient } from '@base44/sdk'

// Initialize Base44 client
// Configure with your Base44 project credentials
export const base44Client = createClient({
  // Add your Base44 configuration here
  // apiKey: import.meta.env.VITE_BASE44_API_KEY,
  // projectId: import.meta.env.VITE_BASE44_PROJECT_ID,
})

// Export common API utilities
export const api = {
  client: base44Client,

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
