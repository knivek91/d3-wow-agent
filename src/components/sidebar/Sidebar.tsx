import { useState, useMemo } from 'react'
import { cn } from '#/lib/utils.ts'
import ConversationItem from './ConversationItem'
import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import { Separator } from '#/components/ui/separator.tsx'
import type { AgentType } from '#/types/agent.ts'

interface Conversation {
  id: string
  title: string
  agentType: AgentType
  createdAt: string
}

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
  today: 'Hoy',
  yesterday: 'Ayer',
  older: 'Anterior',
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
          title="Nueva conversación"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
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
              {c.agentType === 'd3' ? '🐉' : '🐻'}
            </Button>
          ))}
        </div>
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
            title="Colapsar sidebar"
          >
            ◀
          </Button>
        </div>

        <div className="px-3 pt-3">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversaciones..."
            className="w-full text-xs"
          />
        </div>

        <Button
          variant="ghost"
          onClick={onNewChat}
          className="flex items-center gap-2 mx-3 mt-3 px-3 py-2 justify-start text-primary"
        >
          <span>✨</span>
          <span>Nueva conversación...</span>
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
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva conversación
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
            title="Expandir sidebar"
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
                {c.agentType === 'd3' ? '🐉' : '🐻'}
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewChat}
            className="text-primary"
            title="Nueva conversación"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        </div>
      )}
    </>
  )
}
