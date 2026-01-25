# MessageHub Development Instructions

## Project Overview

MessageHub is a marketing/messaging platform with a phone-style UI. It includes an AI Studio for creating marketing content, campaign management, contact management, and messaging features.

## Tech Stack

- **Framework:** React (Vite)
- **Styling:** Tailwind CSS + inline styles for phone UI theming
- **UI Components:** Radix UI primitives (`src/components/ui/`)
- **Backend:** Supabase (auth, database, storage, edge functions)
- **Mobile:** Capacitor for native builds
- **State:** React hooks (no Redux/Zustand)

## Key Architecture Patterns

### Services (`src/services/`)

All services follow this pattern:

```javascript
class ServiceName {
  async methodName() {
    try {
      // logic
      return { success: true, data: result }
    } catch (error) {
      console.error('Error:', error)
      return { success: false, error: error.message }
    }
  }
}
export const serviceName = new ServiceName()
```

**Existing Services:**

- `DatabaseService.js` - Local SQLite/localStorage abstraction
- `MediaLibraryService.js` - Media asset storage (has demo mode fallback)
- `AIService.js` - AI content generation (mock, ready for Gemini/OpenAI)
- `AutomationService.js` - Automation rules and scheduled messages
- `TwilioService.js` - SMS via Supabase Edge Functions
- `SyncService.js` - Local ↔ Supabase sync

### Hooks (`src/hooks/`)

Custom hooks for reusable logic:

- `useLayerManager.js` - Multi-layer canvas state management
- `useCanvasEditor.js` - Combined canvas editor with AI integration
- `useWindowSize.js`, `useDebounce.js`, `useLocalStorage.js`, etc.

All hooks exported from `src/hooks/index.js`.

### Components

**UI Primitives (`src/components/ui/`):**

- Radix UI-based: Button, Input, Dialog, Sheet, Tabs, etc.
- Use `cn()` utility for class composition

**Common Components (`src/components/common/`):**

- Reusable across the app: ComposeModal, MarketingAIModal, MessageBubble, etc.

**Phone Pages (`src/pages/phone/`):**

- PhoneDashboardPage.jsx - Main dashboard with AI Studio (AIStudioFullScreen component embedded)
- PhoneChatsPage.jsx - Messaging interface
- PhoneContactsPage.jsx - Contact management
- PhoneSettingsPage.jsx - Settings

### Theming

Phone UI uses inline styles with theme objects:

```javascript
const themes = {
  cyanDark: { bg, cardBg, cardBorder, accent, text, textMuted, isDark: true },
  purpleDark: { ... },
  cyanLight: { ..., isDark: false },
  purpleLight: { ... }
}
```

Access via `t.accent`, `t.cardBg`, etc.

## AI Studio Architecture

### Components

1. **AIStudioFullScreen** (in PhoneDashboardPage.jsx) - Full-featured editor
   - Platform presets (Instagram, Facebook, TikTok, etc.)
   - Marketing template library
   - Multi-layer text support
   - High-resolution export

2. **MarketingAIModal** (src/components/common/) - Simple modal version
   - Image-based canvas sizing
   - Single text overlay
   - Quick ad creation

### Layer System

```javascript
const layer = {
  id: string,
  type: 'text' | 'image' | 'background',
  name: string,
  visible: boolean,
  locked: boolean,
  zIndex: number,
  data: {
    /* type-specific: text, x, y, color, fontSize, etc. */
  },
}
```

### Canvas Utilities (`src/lib/canvasUtils.js`)

- `drawBackground()`, `drawText()`, `drawImage()`
- `drawTemplateElements()`, `drawGrid()`
- `createExportCanvas()` for high-res export

### Platform Templates (`src/lib/platformTemplates.js`)

- `platformPresets` - Dimensions for social platforms
- `marketingTemplates` - Pre-built design templates
- `gradientPresets` - Background gradients
- `scaleToFit()` - Scaling utility

## Coding Conventions

### File Naming

- Components: PascalCase (`MarketingAIModal.jsx`)
- Hooks: camelCase with `use` prefix (`useLayerManager.js`)
- Services: PascalCase (`AIService.js`)
- Utilities: camelCase (`canvasUtils.js`)

### Imports

Use path aliases:

```javascript
import { Button } from '@/components/ui/button'
import { aiService } from '@/services/AIService'
import { useLayerManager } from '@/hooks/useLayerManager'
```

### Error Handling

- Services return `{ success, data, error }` tuples
- Use try-catch with console.error logging
- Toast notifications via `sonner`: `toast.success()`, `toast.error()`

### Demo Mode

When Supabase isn't configured, services should fall back to mock data:

```javascript
import { isSupabaseConfigured } from '@/lib/supabase'

if (!isSupabaseConfigured) {
  // Return mock data
}
```

## Key Files Reference

| File                                         | Purpose                                           |
| -------------------------------------------- | ------------------------------------------------- |
| `src/pages/phone/PhoneDashboardPage.jsx`     | Main dashboard + AIStudioFullScreen (~2500 lines) |
| `src/components/common/MarketingAIModal.jsx` | Simple AI ad creator modal                        |
| `src/services/AIService.js`                  | AI content generation service                     |
| `src/hooks/useLayerManager.js`               | Multi-layer state management                      |
| `src/hooks/useCanvasEditor.js`               | Combined canvas editor hook                       |
| `src/lib/canvasUtils.js`                     | Canvas drawing utilities                          |
| `src/lib/platformTemplates.js`               | Social platform presets & templates               |
| `src/lib/supabase.js`                        | Supabase client configuration                     |

## Testing Checklist

When modifying AI Studio:

- [ ] AI generation works (mock returns expected data)
- [ ] Text overlay drag works
- [ ] Platform presets apply correctly
- [ ] Marketing templates render
- [ ] High-res export maintains quality
- [ ] Multiple text layers can be added
- [ ] Layers are independently selectable
- [ ] Export includes all visible layers

## Future Considerations

1. **Real AI Integration** - AIService is ready for Gemini/OpenAI via `setProvider()`
2. **Undo/Redo** - Can be added to useLayerManager
3. **More Layer Types** - Shapes, stickers, filters
4. **Collaboration** - Real-time editing via Supabase Realtime

---

# Comprehensive Coding Practices

## Core Principles

**NEVER ASSUME. ALWAYS VERIFY.**
Enforce exhaustive verification practices to prevent incomplete implementations, missed hardcoded values, and unintentional code removal.

**THINK ARCHITECTURALLY. BUILD FOR SCALE.**
Balance thoroughness with modern, scalable architecture. Don't just implement literally—consider efficiency, scalability, and creative synthesis.

## Architectural Decision Framework

### Before Writing Any Code

**1. Scale Analysis**

- How does this scale to 100x users? 1000x? 1M+?
- What are the performance implications?
- Will this approach bottleneck at scale?
- Are there memory, network, or computational constraints?

**2. Modern Library Assessment**

- Does a battle-tested library already solve this?
- What are current best practices for this problem?
- Am I reinventing a wheel that exists in a modern, maintained package?

**3. Architectural Flow**

- How does this fit into the overall system architecture?
- What's the data flow from start to finish?
- Are there better architectural patterns for this use case?
- Does this follow separation of concerns and single responsibility?

**4. Creative Synthesis**

- User asked for X, but is Y a better solution?
- Can I achieve the goal more efficiently?
- Should I suggest a better approach while still honoring the request?

### When to Suggest Alternatives

Always suggest better approaches when:

- User's request would create performance bottlenecks at scale
- A modern library solves it better than custom implementation
- The architectural pattern doesn't align with best practices

How to suggest:

1. Acknowledge the request
2. Explain the scalability/efficiency concern
3. Propose the better approach
4. Offer to implement their original way if they prefer
5. Explain tradeoffs clearly

## Critical Rules

### 1. Complete Line-by-Line Analysis

When working with code, search and analyze the ENTIRE codebase that is directly connected to the work:

- Read every line of every file being modified
- Search for ALL occurrences of patterns, not just obvious ones
- Continue searching until you have verified there are no more instances
- Never stop after finding "some" instances - find ALL instances

### 2. Zero Hardcoded Values

NEVER hardcode any values in code:

- No hardcoded colors (hex codes, RGB, color names)
- No hardcoded sizes, dimensions, or spacing
- No hardcoded text strings or labels
- No hardcoded configurations or presets
- No hardcoded API endpoints or URLs
- No hardcoded default states or initial values

Instead use: configuration files, environment variables, user-provided inputs, theme/styling systems, clearly documented constants.

### 3. Import Investigation Protocol

Before removing ANY import or dependency:

1. Search where the import is used in the file
2. Check if it's used indirectly (passed to functions, used in types, etc.)
3. Verify if it was recently added as part of current work
4. Check related files that might depend on it
5. Only remove if you can prove it's genuinely unused

NEVER remove an import just because a linter says it's unused without manual verification.

### 4. Feature Implementation Verification

When implementing a feature, verify COMPLETE integration:

- Implementation exists in the correct location
- Feature is properly imported where needed
- Feature is called/invoked in the right places
- Feature is connected to UI/API/data flow as required
- Feature has all necessary dependencies
- Feature actually works in the full pipeline

### 5. Removal Verification Protocol

**Phase 1 - Initial Search:**

1. Search for direct occurrences
2. Document what you find
3. Remove all found instances

**Phase 2 - Deep Verification:** 4. Search again using different patterns/variations 5. Check related file types (styles, configs, types, tests) 6. Search for the concept, not just exact text 7. Verify removal was actually complete

**Phase 3 - Pattern Search:** 8. Look for similar patterns that should also be removed 9. Check if the same concept appears elsewhere 10. Document final count of removals

## AI-Specific Mitigations

### 1. Context Window & Conversation Consistency

**Maintain a Decision Log:**

```markdown
## Current Implementation State

- Feature X: Implemented in files A, B, C using library Y
- Color system: Using theme provider
- Authentication: Using NextAuth with database sessions
```

**Consistency Checks:**

- Before making any change, check if it contradicts earlier decisions
- If it does, explicitly call it out
- Update the decision log after implementing

**Conversation Checkpoints:**
Every 10-15 messages or major feature, provide a summary of:

- What's been implemented
- Current architectural decisions
- Remaining work

### 2. File Size & Complexity Awareness

**Always Check File Size First:**

- Under 200 lines: Standard approach
- 200-500 lines: Extra caution on side effects
- 500-1000 lines: Mandatory dependency mapping
- 1000+ lines: Should probably be refactored, suggest splitting

**Large File Protocol (500+ lines):**

1. Create a dependency map of functions/components
2. Search for all uses of what you're modifying
3. Test/verify in smaller increments
4. Consider suggesting refactoring

### 3. Breaking Changes Detection

Before ANY modification that changes function signatures, component props, API endpoints, data structures, or export names:

**Step 1 - Dependency Search:**

```bash
grep -r "functionName" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx"
```

**Step 2 - Impact Analysis:**
List every file that imports or uses the changing code

**Step 3 - Update Plan:**
Document original signature, new signature, every location needing update

**Step 4 - Verification:**
After change, verify each dependent file was updated

**Warning Communication:**
"⚠️ This change modifies the function signature, which will break 3 files: A.js, B.js, C.js. I'll update all of them, but please test thoroughly."

### 4. Edge Cases & Error States

For EVERY implementation, verify these cases:

**Data Edge Cases:**

- [ ] Empty arrays/lists `[]`
- [ ] Null/undefined values
- [ ] Empty strings `""`
- [ ] Zero/negative numbers
- [ ] Very large numbers (overflow)
- [ ] Special characters in strings
- [ ] Malformed data

**State Edge Cases:**

- [ ] Loading states (show spinners/skeletons)
- [ ] Error states (network failures, API errors)
- [ ] Empty states (no data yet)
- [ ] Permission denied states
- [ ] Unauthenticated states

**Interaction Edge Cases:**

- [ ] Rapid clicking/double submits
- [ ] Forms with validation errors
- [ ] Concurrent operations
- [ ] Race conditions

**Network Edge Cases:**

- [ ] Slow connections (timeouts)
- [ ] Offline scenarios
- [ ] Failed requests (4xx, 5xx)

**UI Edge Cases:**

- [ ] Very long text (overflow/truncation)
- [ ] Mobile vs desktop
- [ ] Different screen sizes
- [ ] Accessibility (keyboard nav, screen readers)

**Implementation Pattern:**

```javascript
// ❌ WRONG - Only happy path
const data = await fetchData()
return <Display data={data} />

// ✓ RIGHT - All states covered
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  fetchData()
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false))
}, [])

if (loading) return <Spinner />
if (error) return <ErrorDisplay error={error} />
if (!data || data.length === 0) return <EmptyState />
return <Display data={data} />
```

### 5. Testing & Verification Before Claims

**NEVER claim completion without verification.**

**For Every Implementation:**

1. **Syntax Verification** - Run linter, check TypeScript
2. **Execution Verification** - Actually run the code
3. **Integration Testing** - Test in full workflow
4. **Error Scenario Testing** - Test with invalid inputs, empty data, failures

**Communication Rules:**

- ❌ Never say: "This should work", "This will work", "It's done" (without testing)
- ✓ Instead say: "I've implemented X and verified it by running Y. Output shows Z."

**If you can't fully test:**
"I've implemented X but cannot fully test without [database/API/credentials]. Please test that [specific scenarios] work as expected."

## Workflow for Code Modifications

### Step 0: Architectural Design (ALWAYS FIRST)

- Assess the optimal approach for scale
- Check for modern libraries
- Present alternatives if needed
- Design for maintainability

### Step 1: Understand the Full Context

- Read entire file(s) being modified
- Identify all related files
- Understand the full workflow/pipeline
- Map dependencies and connections

### Step 2: Plan the Changes

- List all files to be touched
- Identify all modification locations
- Note hardcoded values to make configurable
- Anticipate integration points

### Step 3: Implement with Verification

- Use modern, efficient patterns
- After each change, verify completeness
- Search for related instances
- Test nothing was missed

### Step 4: Mandatory Self-Review

- Re-read ALL modified code line by line
- Search for remaining hardcoded values
- Verify all imports are necessary
- Check feature integration is complete
- Confirm scalability considerations

### Step 5: Explicit Verification Statement

- List what was changed
- List what was searched for
- State: "I have verified X by searching Y and found Z instances"
- Acknowledge potential additional occurrences

## Common Failure Modes to Avoid

| Failure Mode        | Wrong                                          | Right                                                |
| ------------------- | ---------------------------------------------- | ---------------------------------------------------- |
| Partial Search      | Find 16 colors, declare complete               | Find 16, search again, find 40+ more                 |
| Trusting Linters    | ESLint says unused → delete                    | Investigate why → verify → then remove               |
| No Integration      | Add code, say "implemented"                    | Add → import → connect → verify E2E                  |
| Assuming Completion | "I've removed all presets"                     | "Found 47 presets in [locations]... searching again" |
| Over-Literal        | Implement exactly as asked even if won't scale | Suggest better approach, let user decide             |
| Reinventing Wheels  | 200 lines custom validation                    | Use Zod - battle-tested, handles edge cases          |
| Context Amnesia     | Contradict earlier decisions                   | Maintain decision log, check consistency             |
| Happy Path Only     | No loading/error/empty states                  | Use edge case checklist, implement all states        |
| Untested Claims     | "This should work"                             | "I tested by running X, results show Y"              |

## Mandatory Checklist for Every Task

### Before Starting

- [ ] Review decision log for consistency
- [ ] Consider architectural approach and scalability
- [ ] Identify modern libraries that could help
- [ ] Assess if literal request is optimal solution
- [ ] Understand complete scope
- [ ] Check file sizes (flag >500 lines)
- [ ] Map workflow/pipeline

### During Implementation

- [ ] Use modern libraries and patterns
- [ ] Implement for scale and performance
- [ ] No hardcoded values
- [ ] Verify each change as made
- [ ] Search exhaustively for all instances
- [ ] Implement ALL edge cases
- [ ] Check for breaking changes

### Before Claiming Completion

- [ ] Actually RUN the code
- [ ] Test edge cases and error scenarios
- [ ] Verify architectural alignment
- [ ] Re-read all modified code
- [ ] Search for breaking changes
- [ ] Search again for hardcoded values
- [ ] Verify all imports necessary
- [ ] Confirm complete integration
- [ ] Run linter and type checker
- [ ] Update decision log
- [ ] Provide explicit verification statement

### When Removing Code

- [ ] Search multiple times with different patterns
- [ ] Check related files
- [ ] Verify nothing dependent was broken
- [ ] Document what was found and removed

## Integration Checklist for New Features

- [ ] Checked consistency with earlier decisions
- [ ] Architectural pattern chosen for scalability
- [ ] Modern libraries selected where appropriate
- [ ] File sizes checked, large file dependencies mapped
- [ ] Breaking changes searched
- [ ] Code in correct location
- [ ] Imports added where needed
- [ ] Feature called/invoked correctly
- [ ] Connected to data sources efficiently
- [ ] UI elements updated
- [ ] State management integrated
- [ ] Event handlers connected
- [ ] Error handling (ALL scenarios)
- [ ] Loading states implemented
- [ ] Empty states implemented
- [ ] Edge cases handled
- [ ] Dependencies installed
- [ ] Performance optimized
- [ ] Code RUN and TESTED
- [ ] Linter/type checker passed
- [ ] Feature tested in full workflow
- [ ] No hardcoded values
- [ ] Decision log updated
