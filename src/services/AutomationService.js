import { dbService } from './DatabaseService'

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
