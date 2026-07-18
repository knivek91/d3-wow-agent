import { useState, useMemo } from 'react'
import { cn } from '../../lib/utils'
import ConversationItem from './ConversationItem'

interface Conversation {
  id: string
  title: string
  agentType: 'd3' | 'wow'
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

  if (collapsed) {
    return (
      <div className="flex flex-col items-center w-14 bg-[#0a0b12] border-r border-[#1a3d1a] py-3 gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#141624] transition-colors"
          title="Expandir sidebar"
        >
          ▶
        </button>
        <div className="flex-1 flex flex-col items-center gap-1 mt-2">
          {conversations.slice(0, 5).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors',
                c.id === activeId
                  ? 'bg-[#1c1e2e]'
                  : 'text-[#475569] hover:bg-[#141624]',
              )}
              title={c.title}
            >
              {c.agentType === 'd3' ? '🐉' : '🐻'}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onNewChat}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#00cc66] hover:bg-[#141624] transition-colors"
          title="Nueva conversación"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-[280px] bg-[#0a0b12] border-r border-[#1a3d1a] flex-shrink-0">
      <div className="flex items-center justify-between px-4 h-14 border-b border-[#1a3d1a]">
        <h1 className="text-sm font-bold text-[#f1f5f9]">D3 / WoW Agent</h1>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-7 h-7 rounded flex items-center justify-center text-[#475569] hover:text-[#f1f5f9] hover:bg-[#141624] transition-colors"
          title="Colapsar sidebar"
        >
          ◀
        </button>
      </div>

      <div className="px-3 pt-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar conversaciones..."
          className="w-full bg-[#141624] text-[#f1f5f9] placeholder-[#475569] text-xs rounded-lg px-3 py-2 outline-none border border-transparent focus:border-[#00cc66] transition-colors"
        />
      </div>

      <button
        type="button"
        onClick={onNewChat}
        className="flex items-center gap-2 mx-3 mt-3 px-3 py-2 rounded-lg text-sm text-[#00cc66] hover:bg-[#141624] transition-colors"
      >
        <span>✨</span>
        <span>Nueva conversación...</span>
      </button>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {(Object.entries(grouped) as [GroupKey, Conversation[]][]).map(([key, items]) => {
          if (items.length === 0) return null
          return (
            <div key={key}>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#475569] px-1 mb-1">
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

      <div className="px-3 py-3 border-t border-[#1a3d1a]">
        <button
          type="button"
          onClick={onNewChat}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{ backgroundColor: '#00cc66', color: '#0f1117' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#00e673' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#00cc66' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva conversación
        </button>
      </div>
    </div>
  )
}
