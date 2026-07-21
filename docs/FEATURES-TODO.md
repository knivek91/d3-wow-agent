# Features TODO — Deferred for future

Items identified (by CodeRabbit or during development) worth considering
but not justifying intervention right now.

---

## 1. `ChatPage.handleRetry` — Re-invoke failed operation

**What**: Currently `handleRetry` only clears the error state. CodeRabbit suggests
it should retry the failed operation (fetchConversations, sendMessage, etc.).

**Why not now**: Requires tracking a retry callback for each possible operation
(5+ distinct operations). It's a medium-sized change with no reported bug — the
user can simply repeat the action manually.

**When to reconsider**: If users report "retry doesn't work" or if a stateful
operation pattern (like TanStack Query) is adopted which handles this naturally.

**Files**: `src/components/chat/ChatPage.tsx`

**Reference**: CodeRabbit inline comment lines 187-193

---

## 2. `ChatPage` — Request-token guard for messages

**What**: CodeRabbit suggests adding a guard (request-token or AbortController) to
the `useEffect` that loads messages, preventing responses from a previous
conversation overwriting the current one.

**Why not now**: It's an edge case — only happens if the user switches conversations
at the exact moment a previous one is loading. The fix would introduce complexity
(refs, ID comparison, possibly AbortController) for an unlikely scenario.

**When to reconsider**: If there are reports of messages "jumping" between
conversations or if TanStack Query is adopted (it handles this with `queryKey`
automatically).

**Files**: `src/components/chat/ChatPage.tsx`

**Reference**: CodeRabbit inline comment lines 77-95

---

## 3. `Sidebar` Mobile — Full sidebar via Sheet

**What**: Replace the current mobile version (only 14px icon rail) with a shadcn
Sheet exposing the full sidebar with search, titles, etc.

**Why not now**: This is a feature enhancement, not a bug. The current mobile
version works (though limited). It requires integrating the shadcn Sheet component
(already installed) and redesigning the mobile interaction — a significant UX change.

**When to reconsider**: When mobile UX is prioritized or if users report difficulty
navigating conversations on their phone.

**Files**: `src/components/sidebar/Sidebar.tsx`

**Reference**: CodeRabbit inline comment lines 78-116

---

## 4. `scroll-area.tsx` — Radix API names

**What**: CodeRabbit suggests changing `ScrollAreaPrimitive.ScrollAreaScrollbar`
to `ScrollAreaPrimitive.Scrollbar`.

**Why not now**: This is an auto-generated shadcn file (`src/components/ui/`).
Our policy is to not modify CLI-generated files. If the API changes in a future
radix-ui version, regenerate with `npx shadcn add scroll-area`.

**When to reconsider**: If the ScrollArea component stops working after a radix-ui
upgrade.

**Files**: `src/components/ui/scroll-area.tsx`

**Reference**: CodeRabbit inline comment lines 31-56

---

## 5. `Sidebar` — `CollapsedConversationRail` component

**What**: Extract the two duplicated collapsed conversation button sections (mobile
limit 8, desktop limit 5) into a shared component.

**Why not now**: The two sections have different limits and contexts. Extracting
now would be premature abstraction that likely needs reverting when the mobile
sidebar is redesigned (item 3). Principle: don't abstract before you need to.

**When to reconsider**: Along with the mobile sidebar redesign (item 3), or if a
third location needs the same pattern.

**Files**: `src/components/sidebar/Sidebar.tsx` (lines 98-114)

**Reference**: CodeRabbit nitpick comments

---

## 6. `styles.css` — Increase `--border` contrast

**What**: CodeRabbit suggests increasing the `--border` variable contrast so
component borders (Button, Input, Card) are more visible against the background.

**Why not now**: This is a design preference, not a bug. The current contrast
(`#1a3d1a` on `#0f1117`) may be intentional for a subtle look. Changing `--border`
affects every component in the design system. Without a concrete user complaint,
it's not justified.

**When to reconsider**: If the user requests more visible borders or if an
accessibility audit (WCAG) requires it.

**Files**: `src/styles.css`

**Reference**: CodeRabbit nitpick comments

---

## 7. `debug-layout.mjs` — try...finally block

**What**: CodeRabbit suggests wrapping the logic after `chromium.launch` in a
`try...finally` block to ensure the browser closes even on errors.

**Why not now**: This is a temporary debug file created to diagnose layout issues.
It's already identified for deletion before merging to main. Better to delete it
than to improve it.

**When to reconsider**: Before merging to main — delete the file outright.

**Files**: `debug-layout.mjs`

**Reference**: CodeRabbit inline comment lines 4-124
