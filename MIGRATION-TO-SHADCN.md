# Migration: Raw HTML → shadcn/ui

Audit of components using raw HTML instead of shadcn/ui components.

---

## P0 — Critical (fix first)

### 1. `ConversationItem.tsx` — Raw `<button>` + `role="button"` div
- **Lines 28-55**: `<div role="button">` as conversation item wrapper
- **Lines 44-53**: `<button type="button">` for delete action
- **Replace with**: shadcn `Button` with `variant="ghost"` — handles keyboard, focus ring, aria
- **Icon**: Replace inline SVG with `import { Trash2 } from 'lucide-react'`

### 2. `EmptyState.tsx` — Inline styles with magic color strings
- **Line 42**: `style={{ backgroundColor: 'rgba(255,102,0,0.15)', color: '#ff6600' }}`
- **Line 49**: `style={{ backgroundColor: 'rgba(0,255,136,0.15)', color: '#00ff88' }}`
- **Replace with**: `className="bg-[var(--accent-d3-bg)] text-[var(--accent-d3)]"` (CSS variables already exist)

### 3. `StreamingIndicator.tsx` — 5 inline styles with hardcoded hex values
- **Line 12**: `const accentColor = isD3 ? '#ff6600' : '#00ff88'`
- **Lines 20-23, 29, 35-37**: `style={{ backgroundColor, color }}` with hex values
- **Replace with**: CSS variables `var(--accent-d3)` / `var(--accent-wow)` + Tailwind classes

### 4. `__root.tsx` — 404 page with 5 hardcoded hex colors
- **Lines 38-44**: `bg-[#0f1117]`, `text-[#f1f5f9]`, `text-[#475569]`, `bg-[#00cc66]`, `hover:bg-[#00e673]`
- **Replace with**: `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `hover:bg-primary/90`
- **CTA**: Use shadcn `Button` instead of `<a>` with inline styles

### 5. Inline SVGs → lucide-react (6 icons across 4 files)

| File | Lines | Current Icon | Replace With |
|------|-------|-------------|-------------|
| `ChatInput.tsx` | 74-76 | Arrow send | `SendHorizontal` |
| `Sidebar.tsx` | 94-96, 191-193, 234-236 | Plus (3x duplicated) | `Plus` |
| `ConversationItem.tsx` | 50-52 | Trash | `Trash2` |
| `ErrorMessage.tsx` | 23-25 | Alert circle | `AlertCircle` |

---

## P1 — Nice-to-have (improve consistency)

### 6. ScrollArea — replace raw scrollable divs
- `MessageList.tsx` line 32: `<div className="flex-1 overflow-y-auto">`
- `Sidebar.tsx` lines 98, 158: divs with `overflow-y-auto`
- `ChatPage.tsx` line 216: div with `overflow-auto`
- **Replace with**: `<ScrollArea>` from shadcn

### 7. EmptyState.tsx — card-like divs
- **Lines 18-35**: 6 identical divs with `bg-card rounded-xl p-3`
- **Replace with**: `<Card className="p-3 text-center">`

### 8. AgentBadge.tsx — inline style (already uses CSS vars)
- **Line 22**: `style={{ backgroundColor: bgOpacity, color: accentColor }}`
- **Replace with**: `className={cn(isD3 ? 'bg-[var(--accent-d3-bg)] text-[var(--accent-d3)]' : ...)}`

### 9. Sidebar.tsx — border-based separators
- **Lines 124, 186**: `border-b border-border` / `border-t border-border`
- **Consider**: shadcn `<Separator>` for semantic separators

---

## Summary

| Severity | Count | Files Affected |
|----------|-------|----------------|
| P0 Critical | 9 issues | ConversationItem, EmptyState, StreamingIndicator, __root, ChatInput, Sidebar, ErrorMessage |
| P1 Nice-to-have | 4 issues | MessageList, Sidebar, ChatPage, AgentBadge, EmptyState |

### Files already clean
- `select.tsx` — no issues found
- `ChatInput.tsx` — already uses shadcn Button, Input, Select
- `AgentBadge.tsx` — already uses shadcn Badge (only inline style to convert)
