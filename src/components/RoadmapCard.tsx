import type { RoadmapItem } from '../lib/types'

interface Props { roadmap: RoadmapItem[]; summary: string }

const effortMeta = {
  low:    { color: 'var(--green)', label: 'Low effort'    },
  medium: { color: 'var(--amber)', label: 'Medium effort' },
  high:   { color: 'var(--red)',   label: 'High effort'   },
}

const categoryMeta = {
  dependency: { icon: '📦', color: '#3b82f6' },
  security:   { icon: '🔒', color: '#ef4444' },
  complexity: { icon: '🔥', color: '#f59e0b' },
  testing:    { icon: '🧪', color: '#22c55e' },
}

export default function RoadmapCard({ roadmap, summary }: Props) {
  return (
    <div className="section">
      <h3 className="section-title">🗺️ Prioritized Fix Roadmap</h3>

      <div className="summary-box">
        <p>{summary}</p>
      </div>

      <div className="roadmap-list">
        {roadmap.map((item, i) => {
          const effort = effortMeta[item.effort]
          const cat = categoryMeta[item.category]
          return (
            <div key={i} className="roadmap-item">
              <div className="roadmap-priority" style={{ background: cat.color }}>
                {item.priority}
              </div>
              <div className="roadmap-body">
                <div className="roadmap-header-row">
                  <span className="roadmap-title">
                    {cat.icon} {item.title}
                  </span>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <span className="roadmap-badge" style={{ color: effort.color }}>
                      {effort.label}
                    </span>
                    <span className="roadmap-badge days">
                      ~{item.effortDays}d
                    </span>
                  </div>
                </div>
                <p className="roadmap-why">{item.why}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
