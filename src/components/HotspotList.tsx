import type { FileHotspot } from '../lib/types'

interface Props { hotspots: FileHotspot[]; testRatio: number; totalFiles: number }

export default function HotspotList({ hotspots, testRatio, totalFiles }: Props) {
  const testColor = testRatio === 0 ? 'var(--red)' : testRatio < 20 ? 'var(--amber)' : 'var(--green)'

  return (
    <div className="section">
      <h3 className="section-title">🔥 Complexity Hotspots</h3>
      <p className="section-sub">
        Large source files are a strong signal of complexity debt — hard to test, review, and maintain.
      </p>

      <div className="test-ratio-bar">
        <span className="test-ratio-label">Test Coverage Signal</span>
        <div className="test-ratio-track">
          <div className="test-ratio-fill" style={{ width: `${Math.min(testRatio, 100)}%`, background: testColor }} />
        </div>
        <span style={{ color: testColor, fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' }}>
          {testRatio}% ({totalFiles} files scanned)
        </span>
      </div>

      {hotspots.length === 0 ? (
        <div className="empty-state">✅ No unusually large files detected.</div>
      ) : (
        <div className="hotspot-list">
          {hotspots.map((h, i) => {
            const kb = Math.round(h.size / 1024)
            const severity = kb > 100 ? 'var(--red)' : kb > 50 ? 'var(--amber)' : 'var(--amber)'
            return (
              <div key={i} className="hotspot-row">
                <div className="hotspot-path">
                  <span className="hotspot-icon">📄</span>
                  <span>{h.path}</span>
                </div>
                <div className="hotspot-meta">
                  <span className="hotspot-size" style={{ color: severity }}>{kb} KB</span>
                  <span className="hotspot-hint">Consider splitting into smaller modules</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
