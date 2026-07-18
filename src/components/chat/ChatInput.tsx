import { useState, useRef, useEffect } from 'react'

interface ChatInputProps {
  onSend: (message: string, agentType: 'd3' | 'wow') => void
  disabled?: boolean
  defaultAgent?: 'd3' | 'wow'
}

export default function ChatInput({ onSend, disabled, defaultAgent = 'd3' }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<'d3' | 'wow'>(defaultAgent)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSubmit() {
    const trimmed = inputValue.trim()
    if (!trimmed || disabled) return
    onSend(trimmed, selectedAgent)
    setInputValue('')
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const isD3 = selectedAgent === 'd3'
  const agentIcon = isD3 ? '🐉' : '🐻'
  const agentName = isD3 ? 'D3' : 'WoW'
  const accentColor = isD3 ? '#ff6600' : '#00ff88'

  return (
    <div className="border-t border-[#1a3d1a] px-4 py-3 bg-[#0f1117]">
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{
              backgroundColor: isD3 ? 'rgba(255,102,0,0.1)' : 'rgba(0,255,136,0.1)',
              color: accentColor,
            }}
          >
            <span>{agentIcon} {agentName}</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute bottom-full mb-1 left-0 bg-[#1c1e2e] border border-[#1a3d1a] rounded-xl shadow-xl overflow-hidden min-w-[200px] z-50">
              <button
                type="button"
                onClick={() => { setSelectedAgent('d3'); setIsOpen(false) }}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-[#f1f5f9] hover:bg-[#141624] transition-colors"
              >
                <span>🐉</span>
                <span>Diablo III</span>
                {selectedAgent === 'd3' && <span className="ml-auto text-[#00cc66]">✓</span>}
              </button>
              <button
                type="button"
                onClick={() => { setSelectedAgent('wow'); setIsOpen(false) }}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-[#f1f5f9] hover:bg-[#141624] transition-colors"
              >
                <span>🐻</span>
                <span>World of Warcraft</span>
                {selectedAgent === 'wow' && <span className="ml-auto text-[#00cc66]">✓</span>}
              </button>
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pregunta sobre D3 o WoW..."
          disabled={disabled}
          className="flex-1 bg-[#1c1e2e] text-[#f1f5f9] placeholder-[#475569] rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-[#00cc66] transition-colors disabled:opacity-50"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !inputValue.trim()}
          className="flex items-center justify-center w-10 h-10 rounded-xl transition-colors disabled:opacity-40"
          style={{ backgroundColor: '#00cc66' }}
          onMouseEnter={(e) => { if (!disabled && inputValue.trim()) e.currentTarget.style.backgroundColor = '#00e673' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#00cc66' }}
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
