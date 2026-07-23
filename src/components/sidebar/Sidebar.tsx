import { useState, useMemo } from 'react'
import { cn } from '#/lib/utils.ts'
import ConversationItem from './ConversationItem'
import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import { Separator } from '#/components/ui/separator.tsx'
import { authClient } from '#/lib/auth-client.js'
import { Plus, LogOut } from 'lucide-react'
import { type AgentType, AGENT_OPTIONS } from '#/types/agent.ts'
import type { Conversation } from '#/lib/api.ts'

interface SidebarProps {
  conversations: Conversation[]
  activeId?: string
  onSelect: (id: string) => void
  onNewChat: () => void
  onDelete: (id: string) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

function isToday(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  return d.toDateString() === now.toDateString()
}

function isYesterday(dateStr: string) {
  const d = new Date(dateStr)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return d.toDateString() === yesterday.toDateString()
}

type GroupKey = 'today' | 'yesterday' | 'older'

function groupKey(dateStr: string): GroupKey {
  if (isToday(dateStr)) return 'today'
  if (isYesterday(dateStr)) return 'yesterday'
  return 'older'
}

const groupLabels: Record<GroupKey, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  older: 'Older',
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations
    const q = search.toLowerCase()
    return conversations.filter((c) => c.title.toLowerCase().includes(q))
  }, [conversations, search])

  const grouped = useMemo(() => {
    const map: Record<GroupKey, Conversation[]> = { today: [], yesterday: [], older: [] }
    for (const c of filtered) {
      map[groupKey(c.createdAt)].push(c)
    }
    return map
  }, [filtered])

  return (
    <>
      {/* ── Collapsed sidebar: visible on mobile always, hidden on desktop when expanded ── */}
      <div
        className={cn(
          "flex flex-col items-center w-14 bg-sidebar border-r border-border py-3 gap-2 flex-shrink-0",
          "md:hidden"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewChat}
          className="text-primary"
          title="New conversation"
        >
          <Plus className="w-4 h-4" />
        </Button>
        <div className="flex-1 flex flex-col items-center gap-1 mt-2 overflow-y-auto">
          {conversations.slice(0, 8).map((c) => (
            <Button
              key={c.id}
              variant="ghost"
              size="icon"
              onClick={() => onSelect(c.id)}
              className={cn(
                'text-sm',
                c.id === activeId ? 'bg-secondary' : 'text-muted-foreground',
              )}
              title={c.title}
            >
              {AGENT_OPTIONS.find((o) => o.value === c.agentType)?.icon}
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => authClient.signOut({ callbackURL: '/auth/login' })}
          className="text-muted-foreground hover:text-destructive mt-auto"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      {/* ── Expanded sidebar: hidden on mobile, shown on desktop ── */}
      <div
        className={cn(
          "hidden md:flex flex-col w-[280px] bg-sidebar border-r border-border flex-shrink-0",
          collapsed && "md:hidden"
        )}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-border">
          <h1 className="text-sm font-bold text-foreground">D3 / WoW Agent</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="text-muted-foreground"
            title="Collapse sidebar"
          >
            ◀
          </Button>
        </div>

        <div className="px-3 pt-3">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full text-xs"
          />
        </div>

        <Button
          variant="ghost"
          onClick={onNewChat}
          className="flex items-center gap-2 mx-3 mt-3 px-3 py-2 justify-start text-primary"
        >
          <span>✨</span>
          <span>New conversation...</span>
        </Button>

        <Separator className="mx-3 my-2" />

        <div className="flex-1 overflow-y-auto px-3 min-h-0">
          <div className="space-y-4 py-3">
            {(Object.entries(grouped) as [GroupKey, Conversation[]][]).map(([key, items]) => {
              if (items.length === 0) return null
              return (
                <div key={key}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-1">
                    {groupLabels[key]}
                  </div>
                  <div className="space-y-0.5">
                    {items.map((c) => (
                      <ConversationItem
                        key={c.id}
                        id={c.id}
                        title={c.title}
                        agentType={c.agentType}
                        isActive={c.id === activeId}
                        onClick={() => onSelect(c.id)}
                        onDelete={() => onDelete(c.id)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="px-3 py-3 border-t border-border">
          <Button
            onClick={onNewChat}
            className="flex items-center justify-center gap-2 w-full"
          >
            <Plus className="w-4 h-4" />
            New conversation
          </Button>
        </div>
        <div className="px-3 pb-3 border-t border-border">
          <Button
            variant="ghost"
            onClick={() => authClient.signOut({ callbackURL: '/auth/login' })}
            className="flex items-center justify-center gap-2 w-full text-muted-foreground text-xs hover:text-destructive"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </Button>
        </div>
      </div>

      {/* ── Desktop collapsed sidebar: shown on desktop when collapsed ── */}
      {collapsed && (
        <div className="hidden md:flex flex-col items-center w-14 bg-sidebar border-r border-border py-3 gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            title="Expand sidebar"
          >
            ▶
          </Button>
          <div className="flex-1 flex flex-col items-center gap-1 mt-2">
            {conversations.slice(0, 5).map((c) => (
              <Button
                key={c.id}
                variant="ghost"
                size="icon"
                onClick={() => onSelect(c.id)}
                className={cn(
                  'text-sm',
                  c.id === activeId ? 'bg-secondary' : 'text-muted-foreground',
                )}
                title={c.title}
              >
                {AGENT_OPTIONS.find((o) => o.value === c.agentType)?.icon}
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewChat}
            className="text-primary"
            title="New conversation"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => authClient.signOut({ callbackURL: '/auth/login' })}
            className="text-muted-foreground hover:text-destructive mt-auto"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      )}
    </>
  )
}
