# Master Layout Redesign Workflow

This workflow guides Antigravity agents through a rigorous process of redesigning application layouts, ensuring premium aesthetics, functionality preservation, and system consistency.

## UI DESIGN CONTRACT (DO NOT VIOLATE)

1. **NO GENERIC DEFAULTS**: Do not use default Tailwind/CSS styling without intentional design choices. Every color, font, spacing value, and layout decision must be a deliberate choice, not a framework default. Do not use: plain white backgrounds with gray borders, default blue links, Inter/Arial/Roboto/system fonts, or standard rounded-md shadow-sm button styling.

2. **DESIGN SYSTEM FIRST**: Before writing any component code, a design system must exist. If one has already been established for this project, use it — do not redefine it during page-level work. If no design system exists yet, define the visual language before proceeding: primary/secondary/accent colors, font families (display and body), spacing scale, border treatments, shadow styles, and interactive state styles (hover, active, disabled). Present this as a set of CSS variables or Tailwind config values. All components must use the design system — no one-off values.

3. **PRESERVE ALL FUNCTIONALITY**: When redesigning existing UI, every button, link, form input, navigation item, toggle, dropdown, and interactive element that exists in the current version must exist in the redesigned version. Do not remove any interactive element. If you believe an element should be removed or relocated, ask first.

4. **UI ELEMENT INVENTORY**: Before redesigning any page, produce a numbered list of every interactive element on that page: buttons, links, form fields, toggles, dropdowns, navigation items, icons that are clickable, and any other element the user can interact with. This inventory is your checklist. Every item must appear in the redesigned version.

5. **NO HARDCODED CONTENT**: Do not use placeholder names, fake numbers, dummy text, or static content where dynamic data should appear. If a component displays a username, it must pull from the actual user data. If it shows a count, it must count the actual items. If real data is not yet connected, render nothing or a loading state — never fake data that looks real. The only exception is when the prompt explicitly says to use placeholder content.

6. **DYNAMIC DATA CONNECTIONS**: When redesigning a page that already displays real data, verify that the redesigned version connects to the same data sources. Read the current component code to trace where data comes from (props, API calls, database queries, context, state) and ensure the redesigned version uses the same data connections. Do not replace a working data fetch with hardcoded content.

7. **COMPLETE PAGES**: Every page must include all standard navigation and UX elements appropriate to its context:
    - **Navigation**: Can the user get to every other page they should be able to reach from here?
    - **Back navigation**: Can the user go back to where they came from?
    - **Actions**: Can the user do everything they need to do on this page?
    - **Empty states**: What does the user see when there's no data?
    - **Loading states**: What does the user see while data is being fetched?
    - **Error feedback**: What does the user see when something goes wrong?
    Report any missing elements rather than silently omitting them.

8. **RESPONSIVE BY DEFAULT**: All layouts must work on mobile, tablet, and desktop unless the prompt specifies a single target. Run the code and verify the layout at standard breakpoints (mobile: 375px, tablet: 768px, desktop: 1280px).

9. **VISUAL HIERARCHY**: Every page must have a clear visual hierarchy — the user should immediately understand what's most important, what actions are available, and how the page is organized. Use size, weight, color, and spacing to create hierarchy, not just positioning.

10. **CONSISTENCY**: All pages in the app must use the same design system. Do not introduce new colors, fonts, spacing values, or component styles on individual pages. If a new element is needed, define it as part of the design system first.

=== END CONTRACT ===

## Step 1: UI Audit

### UI AUDIT PROMPT

**ROLE**: You are auditing the current UI of an existing app before redesigning it. Do NOT make any changes. Only catalog.

**INSTRUCTIONS**:
1. Read every page and component file in the project.
2. For each page, catalog:

   **PAGE**: [route/path]
   **PURPOSE**: [what the user does here — one sentence]
   
   **INTERACTIVE ELEMENTS**:
   [Numbered list of every button, link, form field, toggle, dropdown, navigation item, and clickable element]
   1. [element type] — [what it does] — [location on page]
   ...
   
   **DATA DISPLAYED**:
   [Every piece of dynamic data and its source]
   - [data item] — source: [prop/API call/database query/context/state]
   ...
   
   **NAVIGATION**:
   - Can reach: [pages navigable from here]
   - Back to: [back/cancel navigation]

3. If the app has more than ~8 pages, save the audit as a file in the project and continue auditing in batches.
4. After all pages are audited, provide a summary:
   - Total pages and total interactive elements
   - Pages missing standard UX elements (no back button, no empty state, no error handling)
   - Any hardcoded/placeholder content that should be dynamic
5. Save the complete audit as a file in the project.
6. **STOP**. Wait for the user to review before proceeding.

## Step 2: Design Direction

### DESIGN DIRECTION PROMPT

**ROLE**: You are establishing the visual identity for this app. Do NOT write any component code yet. Only define the design system.

**YOU ARE TO DISCUSS DESIGN PREFERENCES WITH USER**:
[Ask the user their opinions on the items below. They can leave blank anything they don't care about.]
- **Mood/feeling**: [e.g., professional, playful, minimal, bold, warm, technical, luxurious]
- **Light or dark theme**: [preference or "your choice"]
- **Color preferences**: [any colors you like or want to avoid, or "your choice"]
- **Inspiration**: [any apps, websites, or designs you like the look of, or "none"]
- **Constraints**: [anything that must be a certain way, e.g., "must match brand colors #XX #XX"]

**INSTRUCTIONS**:
1. You already know what this app does from the audit. Based on the app's purpose and the user's preferences, choose a bold, intentional design direction. Do not pick safe/generic options.
2. Define the complete design system:
   - **Color palette**: primary, secondary, accent, background, surface, text (specific hex values, including hover/active variants)
   - **Typography**: display font and body font (distinctive, interesting fonts — not Inter, Roboto, Arial, or system defaults). Sizes for headings, body, small text, labels.
   - **Spacing**: base unit and scale
   - **Border radius**: consistent approach (sharp, slightly rounded, or fully rounded — pick one)
   - **Shadows**: approach to elevation (flat, subtle, dramatic — pick one)
   - **Interactive states**: hover, active, focus, disabled for buttons, links, inputs
   - **Component patterns**: cards, lists, modals, forms, navigation
3. Set up font loading — add the necessary imports so the chosen fonts actually render. Do not just specify font names.
4. Save the design system as CSS variables or Tailwind config in the project.

## Step 3: Page-by-Page Redesign

### PAGE REDESIGN PROMPT

**ROLE**: You are redesigning this app's pages one at a time using the design system you created. You must preserve all functionality and interactive elements documented in the audit you produced.

**INSTRUCTIONS**:
1. Start with [specific page route, or "the main/most important page"].
2. Re-read the audit entry for this page. The audit's **INTERACTIVE ELEMENTS** list is your checklist — every item must appear in the redesigned version.
3. Re-read the current page code and all components it imports.
4. Before writing any code, describe your redesign plan in plain language:
   - **Layout approach**
   - **Where each interactive element from the audit will be placed**
   - **How the visual hierarchy will work**
   - **Any new UX elements you recommend adding** (e.g., missing back button, empty state the audit flagged)
5. Wait for approval before coding.
6. When coding:
   - Apply the design system — use the defined variables/classes, not one-off values
   - Preserve every data connection from the audit
   - Preserve every interactive element from the audit
   - Preserve all navigation paths from the audit
   - Do not add hardcoded content where dynamic data should be
7. After completing the redesign, provide:
   - **ELEMENT CHECKLIST**: Every item from the audit's INTERACTIVE ELEMENTS confirmed present with its new location
   - **DATA CHECKLIST**: Every data source from the audit confirmed still connected
   - **NAVIGATION CHECKLIST**: All navigation paths confirmed working
8. Run the code to verify no errors.
9.Continue this process systematically until the apps redesign is complete.
