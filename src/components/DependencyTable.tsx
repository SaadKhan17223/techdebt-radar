import type { Dependency } from '../lib/types'

interface Props { dependencies: Dependency[] }

const riskMeta = {
  critical: { color: 'var(--red)',   bg: 'var(--red-bg)',   label: 'Critical' },
  high:     { color: 'var(--amber)', bg: 'var(--amber-bg)', label: 'High'     },
  medium:   { color: '#f59e0b',      bg: '#fffbeb',         label: 'Medium'   },
  low:      { color: 'var(--green)', bg: 'var(--green-bg)', label: 'Low'      },
}

export default function DependencyTable({ dependencies }: Props) {
  const outdated = dependencies.filter(d => d.outdated)
  const upToDate = dependencies.filter(d => !d.outdated)

  return (
    <div className="section">
      <div className="section-header-row">
        <h3 className="section-title">📦 Dependency Health</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="stat-badge green">{upToDate.length} up to date</span>
          <span className="stat-badge red">{outdated.length} outdated</span>
        </div>
      </div>

      {outdated.length === 0 ? (
        <div className="empty-state">✅ All checked dependencies are up to date!</div>
      ) : (
        <div className="dep-table">
          <div className="dep-row dep-header">
            <span>Package</span>
            <span>Current</span>
            <span>Latest</span>
            <span>Risk</span>
            <span>Insight</span>
          </div>
          {outdated.map((dep, i) => {
            const meta = riskMeta[dep.riskLevel]
            return (
              <div key={i} className="dep-row">
                <span className="dep-name">{dep.name}</span>
                <span className="dep-ver current">{dep.current}</span>
                <span className="dep-ver latest">{dep.latest}</span>
                <span>
                  <span className="risk-badge" style={{ color: meta.color, background: meta.bg }}>
                    {meta.label}
                    {dep.majorBehind > 0 && ` (+${dep.majorBehind})`}
                  </span>
                </span>
                <span className="dep-insight">
                  {dep.aiExplanation ?? (dep.majorBehind >= 2
                    ? `${dep.majorBehind} major versions behind — likely contains breaking changes and security patches.`
                    : 'Minor version behind — update recommended.')}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {upToDate.length > 0 && (
        <details className="uptodate-details">
          <summary>{upToDate.length} packages are up to date</summary>
          <div className="uptodate-grid">
            {upToDate.map((d, i) => (
              <span key={i} className="uptodate-tag">✓ {d.name} {d.current}</span>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
