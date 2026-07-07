import { useEffect, useState } from 'react'
import type { HealthScores } from '../lib/types'

interface Props {
  scores: HealthScores
  overall: number
}

export default function RadarChart({ scores, overall }: Props) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { setTimeout(() => setAnimated(true), 100) }, [])

  const cx = 160, cy = 160, maxR = 120
  const labels = ['Dependency', 'Security', 'Complexity', 'Testing']
  const values = [scores.dependency, scores.security, scores.complexity, scores.testing]
  const angles = labels.map((_, i) => (i * Math.PI * 2) / labels.length - Math.PI / 2)

  const toPoint = (angle: number, r: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  })

  const gridLevels = [25, 50, 75, 100]
  const scoreColor = overall >= 70 ? '#22c55e' : overall >= 45 ? '#f59e0b' : '#ef4444'

  const dataPoints = animated
    ? values.map((v, i) => toPoint(angles[i], (v / 100) * maxR))
    : values.map((_, i) => toPoint(angles[i], 0))

  const polygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <div className="radar-section">
      <div className="radar-chart-wrap">
        <svg width="320" height="320" viewBox="0 0 320 320" aria-label="Health radar chart">
          {/* Grid rings */}
          {gridLevels.map(level => {
            const pts = angles.map(a => toPoint(a, (level / 100) * maxR))
            return (
              <polygon
                key={level}
                points={pts.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="var(--border)"
                strokeWidth="1"
                opacity={level === 100 ? 0.6 : 0.3}
              />
            )
          })}

          {/* Axis lines */}
          {angles.map((angle, i) => {
            const end = toPoint(angle, maxR)
            return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="var(--border)" strokeWidth="1" opacity="0.4" />
          })}

          {/* Data polygon */}
          <polygon
            points={polygon}
            fill={scoreColor}
            fillOpacity="0.15"
            stroke={scoreColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
            style={{ transition: 'all 1s cubic-bezier(0.4,0,0.2,1)' }}
          />

          {/* Data points */}
          {dataPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4" fill={scoreColor}
              style={{ transition: 'all 1s cubic-bezier(0.4,0,0.2,1)' }} />
          ))}

          {/* Labels */}
          {angles.map((angle, i) => {
            const pos = toPoint(angle, maxR + 24)
            const val = values[i]
            const color = val >= 70 ? '#22c55e' : val >= 45 ? '#f59e0b' : '#ef4444'
            return (
              <g key={i}>
                <text x={pos.x} y={pos.y - 4} textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontFamily="sans-serif">
                  {labels[i]}
                </text>
                <text x={pos.x} y={pos.y + 10} textAnchor="middle" fontSize="12" fontWeight="600" fill={color} fontFamily="sans-serif">
                  {val}
                </text>
              </g>
            )
          })}

          {/* Centre score */}
          <text x={cx} y={cy - 10} textAnchor="middle" fontSize="28" fontWeight="700" fill={scoreColor} fontFamily="sans-serif">
            {overall}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontFamily="sans-serif">
            Overall
          </text>
        </svg>
      </div>

      <div className="score-breakdown">
        {labels.map((label, i) => {
          const val = values[i]
          const color = val >= 70 ? 'var(--green)' : val >= 45 ? 'var(--amber)' : 'var(--red)'
          return (
            <div key={label} className="score-row">
              <span className="score-row-label">{label}</span>
              <div className="score-bar-wrap">
                <div className="score-bar-track">
                  <div className="score-bar-fill" style={{ width: animated ? `${val}%` : '0%', background: color }} />
                </div>
                <span className="score-val" style={{ color }}>{val}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
