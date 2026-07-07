import { useState } from 'react'

interface Props {
  groqKey: string
  githubToken: string
  onGroqKey: (k: string) => void
  onGithubToken: (k: string) => void
}

export default function ApiKeyInput({ groqKey, githubToken, onGroqKey, onGithubToken }: Props) {
  const [showGroq, setShowGroq] = useState(false)
  const [showGh, setShowGh] = useState(false)

  return (
    <div className="keys-bar">
      <div className="key-row">
        <label className="key-label">⚡ Groq API Key <span className="required">required</span></label>
        <div className="key-field">
          <input
            type={showGroq ? 'text' : 'password'}
            placeholder="Get free key at console.groq.com"
            value={groqKey}
            onChange={e => onGroqKey(e.target.value)}
            spellCheck={false}
          />
          <button type="button" onClick={() => setShowGroq(v => !v)}>{showGroq ? '🙈' : '👁'}</button>
        </div>
      </div>
      <div className="key-row">
        <label className="key-label">🐙 GitHub Token <span className="optional">optional — for private repos & higher rate limits</span></label>
        <div className="key-field">
          <input
            type={showGh ? 'text' : 'password'}
            placeholder="ghp_xxxx — only needs repo:read scope"
            value={githubToken}
            onChange={e => onGithubToken(e.target.value)}
            spellCheck={false}
          />
          <button type="button" onClick={() => setShowGh(v => !v)}>{showGh ? '🙈' : '👁'}</button>
        </div>
      </div>
      <p className="keys-hint">🔒 Keys stored in session only — never sent anywhere except their respective APIs.</p>
    </div>
  )
}
