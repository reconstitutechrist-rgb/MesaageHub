# MessageHub Migration Files

These files implement Phase 1-4 of the MessageHub migration plan. Copy them into your existing repository at the specified paths.

## File Overview

### New UI Components

| File           | Path                             | Description                                        |
| -------------- | -------------------------------- | -------------------------------------------------- |
| `checkbox.jsx` | `src/components/ui/checkbox.jsx` | shadcn/ui Checkbox (required by RecipientSelector) |

### New Common Components

| File                    | Path                                          | Description                                                  |
| ----------------------- | --------------------------------------------- | ------------------------------------------------------------ |
| `VirtualList.jsx`       | `src/components/common/VirtualList.jsx`       | Performance virtualization for large lists (Phase 4)         |
| `RecipientSelector.jsx` | `src/components/common/RecipientSelector.jsx` | Campaign recipient selection with filtering (Phase 2)        |
| `MarketingAIModal.jsx`  | `src/components/common/MarketingAIModal.jsx`  | **Replaces existing** - Hybrid Rendering AI Studio (Phase 3) |
| `index.js`              | `src/components/common/index.js`              | **Replaces existing** - Updated exports                      |

### New Services

| File                 | Path                              | Description                               |
| -------------------- | --------------------------------- | ----------------------------------------- |
| `DatabaseService.js` | `src/services/DatabaseService.js` | SQLite/localStorage abstraction (Phase 1) |
| `SyncService.js`     | `src/services/SyncService.js`     | Data sync engine (Phase 1)                |
| `TwilioService.js`   | `src/services/TwilioService.js`   | Twilio messaging via Supabase (Phase 2)   |

### Updated Pages

| File                    | Path                              | Description                                                            |
| ----------------------- | --------------------------------- | ---------------------------------------------------------------------- |
| `ContactsPage.jsx`      | `src/pages/ContactsPage.jsx`      | **Replaces existing** - Integrated VirtualList, preserved all features |
| `ConversationsPage.jsx` | `src/pages/ConversationsPage.jsx` | **Replaces existing** - Dual workflow (Direct + Campaign)              |

## Installation Steps

### 1. Install Dependencies

```bash
# Capacitor (Phase 1)
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npm install @capacitor-community/sqlite
npm install @capacitor/network

# Already installed (verify)
npm install @radix-ui/react-checkbox
```

### 2. Copy Files

```bash
# Create services directory if it doesn't exist
mkdir -p src/services

# Copy all files from this package to your repository
cp -r src/* /path/to/your/messagehub/src/
```

### 3. Initialize Capacitor (when ready for native)

```bash
npx cap init MessageHub com.yourcompany.messagehub
npx cap add android
npx cap add ios
```

### 4. Initialize Services (in App.jsx or main entry)

```jsx
import { dbService } from '@/services/DatabaseService'
import { syncService } from '@/services/SyncService'

// In your app initialization
useEffect(() => {
  const initServices = async () => {
    await dbService.initialize()
    await syncService.initialize()
  }
  initServices()
}, [])
```

## What Changed

### MarketingAIModal.jsx (REPLACEMENT)

- **Before**: Chat-based AI interface
- **After**: Hybrid Rendering (Gemini 3 Flash + Canvas)
  - Upload product image
  - AI generates headlines + styling
  - Editable text overlay with drag-and-drop
  - Export as image

### ContactsPage.jsx (REPLACEMENT)

- **Preserved**: Tabs (All/Online/Blocked), delete, block/unblock, debounced search, form validation, ConfirmDialog
- **Added**: VirtualList for performance with large contact lists

### ConversationsPage.jsx (REPLACEMENT)

- **Preserved**: Voice recording, file attachments, templates, scheduling, AI Studio
- **Added**:
  - Dual workflow (Direct vs Campaign mode)
  - RecipientSelector integration
  - TwilioService integration
  - Campaign variable hints ({name})

### common/index.js (REPLACEMENT)

- **Added exports**: `VirtualList`, `RecipientSelector`
- **Fixed**: `LoadingPage` export was missing in provided file

## Backend Requirements

For TwilioService to work, you need these Supabase Edge Functions:

1. `send-twilio-message` - Sends individual SMS/WhatsApp messages
2. `launch-twilio-campaign` - Processes bulk campaign sends
3. `get-campaign-stats` - Returns delivery statistics

## Notes

- All files use existing Tailwind patterns and CSS variables
- All files respect the CyanPhoneLayout/PurplePhoneLayout theming
- Dark/light mode support is maintained
- No existing functionality was removed
