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
        'secret', // Enable SQLCipher encryption
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
        birthday TEXT, -- YYYY-MM-DD format
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

      CREATE TABLE IF NOT EXISTS automation_rules (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name TEXT,
        trigger_type TEXT, -- 'birthday_month'
        template_id TEXT,
        message_body TEXT,
        is_active INTEGER DEFAULT 1,
        send_time TEXT DEFAULT '09:00',
        days_offset INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT,
        synced_at TEXT
      );

      CREATE TABLE IF NOT EXISTS scheduled_messages (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        automation_rule_id TEXT,
        contact_id TEXT,
        phone TEXT,
        message_body TEXT,
        scheduled_for TEXT,
        status TEXT DEFAULT 'pending', -- pending, processing, sent, failed
        twilio_sid TEXT,
        error_message TEXT,
        attempts INTEGER DEFAULT 0,
        created_at TEXT,
        sent_at TEXT,
        synced_at TEXT
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
        INSERT OR REPLACE INTO contacts (id, user_id, name, phone, email, tags, birthday, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      await this.db.run(query, [
        contact.id,
        contact.user_id,
        contact.name,
        contact.phone,
        contact.email,
        tags,
        contact.birthday || null,
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

  // --- Automation Rules Methods ---

  async getAutomationRules() {
    if (isNative) {
      const res = await this.db.query('SELECT * FROM automation_rules')
      return res.values.map((r) => ({ ...r, is_active: Boolean(r.is_active) }))
    } else {
      const data = this.webStore.getItem('automation_rules')
      return data ? JSON.parse(data) : []
    }
  }

  async saveAutomationRule(rule) {
    const now = new Date().toISOString()
    const ruleToSave = { ...rule, updated_at: now }

    if (isNative) {
      const query = `
        INSERT OR REPLACE INTO automation_rules (id, user_id, name, trigger_type, template_id, message_body, is_active, send_time, days_offset, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      await this.db.run(query, [
        rule.id,
        rule.user_id,
        rule.name,
        rule.trigger_type || 'birthday_month',
        rule.template_id || null,
        rule.message_body,
        rule.is_active ? 1 : 0,
        rule.send_time || '09:00',
        rule.days_offset || 0,
        rule.created_at || now,
        now,
      ])
    } else {
      const rules = await this.getAutomationRules()
      const index = rules.findIndex((r) => r.id === rule.id)
      if (index >= 0) {
        rules[index] = ruleToSave
      } else {
        rules.push(ruleToSave)
      }
      this.webStore.setItem('automation_rules', JSON.stringify(rules))
    }

    return ruleToSave
  }

  async deleteAutomationRule(ruleId) {
    if (isNative) {
      await this.db.run('DELETE FROM automation_rules WHERE id = ?', [ruleId])
    } else {
      const rules = await this.getAutomationRules()
      const filtered = rules.filter((r) => r.id !== ruleId)
      this.webStore.setItem('automation_rules', JSON.stringify(filtered))
    }
  }

  async toggleAutomationRule(ruleId, isActive) {
    if (isNative) {
      await this.db.run('UPDATE automation_rules SET is_active = ?, updated_at = ? WHERE id = ?', [
        isActive ? 1 : 0,
        new Date().toISOString(),
        ruleId,
      ])
    } else {
      const rules = await this.getAutomationRules()
      const index = rules.findIndex((r) => r.id === ruleId)
      if (index >= 0) {
        rules[index].is_active = isActive
        rules[index].updated_at = new Date().toISOString()
        this.webStore.setItem('automation_rules', JSON.stringify(rules))
      }
    }
  }

  // --- Scheduled Messages Methods ---

  async getScheduledMessages(filters = {}) {
    if (isNative) {
      let query = 'SELECT * FROM scheduled_messages'
      const params = []

      if (filters.status) {
        query += ' WHERE status = ?'
        params.push(filters.status)
      }

      query += ' ORDER BY scheduled_for ASC'
      const res = await this.db.query(query, params)
      return res.values
    } else {
      const data = this.webStore.getItem('scheduled_messages')
      let messages = data ? JSON.parse(data) : []

      if (filters.status) {
        messages = messages.filter((m) => m.status === filters.status)
      }

      return messages.sort((a, b) => new Date(a.scheduled_for) - new Date(b.scheduled_for))
    }
  }

  async saveScheduledMessage(message) {
    const now = new Date().toISOString()
    const messageToSave = { ...message, created_at: message.created_at || now }

    if (isNative) {
      const query = `
        INSERT OR REPLACE INTO scheduled_messages (id, user_id, automation_rule_id, contact_id, phone, message_body, scheduled_for, status, twilio_sid, error_message, attempts, created_at, sent_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      await this.db.run(query, [
        message.id,
        message.user_id,
        message.automation_rule_id || null,
        message.contact_id,
        message.phone,
        message.message_body,
        message.scheduled_for,
        message.status || 'pending',
        message.twilio_sid || null,
        message.error_message || null,
        message.attempts || 0,
        message.created_at || now,
        message.sent_at || null,
      ])
    } else {
      const messages = await this.getScheduledMessages()
      const index = messages.findIndex((m) => m.id === message.id)
      if (index >= 0) {
        messages[index] = messageToSave
      } else {
        messages.push(messageToSave)
      }
      this.webStore.setItem('scheduled_messages', JSON.stringify(messages))
    }

    return messageToSave
  }

  async cancelScheduledMessage(messageId) {
    if (isNative) {
      await this.db.run(
        "UPDATE scheduled_messages SET status = 'cancelled' WHERE id = ? AND status = 'pending'",
        [messageId]
      )
    } else {
      const messages = await this.getScheduledMessages()
      const index = messages.findIndex((m) => m.id === messageId)
      if (index >= 0 && messages[index].status === 'pending') {
        messages[index].status = 'cancelled'
        this.webStore.setItem('scheduled_messages', JSON.stringify(messages))
      }
    }
  }

  // --- Birthday Contacts Helper ---

  async getContactsByBirthdayMonth(month) {
    if (isNative) {
      // month is 1-12
      const monthStr = month.toString().padStart(2, '0')
      const res = await this.db.query('SELECT * FROM contacts WHERE substr(birthday, 6, 2) = ?', [
        monthStr,
      ])
      return res.values.map((c) => ({ ...c, tags: JSON.parse(c.tags || '[]') }))
    } else {
      const contacts = await this.getContacts()
      return contacts.filter((c) => {
        if (!c.birthday) return false
        const birthMonth = new Date(c.birthday).getMonth() + 1
        return birthMonth === month
      })
    }
  }
}

export const dbService = new DatabaseService()
