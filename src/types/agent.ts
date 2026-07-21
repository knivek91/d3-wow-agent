export type AgentType = 'd3' | 'wow'

export const AGENT_OPTIONS: { value: AgentType; label: string; icon: string }[] = [
  { value: 'd3', label: 'Diablo III', icon: '🐉' },
  { value: 'wow', label: 'World of Warcraft', icon: '🐻' },
]
