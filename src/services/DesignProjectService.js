import { supabase } from '@/lib/supabase'

/**
 * DesignProjectService - Handles design project storage and management
 * Uses Supabase database for storing AI Studio projects with JSONB layers
 */

const TABLE_NAME = 'design_projects'

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
