import { dbService } from './DatabaseService'
import { twilioService } from './TwilioService'

class AutomationService {
  // --- Automation Rules ---

  async getAutomationRules() {
    return dbService.getAutomationRules()
  }

  async saveAutomationRule(rule) {
    const ruleToSave = {
      ...rule,
      id: rule.id || `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      trigger_type: 'birthday_month', // Only birthday_month for now
    }
    return dbService.saveAutomationRule(ruleToSave)
  }

  async deleteAutomationRule(ruleId) {
    return dbService.deleteAutomationRule(ruleId)
  }

  async toggleAutomationRule(ruleId, isActive) {
    return dbService.toggleAutomationRule(ruleId, isActive)
  }

  // --- Scheduled Messages ---

  async getScheduledMessages(filters = {}) {
    return dbService.getScheduledMessages(filters)
  }

  async cancelScheduledMessage(messageId) {
    return dbService.cancelScheduledMessage(messageId)
  }

  // --- Birthday Processing ---

  async getContactsWithBirthdayThisMonth() {
    const currentMonth = new Date().getMonth() + 1 // 1-12
    return dbService.getContactsByBirthdayMonth(currentMonth)
  }

  async queueBirthdayMessages(ruleId) {
    const rules = await this.getAutomationRules()
    const rule = rules.find((r) => r.id === ruleId)

    if (!rule || !rule.is_active) {
      return { success: false, error: 'Rule not found or inactive' }
    }

    const contacts = await this.getContactsWithBirthdayThisMonth()
    const existingMessages = await this.getScheduledMessages()

    // Get current year to prevent duplicate sends
    const currentYear = new Date().getFullYear()

    let queued = 0
    for (const contact of contacts) {
      // Check if already queued for this contact/rule/year
      const alreadyQueued = existingMessages.some(
        (m) =>
          m.automation_rule_id === ruleId &&
          m.contact_id === contact.id &&
          new Date(m.created_at).getFullYear() === currentYear
      )

      if (alreadyQueued) continue

      // Substitute variables in message
      const messageBody = this.substituteVariables(rule.message_body, contact)

      // Calculate scheduled time (first day of current month at send_time)
      const now = new Date()
      const [hours, minutes] = (rule.send_time || '09:00').split(':').map(Number)
      const scheduledFor = new Date(
        now.getFullYear(),
        now.getMonth(),
        1 + (rule.days_offset || 0),
        hours,
        minutes
      )

      // If scheduled time is in the past, schedule for tomorrow at send_time
      if (scheduledFor < now) {
        scheduledFor.setDate(now.getDate() + 1)
      }

      await dbService.saveScheduledMessage({
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: rule.user_id,
        automation_rule_id: ruleId,
        contact_id: contact.id,
        phone: contact.phone,
        message_body: messageBody,
        scheduled_for: scheduledFor.toISOString(),
        status: 'pending',
      })

      queued++
    }

    return { success: true, queued, total: contacts.length }
  }

  // --- Template Variable Substitution ---

  substituteVariables(template, contact, _context = {}) {
    if (!template) return ''

    return template
      .replace(/{name}/g, contact.name || '')
      .replace(/{firstName}/g, (contact.name || '').split(' ')[0] || '')
      .replace(/{phone}/g, contact.phone || '')
      .replace(/{email}/g, contact.email || '')
      .replace(/{year}/g, new Date().getFullYear().toString())
  }

  // --- Startup Automation ---

  async processAllBirthdayRules() {
    try {
      const rules = await this.getAutomationRules()
      const activeRules = rules.filter((r) => r.is_active)

      let totalQueued = 0
      for (const rule of activeRules) {
        const result = await this.queueBirthdayMessages(rule.id)
        if (result.success) {
          totalQueued += result.queued
        }
      }

      if (totalQueued > 0) {
        console.log(`Birthday automation: queued ${totalQueued} messages`)
      }

      return { success: true, queued: totalQueued }
    } catch (error) {
      console.error('Error processing birthday rules:', error)
      return { success: false, error: error.message }
    }
  }

  async processScheduledMessageQueue() {
    try {
      const pendingMessages = await this.getScheduledMessages({ status: 'pending' })
      const now = new Date()

      const readyMessages = pendingMessages.filter(
        (m) => new Date(m.scheduled_for) <= now
      )

      if (readyMessages.length === 0) return { sent: 0, failed: 0 }

      let sent = 0
      let failed = 0

      for (const message of readyMessages) {
        // Mark as processing
        await dbService.saveScheduledMessage({
          ...message,
          status: 'processing',
          attempts: (message.attempts || 0) + 1,
        })

        try {
          await twilioService.sendMessage(message.phone, message.message_body)

          // Mark as sent
          await dbService.saveScheduledMessage({
            ...message,
            status: 'sent',
            sent_at: new Date().toISOString(),
            attempts: (message.attempts || 0) + 1,
          })

          sent++
          console.log(`Sent scheduled message to ${message.phone}`)
        } catch (sendError) {
          const newAttempts = (message.attempts || 0) + 1
          const newStatus = newAttempts >= 3 ? 'failed' : 'pending'

          await dbService.saveScheduledMessage({
            ...message,
            status: newStatus,
            error_message: sendError.message,
            attempts: newAttempts,
          })

          if (newStatus === 'failed') failed++
          console.error(`Failed to send message to ${message.phone}:`, sendError.message)
        }
      }

      return { sent, failed }
    } catch (error) {
      console.error('Error processing scheduled message queue:', error)
      return { sent: 0, failed: 0 }
    }
  }

  runStartupAutomation() {
    // Queue birthday messages and process queue on startup
    this.processAllBirthdayRules().then(() => {
      this.processScheduledMessageQueue()
    })

    // Check queue every 5 minutes
    const intervalId = setInterval(() => {
      this.processScheduledMessageQueue()
    }, 5 * 60 * 1000)

    // Return cleanup function
    return () => clearInterval(intervalId)
  }

  // --- Stats ---

  async getAutomationStats(ruleId) {
    const messages = await this.getScheduledMessages()
    const ruleMessages = messages.filter((m) => m.automation_rule_id === ruleId)

    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()

    return {
      total: ruleMessages.length,
      pending: ruleMessages.filter((m) => m.status === 'pending').length,
      sent: ruleMessages.filter((m) => m.status === 'sent').length,
      failed: ruleMessages.filter((m) => m.status === 'failed').length,
      sentThisMonth: ruleMessages.filter((m) => {
        if (m.status !== 'sent' || !m.sent_at) return false
        const sentDate = new Date(m.sent_at)
        return sentDate.getMonth() === thisMonth && sentDate.getFullYear() === thisYear
      }).length,
    }
  }
}

export const automationService = new AutomationService()
