/**
 * UI Slice - Manages modals and project state
 *
 * Handles:
 * - Modal open/close states
 * - Project save/load
 */

import { designProjectService } from '@/services/DesignProjectService'
import { platformPresets } from '@/lib/platformTemplates'

/**
 * UI slice for Zustand store
 */
export const createUISlice = (set, get) => ({
  // Modal states
  modals: {
    export: false,
    templates: false,
    platforms: false,
    videoExport: false,
    save: false,
  },

  // Project state
  currentProjectId: null,
  projectName: '',
  isSaving: false,
  saveError: null,

  // Open a modal
  openModal: (name) => {
    set((state) => ({
      modals: { ...state.modals, [name]: true },
    }))
  },

  // Close a modal
  closeModal: (name) => {
    set((state) => ({
      modals: { ...state.modals, [name]: false },
    }))
  },

  // Close all modals
  closeAllModals: () => {
    set({
      modals: {
        export: false,
        templates: false,
        platforms: false,
        videoExport: false,
        save: false,
      },
    })
  },

  // Set project name
  setProjectName: (name) => set({ projectName: name }),

  // Save project
  saveProject: async (name, userId = 'demo-user') => {
    const {
      isSaving,
      currentProjectId,
      projectName,
      selectedPlatform,
      layers,
      background,
      textOverlay,
    } = get()
    if (isSaving) return null

    set({ isSaving: true, saveError: null })

    try {
      const projectData = {
        id: currentProjectId,
        name: name || projectName || 'Untitled Design',
        platform_preset: selectedPlatform,
        layers,
        background,
        text_overlay: textOverlay,
        thumbnail_url: null,
      }

      const result = await designProjectService.saveProject(projectData, userId)

      if (result.success) {
        set({
          currentProjectId: result.data.id,
          projectName: result.data.name,
        })
        return result.data
      } else {
        set({ saveError: result.error || 'Failed to save project' })
        return null
      }
    } catch (error) {
      console.error('Save project failed:', error)
      set({ saveError: error.message || 'Failed to save project' })
      return null
    } finally {
      set({ isSaving: false })
    }
  },

  // Load a project
  loadProject: (project) => {
    if (!project) return

    const { setAllLayers, closeAllModals } = get()

    // Set project identity
    set({
      currentProjectId: project.id,
      projectName: project.name,
    })

    // Set platform
    if (project.platform_preset && platformPresets[project.platform_preset]) {
      set({ selectedPlatform: project.platform_preset })
    }

    // Set background
    if (project.background) {
      set({ background: project.background })
    }

    // Set text overlay
    if (project.text_overlay) {
      set({ textOverlay: project.text_overlay })
    }

    // Set layers
    if (project.layers && Array.isArray(project.layers)) {
      setAllLayers(project.layers)
    }

    // Close modals
    closeAllModals()
  },

  // Reset UI state (called by global reset)
  resetUIState: () => {
    set({
      modals: {
        export: false,
        templates: false,
        platforms: false,
        videoExport: false,
        save: false,
      },
      currentProjectId: null,
      projectName: '',
      isSaving: false,
      saveError: null,
    })
  },
})
