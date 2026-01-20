import { Capacitor } from '@capacitor/core'
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite'

// Helper to determine if we are running native
const isNative = Capacitor.isNativePlatform()

class DatabaseService {
  constructor() {
    this.sqlite = null
    this.db = null
    this.webStore = isNative ? null : window.localStorage
  }

  async initialize() {
    if (isNative) {
      this.sqlite = new SQLiteConnection(CapacitorSQLite)
      this.db = await this.sqlite.createConnection(
        'messagehub_db',
        false,
        'no-encryption',
        1,
        false
      )
      await this.db.open()
      await this.createTables()
    } else {
      console.warn('Running on Web: Using LocalStorage fallback')
      // Web fallback initialization if needed
    }
  }

  async createTables() {
    if (!isNative) return

    const schema = `
      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name TEXT,
        phone TEXT,
        email TEXT,
        tags TEXT, -- JSON string
        created_at TEXT,
        updated_at TEXT,
        synced_at TEXT
      );

      CREATE TABLE IF NOT EXISTS campaigns (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name TEXT,
        status TEXT,
        filter_criteria TEXT, -- JSON string
        message_body TEXT,
        media_asset_id TEXT,
        created_at TEXT,
        updated_at TEXT,
        synced_at TEXT
      );

      CREATE TABLE IF NOT EXISTS pending_mutations (
        id TEXT PRIMARY KEY,
        table_name TEXT,
        operation TEXT, -- INSERT, UPDATE, DELETE
        data TEXT, -- JSON payload
        created_at TEXT
      );
    `
    await this.db.execute(schema)
  }

  // --- Generic CRUD Wrappers ---

  async getContacts() {
    if (isNative) {
      const res = await this.db.query('SELECT * FROM contacts')
      return res.values.map((c) => ({ ...c, tags: JSON.parse(c.tags || '[]') }))
    } else {
      const data = this.webStore.getItem('contacts')
      return data ? JSON.parse(data) : []
    }
  }

  async saveContact(contact) {
    const now = new Date().toISOString()
    const contactToSave = { ...contact, updated_at: now }

    if (isNative) {
      const tags = JSON.stringify(contact.tags || [])
      const query = `
        INSERT OR REPLACE INTO contacts (id, user_id, name, phone, email, tags, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `
      await this.db.run(query, [
        contact.id,
        contact.user_id,
        contact.name,
        contact.phone,
        contact.email,
        tags,
        contact.created_at || now,
        now,
      ])
    } else {
      const contacts = await this.getContacts()
      const index = contacts.findIndex((c) => c.id === contact.id)
      if (index >= 0) {
        contacts[index] = contactToSave
      } else {
        contacts.push(contactToSave)
      }
      this.webStore.setItem('contacts', JSON.stringify(contacts))
    }

    // Trigger Sync (Optimistic UI)
    return contactToSave
  }

  async deleteContact(contactId) {
    if (isNative) {
      await this.db.run('DELETE FROM contacts WHERE id = ?', [contactId])
    } else {
      const contacts = await this.getContacts()
      const filtered = contacts.filter((c) => c.id !== contactId)
      this.webStore.setItem('contacts', JSON.stringify(filtered))
    }
  }

  // --- Campaign Methods ---

  async getCampaigns() {
    if (isNative) {
      const res = await this.db.query('SELECT * FROM campaigns')
      return res.values.map((c) => ({
        ...c,
        filter_criteria: JSON.parse(c.filter_criteria || '{}'),
      }))
    } else {
      const data = this.webStore.getItem('campaigns')
      return data ? JSON.parse(data) : []
    }
  }

  async saveCampaign(campaign) {
    const now = new Date().toISOString()
    const campaignToSave = { ...campaign, updated_at: now }

    if (isNative) {
      const filterCriteria = JSON.stringify(campaign.filter_criteria || {})
      const query = `
        INSERT OR REPLACE INTO campaigns (id, user_id, name, status, filter_criteria, message_body, media_asset_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      await this.db.run(query, [
        campaign.id,
        campaign.user_id,
        campaign.name,
        campaign.status,
        filterCriteria,
        campaign.message_body,
        campaign.media_asset_id,
        campaign.created_at || now,
        now,
      ])
    } else {
      const campaigns = await this.getCampaigns()
      const index = campaigns.findIndex((c) => c.id === campaign.id)
      if (index >= 0) {
        campaigns[index] = campaignToSave
      } else {
        campaigns.push(campaignToSave)
      }
      this.webStore.setItem('campaigns', JSON.stringify(campaigns))
    }

    return campaignToSave
  }

  // --- Pending Mutations (for offline queue) ---

  async addPendingMutation(tableName, operation, data) {
    const mutation = {
      id: `mut_${Date.now()}`,
      table_name: tableName,
      operation,
      data: JSON.stringify(data),
      created_at: new Date().toISOString(),
    }

    if (isNative) {
      const query = `
        INSERT INTO pending_mutations (id, table_name, operation, data, created_at)
        VALUES (?, ?, ?, ?, ?)
      `
      await this.db.run(query, [
        mutation.id,
        mutation.table_name,
        mutation.operation,
        mutation.data,
        mutation.created_at,
      ])
    } else {
      const pending = JSON.parse(this.webStore.getItem('pending_mutations') || '[]')
      pending.push(mutation)
      this.webStore.setItem('pending_mutations', JSON.stringify(pending))
    }

    return mutation
  }

  async getPendingMutations() {
    if (isNative) {
      const res = await this.db.query('SELECT * FROM pending_mutations ORDER BY created_at ASC')
      return res.values.map((m) => ({ ...m, data: JSON.parse(m.data || '{}') }))
    } else {
      const data = this.webStore.getItem('pending_mutations')
      return data ? JSON.parse(data) : []
    }
  }

  async clearPendingMutation(mutationId) {
    if (isNative) {
      await this.db.run('DELETE FROM pending_mutations WHERE id = ?', [mutationId])
    } else {
      const pending = await this.getPendingMutations()
      const filtered = pending.filter((m) => m.id !== mutationId)
      this.webStore.setItem('pending_mutations', JSON.stringify(filtered))
    }
  }
}

export const dbService = new DatabaseService()
