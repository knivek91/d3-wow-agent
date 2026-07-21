import { useState, useRef, useEffect } from 'react'
import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '#/components/ui/select.tsx'
import { type AgentType, AGENT_OPTIONS } from '#/types/agent.ts'

interface ChatInputProps {
  onSend: (message: string, agentType: AgentType) => void
  disabled?: boolean
  defaultAgent?: AgentType
}

export default function ChatInput({ onSend, disabled, defaultAgent = 'd3' }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<AgentType>(defaultAgent)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentOption = AGENT_OPTIONS.find((o) => o.value === selectedAgent)

  useEffect(() => {
    setSelectedAgent(defaultAgent)
  }, [defaultAgent])

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

  return (
    <div className="px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="flex items-center gap-2 bg-secondary rounded-2xl px-3 py-2 sm:px-4 sm:py-3 border border-border shadow-lg max-w-4xl mx-auto">
        <Select value={selectedAgent} onValueChange={(v) => setSelectedAgent(v as AgentType)} disabled={disabled}>
          <SelectTrigger className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-0 bg-transparent p-0 flex items-center justify-center text-base hover:bg-accent transition-colors shrink-0" aria-label="Seleccionar agente">
            <span>{currentOption?.icon}</span>
          </SelectTrigger>
          <SelectContent position="popper" side="top" align="start">
            {AGENT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.icon} {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pregunta sobre D3 o WoW..."
          disabled={disabled}
          className="flex-1 border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 h-8 sm:h-9 text-sm"
        />

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !inputValue.trim()}
          size="icon"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  )
}
