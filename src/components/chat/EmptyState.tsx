import { Button } from '#/components/ui/button.tsx'
import type { AgentType } from '#/types/agent.ts'

interface EmptyStateProps {
  onSelectAgent: (agent: AgentType) => void
}

export default function EmptyState({ onSelectAgent }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-12">
      <div className="text-5xl mb-4">🐉🐻</div>
      <h1 className="text-2xl font-bold text-foreground mb-2">D3 / WoW Agent</h1>
      <p className="text-muted-foreground text-sm mb-8 text-center max-w-md">
        Pregunta sobre builds, items, temporadas o mecánicas
      </p>

      <div className="grid grid-cols-2 gap-3 mb-8 max-w-md w-full">
        <div className="bg-card rounded-xl p-3 text-center">
          <span className="text-xs text-muted-foreground">⚔️ Builds de temporada</span>
        </div>
        <div className="bg-card rounded-xl p-3 text-center">
          <span className="text-xs text-muted-foreground">📊 Stats de items</span>
        </div>
        <div className="bg-card rounded-xl p-3 text-center">
          <span className="text-xs text-muted-foreground">👹 Mecánicas de boss</span>
        </div>
        <div className="bg-card rounded-xl p-3 text-center">
          <span className="text-xs text-muted-foreground">⬆️ Paragon y optimización</span>
        </div>
        <div className="bg-card rounded-xl p-3 text-center">
          <span className="text-xs text-muted-foreground">🏆 Mythic+</span>
        </div>
        <div className="bg-card rounded-xl p-3 text-center">
          <span className="text-xs text-muted-foreground">🏰 Raids</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => onSelectAgent('d3')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
          style={{ backgroundColor: 'rgba(255,102,0,0.15)', color: '#ff6600' }}
        >
          🐉 Diablo III
        </Button>
        <Button
          onClick={() => onSelectAgent('wow')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
          style={{ backgroundColor: 'rgba(0,255,136,0.15)', color: '#00ff88' }}
        >
          🐻 World of Warcraft
        </Button>
      </div>
    </div>
  )
}
