interface EmptyStateProps {
  onSelectAgent: (agent: 'd3' | 'wow') => void
}

export default function EmptyState({ onSelectAgent }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12">
      <div className="text-5xl mb-4">🐉🐻</div>
      <h1 className="text-2xl font-bold text-[#f1f5f9] mb-2">D3 / WoW Agent</h1>
      <p className="text-[#94a3b8] text-sm mb-8 text-center max-w-md">
        Pregunta sobre builds, items, temporadas o mecánicas
      </p>

      <div className="grid grid-cols-2 gap-3 mb-8 max-w-md w-full">
        <div className="bg-[#141624] rounded-xl p-3 text-center">
          <span className="text-xs text-[#94a3b8]">⚔️ Builds de temporada</span>
        </div>
        <div className="bg-[#141624] rounded-xl p-3 text-center">
          <span className="text-xs text-[#94a3b8]">📊 Stats de items</span>
        </div>
        <div className="bg-[#141624] rounded-xl p-3 text-center">
          <span className="text-xs text-[#94a3b8]">👹 Mecánicas de boss</span>
        </div>
        <div className="bg-[#141624] rounded-xl p-3 text-center">
          <span className="text-xs text-[#94a3b8]">⬆️ Paragon y optimización</span>
        </div>
        <div className="bg-[#141624] rounded-xl p-3 text-center">
          <span className="text-xs text-[#94a3b8]">🏆 Mythic+</span>
        </div>
        <div className="bg-[#141624] rounded-xl p-3 text-center">
          <span className="text-xs text-[#94a3b8]">🏰 Raids</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onSelectAgent('d3')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{ backgroundColor: 'rgba(255,102,0,0.15)', color: '#ff6600' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,102,0,0.25)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,102,0,0.15)' }}
        >
          🐉 Diablo III
        </button>
        <button
          onClick={() => onSelectAgent('wow')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{ backgroundColor: 'rgba(0,255,136,0.15)', color: '#00ff88' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.25)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.15)' }}
        >
          🐻 World of Warcraft
        </button>
      </div>
    </div>
  )
}
