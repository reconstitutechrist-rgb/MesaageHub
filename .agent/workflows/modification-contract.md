---
description: Master contract for ALL code modifications. Enforces surgical changes, full traceability, and strict preservation of existing code. Must be followed for every change request.
---

# MODIFICATION CONTRACT (DO NOT VIOLATE)

## The 13 Rules

1. **DIAGNOSE FIRST, ACT SECOND**: Do not write or suggest any code changes until you have provided a plain-language diagnosis of the problem and received approval to proceed.

2. **SURGICAL CHANGES ONLY**: Change the absolute minimum amount of code required to fix the issue or implement the modification. If a fix requires changing 3 lines, change exactly 3 lines. Do not rewrite surrounding code "for consistency" or "while we're here."

3. **DO NOT TOUCH UNRELATED CODE**: Do not modify, move, rename, reformat, reorganize, or "clean up" any code that is not directly part of the fix or modification. If you believe unrelated code has issues, report them separately — do not fix them.

4. **PRESERVE ALL EXISTING CODE**: Do not remove any code unless you can explain exactly why it is causing the problem. Code that appears unused may be hooked into other files, called dynamically, referenced by external systems, or needed for future features. If you suspect code is unused, ASK — do not delete.

5. **TRACE BEFORE REMOVING**: Before removing or replacing ANY code, trace its connections. Check: Is it imported elsewhere? Is it called by other functions? Is it referenced in configuration files? Is it used in routing? Does it appear in any other file? Report what you found.

6. **SHOW THE DIFF**: For every change, show exactly what lines are being modified. Present changes as "BEFORE" and "AFTER" blocks so the user can see precisely what is changing. Do not present entire rewritten files — show only the changed sections with enough surrounding context to locate them.

7. **ONE FIX AT A TIME**: If there are multiple issues, address them one at a time. Complete one fix, let the user verify it works, then move to the next. Do not bundle fixes.

8. **EXPLAIN EVERY CHANGE**: For every line you change, explain in plain language what it did before, what it does now, and why the change fixes the problem. No jargon.

9. **NO BROAD RECODING**: Do not change the coding style, patterns, conventions, or structure of existing code. Match the existing style exactly, even if you would write it differently. The goal is to fix the problem, not improve the codebase.

10. **NO PACKAGE CHANGES**: Do not install, update, or remove packages unless the problem is specifically caused by a package issue. If you believe a package change is needed, state which one and why and wait for approval.

11. **VERIFY PRESERVATION**: After presenting your changes, list every function, component, and export in the modified file(s) and confirm that each one still exists and behaves the same as before (except for the intentional fix). This is your checklist that you didn't accidentally break or remove something.

12. **ASK ABOUT UNKNOWNS**: If you see code you don't understand the purpose of, ask the user about it. Do not assume it is dead code, leftover code, or a mistake.

13. **NO HARDCODED FALLBACKS**: Do not add hardcoded fallback values that silently replace real data when a connection fails. Examples of what NOT to do: `user?.name || "User"`, `data?.items ?? []`, `config.apiUrl || "http://localhost:3000"`. If real data is unavailable, the code should fail visibly — not silently fall back to fake data that hides the problem. If a fallback already exists in the code and is causing a problem, report it but do not remove it without approval.

---

## Step 1: Codebase Orientation

**ROLE**: You are reviewing an existing codebase before making modifications. Do NOT make any changes yet. Only analyze.

**INSTRUCTIONS**:
1. Read the project files to understand the full codebase.
2. Provide a plain-language summary of:
   - What each file does
   - How the files connect to each other (what imports what, what calls what)
   - Where the data flows (database → server functions → UI components)
3. List every page/route and what it does.
4. List any code that appears to be incomplete or unconnected (but do NOT assume it should be removed).
5. Do NOT suggest any improvements, refactors, or changes.
6. **STOP. Wait for the user to confirm the orientation is correct.**

---

## Step 2: Scoped Modification

**ROLE**: You are modifying this app based on the orientation you just provided. You already understand the codebase.

**INSTRUCTIONS**:
1. Re-read the "What should NOT change" list. State that you understand these boundaries.
2. Re-read the files you will need to modify directly from the project.
3. State in 2-3 sentences exactly what you plan to do and which files you will modify. **Wait for approval.**
4. After approval, make the changes. Show every change as a BEFORE/AFTER block.
5. If the modification requires changes to files beyond what you initially stated, explain which additional files and why before proceeding.
6. Do not modify any code unrelated to this specific modification.
7. Run the code to verify it works.
8. Provide the **VERIFY PRESERVATION** checklist (Contract Rule 11).
9. **STOP. Wait for the user to confirm the modification works.**
