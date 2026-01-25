# Birthday Auto-Send Feature Implementation Plan

## Overview

Implement an automated birthday message system that allows retail stores to automatically send birthday vouchers/messages to contacts during their birthday month.

---

## Current State Analysis

### What Exists

- **Frontend scheduling UI** - Date picker, scheduledDate state in ComposeModal.jsx
- **Birthday template** - "Happy Birthday! Stop by the store this week for a special birthday gift on us."
- **Campaign system** - Bulk messaging via TwilioService
- **Template variables** - `{name}` placeholder support

### What's Missing

- Contact birthday field in database
- Automation rules system
- Scheduled messages queue
- Backend processing (edge functions/cron)

---

## Phase 1: Database Schema Changes

### 1.1 Update Contacts Table

Add birthday field to existing contacts:

**Supabase Migration:**

```sql
ALTER TABLE contacts
ADD COLUMN birthday DATE NULL;
```

**Local SQLite (DatabaseService.js):**

- Add `birthday TEXT` to contacts table schema

### 1.2 Create Automation Rules Table

```sql
CREATE TABLE automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL, -- 'birthday_month' (send during birthday month)
  template_id TEXT,
  message_body TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  send_time TEXT DEFAULT '09:00',
  days_offset INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.3 Create Scheduled Messages Queue

```sql
CREATE TABLE scheduled_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  automation_rule_id UUID,
  contact_id UUID NOT NULL,
  phone TEXT NOT NULL,
  message_body TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending', -- pending | processing | sent | failed
  twilio_sid TEXT,
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- Indexes for efficient querying
CREATE INDEX idx_scheduled_messages_status ON scheduled_messages(status, scheduled_for);
CREATE INDEX idx_automation_rules_active ON automation_rules(user_id, is_active);
```

---

## Phase 2: Backend Services

### 2.1 Supabase Edge Functions

| Function                       | Purpose                                 | Schedule          |
| ------------------------------ | --------------------------------------- | ----------------- |
| `process-birthday-automations` | Find matching birthdays, queue messages | Daily at midnight |
| `send-scheduled-messages`      | Process queue, send via Twilio          | Every 5-15 min    |

### 2.2 Processing Logic

**process-birthday-automations:**

1. Get all active automation rules with `trigger_type = 'birthday_month'`
2. Get contacts where birthday month = current month
3. Check if message already queued for this contact/rule/year (prevent duplicates)
4. Create `scheduled_messages` entries for matches
5. Respect `days_offset` and `send_time` settings

**send-scheduled-messages:**

1. SELECT messages WHERE `status = 'pending'` AND `scheduled_for <= NOW()`
2. Mark as 'processing' to prevent double-sends
3. Call Twilio API for each message
4. Update status to 'sent' or 'failed'
5. Store `twilio_sid` for tracking
6. Max 3 retry attempts for failed sends

---

## Phase 3: Frontend Services

### 3.1 New: AutomationService.js

Location: `src/services/AutomationService.js`

```javascript
class AutomationService {
  // CRUD for automation rules
  async getAutomationRules()
  async saveAutomationRule(rule)
  async deleteAutomationRule(id)
  async toggleAutomationRule(id, isActive)

  // Scheduled messages
  async getScheduledMessages(filters)
  async cancelScheduledMessage(id)

  // Preview
  async previewBirthdayMatches(ruleId)

  // Stats
  async getAutomationStats(ruleId)
}
```

### 3.2 Update: DatabaseService.js

- Add `birthday` field to contact operations
- Add CRUD for `automation_rules` table
- Add CRUD for `scheduled_messages` table

### 3.3 Update: SyncService.js

- Add sync for `automation_rules`
- Add sync for `scheduled_messages`

---

## Phase 4: UI Components

### 4.1 Add Birthday Field to Contact Form

**File:** `src/pages/phone/PhoneContactsPage.jsx`

Add date picker to AddContactModal:

```jsx
<div style={{ marginBottom: '20px' }}>
  <label>Birthday (Optional)</label>
  <input
    type="date"
    value={birthday}
    onChange={(e) => setBirthday(e.target.value)}
    style={{ ...existingInputStyles }}
  />
  <span style={{ fontSize: '12px', color: '#666' }}>Used for birthday automation messages</span>
</div>
```

### 4.2 Automations Section in Settings

**File:** `src/pages/phone/PhoneSettingsPage.jsx`

Add "Automations" menu item that opens a modal/section with:

- List automation rules with on/off toggles
- "Add Automation" button
- Stats per rule (sent this month, upcoming)
- Must match existing theme(s)
- Edit/delete actions

### 4.3 New: Add Automation Modal

**File:** `src/components/common/AddAutomationModal.jsx`

Fields:

- Rule name
- Trigger type (Birthday Month / Birthday Day)
- Template selector
- Custom message editor with `{name}` variable support
- Send time picker
- Days offset (send X days before/after)

### 4.4 New: Scheduled Messages Page

**File:** `src/pages/phone/PhoneScheduledPage.jsx`

Features:

- List of upcoming/past scheduled messages
- Filter by status (pending, sent, failed)
- Cancel pending messages
- Retry failed messages

### 4.5 Navigation Updates

Add menu items for "Automations" and "Scheduled Messages" to settings/navigation

---

## Critical Files to Modify

| File                                    | Changes                                      |
| --------------------------------------- | -------------------------------------------- |
| `src/services/DatabaseService.js`       | Add birthday field, new tables, CRUD methods |
| `src/services/SyncService.js`           | Add sync for new tables                      |
| `src/pages/phone/PhoneContactsPage.jsx` | Add birthday field to contact form           |
| `src/data/mockData.js`                  | Add automation templates                     |

---

## New Files to Create

| File                                                       | Purpose                           |
| ---------------------------------------------------------- | --------------------------------- |
| `src/services/AutomationService.js`                        | Automation rules management       |
| `src/components/phone/AutomationsSection.jsx`              | Automation rules UI (in Settings) |
| `src/pages/phone/PhoneScheduledPage.jsx`                   | Scheduled messages UI             |
| `src/components/common/AddAutomationModal.jsx`             | Create/edit automation modal      |
| `src/lib/templateUtils.js`                                 | Variable substitution utilities   |
| `supabase/functions/process-birthday-automations/index.ts` | Daily birthday check              |
| `supabase/functions/send-scheduled-messages/index.ts`      | Queue processor                   |

---

## Implementation Order

1. **Database first** - Add birthday to contacts, create new tables in Supabase and SQLite
2. **Services** - Create AutomationService, update DatabaseService
3. **Backend** - Create edge functions for processing
4. **UI** - Contact birthday field first, then automation pages
5. **Integration** - Connect everything, test end-to-end

---

## Template Variables

Support the following variables in automation messages:

- `{name}` - Full contact name
- `{firstName}` - First name only
- `{year}` - Current year (useful for coupon codes)

---

## Verification Plan

1. **Database:** Run migration, verify tables created correctly
2. **Contact Birthday:** Add contact with birthday, verify stored and synced
3. **Automation Rule:** Create "Birthday Voucher" rule, verify saved
4. **Message Queueing:** Manually trigger job, verify messages queued for matching contacts
5. **Message Sending:** Process queue, verify Twilio sends successfully
6. **End-to-end:** Full flow from contact creation to message delivery

---

## Security Considerations

1. **Row Level Security (RLS):** Add policies for new tables
2. **User Isolation:** All queries must include `user_id` filter
3. **Input Sanitization:** Validate message content before sending
4. **Rate Limiting:** Respect Twilio rate limits in batch processing
