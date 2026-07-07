import type { ScanStep } from '../lib/types'

interface Props { steps: ScanStep[] }

export default function ScanProgress({ steps }: Props) {
  return (
    <div className="scan-progress">
      <div className="radar-anim">
        <div className="radar-ring r1" />
        <div className="radar-ring r2" />
        <div className="radar-ring r3" />
        <div className="radar-dot" />
        <div className="radar-sweep" />
      </div>
      <h2>Scanning repository…</h2>
      <div className="steps-list">
        {steps.map(step => (
          <div key={step.id} className={`scan-step ${step.status}`}>
            <span className="step-icon">
              {step.status === 'done' ? '✅' :
               step.status === 'running' ? '⏳' :
               step.status === 'error' ? '❌' : '○'}
            </span>
            <span className="step-label">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
