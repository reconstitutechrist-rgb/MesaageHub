import { supabase, isSupabaseConfigured } from '@/lib/supabase'

/**
 * DesignProjectService - Handles design project storage and management
 * Uses Supabase database for storing AI Studio projects with JSONB layers
 */

const TABLE_NAME = 'design_projects'

// Mock data for demo mode when Supabase is not configured
const mockProjects = [
  {
    id: 'mock-project-1',
    user_id: 'demo-user',
    name: 'Summer Sale Banner',
    platform_preset: 'instagram-post',
    layers: [],
    background: { type: 'gradient', value: ['#ff6b6b', '#feca57'] },
    text_overlay: {
      text: 'SUMMER SALE',
      x: 540,
      y: 540,
      color: '#ffffff',
      fontSize: 72,
    },
    thumbnail_url: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'mock-project-2',
    user_id: 'demo-user',
    name: 'Product Launch',
    platform_preset: 'instagram-story',
    layers: [],
    background: { type: 'solid', value: '#1a1a2e' },
    text_overlay: {
      text: 'NEW ARRIVAL',
      x: 540,
      y: 960,
      color: '#00d4ff',
      fontSize: 56,
    },
    thumbnail_url: null,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
]

class DesignProjectService {
  /**
   * Save a design project (create or update)
   * @param {object} projectData - The project data to save
   * @param {string} userId - The user ID
   * @returns {Promise<object>} - Result with success status and data
   */
  async saveProject(projectData, userId = 'demo-user') {
    const { id, name, platform_preset, layers, background, text_overlay, thumbnail_url } =
      projectData

    if (!isSupabaseConfigured) {
      // Demo mode - create or update mock entry
      const now = new Date().toISOString()

      if (id) {
        // Update existing
        const index = mockProjects.findIndex((p) => p.id === id)
        if (index !== -1) {
          mockProjects[index] = {
            ...mockProjects[index],
            name: name || mockProjects[index].name,
            platform_preset: platform_preset || mockProjects[index].platform_preset,
            layers: layers || mockProjects[index].layers,
            background: background || mockProjects[index].background,
            text_overlay: text_overlay || mockProjects[index].text_overlay,
            thumbnail_url: thumbnail_url || mockProjects[index].thumbnail_url,
            updated_at: now,
          }
          return { success: true, data: mockProjects[index] }
        }
      }

      // Create new
      const newProject = {
        id: `mock-project-${Date.now()}`,
        user_id: userId,
        name: name || 'Untitled Design',
        platform_preset: platform_preset || 'instagram-post',
        layers: layers || [],
        background: background || { type: 'solid', value: null },
        text_overlay: text_overlay || null,
        thumbnail_url: thumbnail_url || null,
        created_at: now,
        updated_at: now,
      }
      mockProjects.unshift(newProject)
      return { success: true, data: newProject }
    }

    try {
      const now = new Date().toISOString()
      const data = {
        user_id: userId,
        name: name || 'Untitled Design',
        platform_preset: platform_preset || 'instagram-post',
        layers: JSON.stringify(layers || []),
        background: JSON.stringify(background || { type: 'solid', value: null }),
        text_overlay: text_overlay ? JSON.stringify(text_overlay) : null,
        thumbnail_url: thumbnail_url || null,
        updated_at: now,
      }

      if (id) {
        // Update existing
        const { data: result, error } = await supabase
          .from(TABLE_NAME)
          .update(data)
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single()

        if (error) throw error
        return { success: true, data: this._parseProject(result) }
      }

      // Create new
      data.created_at = now
      const { data: result, error } = await supabase.from(TABLE_NAME).insert(data).select().single()

      if (error) throw error
      return { success: true, data: this._parseProject(result) }
    } catch (error) {
      console.error('Error saving project:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Load a specific design project
   * @param {string} projectId - The project ID
   * @param {string} userId - The user ID
   * @returns {Promise<object>} - Result with success status and data
   */
  async loadProject(projectId, userId = 'demo-user') {
    if (!isSupabaseConfigured) {
      // Demo mode - find mock project
      const project = mockProjects.find((p) => p.id === projectId && p.user_id === userId)
      if (project) {
        return { success: true, data: project }
      }
      return { success: false, error: 'Project not found' }
    }

    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return { success: true, data: this._parseProject(data) }
    } catch (error) {
      console.error('Error loading project:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * List all design projects for a user
   * @param {string} userId - The user ID
   * @param {object} options - Pagination options { limit, offset }
   * @returns {Promise<object>} - Result with success status and data array
   */
  async listProjects(userId = 'demo-user', { limit = 20, offset = 0 } = {}) {
    if (!isSupabaseConfigured) {
      // Demo mode - return mock projects
      const userProjects = mockProjects.filter((p) => p.user_id === userId)
      return {
        success: true,
        data: userProjects.slice(offset, offset + limit),
        total: userProjects.length,
      }
    }

    try {
      const { data, error, count } = await supabase
        .from(TABLE_NAME)
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return {
        success: true,
        data: data.map(this._parseProject),
        total: count,
      }
    } catch (error) {
      console.error('Error listing projects:', error)
      return { success: false, error: error.message, data: [], total: 0 }
    }
  }

  /**
   * Delete a design project
   * @param {string} projectId - The project ID
   * @param {string} userId - The user ID
   * @returns {Promise<object>} - Result with success status
   */
  async deleteProject(projectId, userId = 'demo-user') {
    if (!isSupabaseConfigured) {
      // Demo mode - remove mock project
      const index = mockProjects.findIndex((p) => p.id === projectId && p.user_id === userId)
      if (index !== -1) {
        mockProjects.splice(index, 1)
        return { success: true }
      }
      return { success: false, error: 'Project not found' }
    }

    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', projectId)
        .eq('user_id', userId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting project:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Duplicate a design project
   * @param {string} projectId - The project ID to duplicate
   * @param {string} userId - The user ID
   * @returns {Promise<object>} - Result with success status and new project data
   */
  async duplicateProject(projectId, userId = 'demo-user') {
    const result = await this.loadProject(projectId, userId)
    if (!result.success) return result

    const {
      id: _id,
      created_at: _created_at,
      updated_at: _updated_at,
      ...projectData
    } = result.data
    return this.saveProject(
      {
        ...projectData,
        name: `${projectData.name} (Copy)`,
      },
      userId
    )
  }

  /**
   * Parse a project from database format
   * @private
   */
  _parseProject(data) {
    return {
      ...data,
      layers: typeof data.layers === 'string' ? JSON.parse(data.layers) : data.layers,
      background:
        typeof data.background === 'string' ? JSON.parse(data.background) : data.background,
      text_overlay:
        typeof data.text_overlay === 'string' ? JSON.parse(data.text_overlay) : data.text_overlay,
    }
  }
}

// Export singleton instance
export const designProjectService = new DesignProjectService()
export default designProjectService
