import { dbService } from './DatabaseService'
import { supabase } from '@/lib/supabase'
import { Network } from '@capacitor/network'

/**
 * Handles data synchronization between local SQLite and Supabase.
 * Implements "Last Write Wins" strategy.
 */
class SyncService {
  constructor() {
    this.isOnline = true
    this.syncInterval = null
  }

  async initialize() {
    // Listen for network changes
    Network.addListener('networkStatusChange', (status) => {
      this.isOnline = status.connected
      if (this.isOnline) {
        this.syncAll()
      }
    })

    const status = await Network.getStatus()
    this.isOnline = status.connected

    // Optional: Periodic sync every 5 minutes
    this.syncInterval = setInterval(() => this.syncAll(), 5 * 60 * 1000)
  }

  async syncAll() {
    if (!this.isOnline) return

    // Sync started

    try {
      await this.syncContacts()
      await this.syncCampaigns()
      // Push any pending offline mutations
      await this.processPendingMutations()
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }

  /**
   * Sync Contacts Table
   * 1. Pull remote changes (updated_at > last_sync)
   * 2. Upsert to local
   */
  async syncContacts() {
    // 1. Get last sync time from local prefs
    const lastSync = localStorage.getItem('last_sync_contacts') || '1970-01-01T00:00:00Z'

    // 2. Fetch changes from Supabase
    const { data: remoteContacts, error } = await supabase
      .from('contacts')
      .select('*')
      .gt('updated_at', lastSync)

    if (error) throw error

    if (remoteContacts && remoteContacts.length > 0) {
      // 3. Upsert into local DB (Last Write Wins from server authoritative perspective)
      for (const contact of remoteContacts) {
        // Ensure tags are parsed if they come as string from server, or standardized
        await dbService.saveContact(contact)
      }

      // 4. Update last sync time
      const newSyncTime = new Date().toISOString()
      localStorage.setItem('last_sync_contacts', newSyncTime)

      // Synced contacts
    }
  }

  async syncCampaigns() {
    const lastSync = localStorage.getItem('last_sync_campaigns') || '1970-01-01T00:00:00Z'

    const { data: remoteCampaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .gt('updated_at', lastSync)

    if (error) throw error

    if (remoteCampaigns && remoteCampaigns.length > 0) {
      for (const campaign of remoteCampaigns) {
        await dbService.saveCampaign(campaign)
      }

      const newSyncTime = new Date().toISOString()
      localStorage.setItem('last_sync_campaigns', newSyncTime)

      // Synced campaigns
    }
  }

  async processPendingMutations() {
    const pending = await dbService.getPendingMutations()

    for (const mutation of pending) {
      try {
        const { table_name, operation, data } = mutation

        if (operation === 'INSERT' || operation === 'UPDATE') {
          const { error } = await supabase.from(table_name).upsert(data)
          if (error) throw error
        } else if (operation === 'DELETE') {
          const { error } = await supabase.from(table_name).delete().eq('id', data.id)
          if (error) throw error
        }

        // Remove from pending queue after successful sync
        await dbService.clearPendingMutation(mutation.id)
        // Mutation processed
      } catch (error) {
        console.error(`Failed to process mutation ${mutation.id}:`, error)
        // Keep in queue to retry later
      }
    }
  }

  // Manual sync trigger (can be called from UI)
  async triggerSync() {
    return this.syncAll()
  }

  // Cleanup on app destroy
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
  }
}

export const syncService = new SyncService()
