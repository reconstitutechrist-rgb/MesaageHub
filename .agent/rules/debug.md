---
trigger: always_on
---

=== DEBUGGING & MODIFICATION CONTRACT (DO NOT VIOLATE) ===

1. DIAGNOSE FIRST, ACT SECOND: Do not write or suggest any code changes until you have provided a plain-language diagnosis of the problem and received approval to proceed.

2. SURGICAL CHANGES ONLY: Change the absolute minimum amount of code required to fix the issue or implement the modification. If a fix requires changing 3 lines, change exactly 3 lines. Do not rewrite surrounding code "for consistency" or "while we're here."

3. DO NOT TOUCH UNRELATED CODE: Do not modify, move, rename, reformat, reorganize, or "clean up" any code that is not directly part of the fix or modification. If you believe unrelated code has issues, report them separately — do not fix them.

4. PRESERVE ALL EXISTING CODE: Do not remove any code unless you can explain exactly why it is causing the problem. Code that appears unused may be hooked into other files, called dynamically, referenced by external systems, or needed for future features. If you suspect code is unused, ASK — do not delete.

5. TRACE BEFORE REMOVING: Before removing or replacing ANY code, trace its connections. Check: Is it imported elsewhere? Is it called by other functions? Is it referenced in configuration files? Is it used in routing? Does it appear in any other file? Report what you found.

6. SHOW THE DIFF: For every change, show exactly what lines are being modified. Present changes as "BEFORE" and "AFTER" blocks so the user can see precisely what is changing. Do not present entire rewritten files — show only the changed sections with enough surrounding context to locate them.

7. ONE FIX AT A TIME: If there are multiple issues, address them one at a time. Complete one fix, let the user verify it works, then move to the next. Do not bundle fixes.

8. EXPLAIN EVERY CHANGE: For every line you change, explain in plain language what it did before, what it does now, and why the change fixes the problem. No jargon.

9. NO BROAD RECODING: Do not change the coding style, patterns, conventions, or structure of existing code. Match the existing style exactly, even if you would write it differently. The goal is to fix the problem, not improve the codebase.

10. NO PACKAGE CHANGES: Do not install, update, or remove packages unless the problem is specifically caused by a package issue. If you believe a package change is needed, state which one and why and wait for approval.

11. VERIFY PRESERVATION: After presenting your changes, list every function, component, and export in the modified file(s) and confirm that each one still exists and behaves the same as before (except for the intentional fix). This is your checklist that you didn't accidentally break or remove something.

12. ASK ABOUT UNKNOWNS: If you see code you don't understand the purpose of, ask the user about it. Do not assume it is dead code, leftover code, or a mistake.

ROLE: You are diagnosing a problem. Do NOT suggest or write any fixes yet. Only analyze.

THE APP:
[One or two sentences describing what the app does]

THE PROBLEM:
[Describe what is happening. Be as specific as possible:]
- What should happen: [expected behavior]
- What actually happens: [actual behavior]
- When it happens: [what triggers it — a click, a page load, a specific action]
- What changed recently: [if anything was modified before the problem appeared, describe it]

FILES:
[Paste the complete contents of every file you think might be relevant. When in doubt, include more files rather than fewer. Label each one clearly:]

--- File: src/app/dashboard/page.tsx ---
[full file contents]

--- File: src/lib/auth.ts ---
[full file contents]

INSTRUCTIONS:
1. Read every file completely before forming any theory.
2. Trace the flow from where the problem occurs back through every function and import involved.
3. Identify the specific line(s) you believe are causing the problem.
4. Explain your diagnosis in plain language.
5. Do NOT suggest any code changes yet.
6. If you need to see additional files to form a diagnosis, tell me which ones and why.
