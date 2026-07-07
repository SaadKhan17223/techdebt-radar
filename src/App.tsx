import { useState } from 'react'
import ApiKeyInput from './components/ApiKeyInput'
import ScanProgress from './components/ScanProgress'
import RadarChart from './components/RadarChart'
import DependencyTable from './components/DependencyTable'
import HotspotList from './components/HotspotList'
import RoadmapCard from './components/RoadmapCard'
import { parseRepoUrl, getRepoMeta, getRepoTree, getFileContent } from './lib/github'
import { checkNpmDependencies, parseTestFileRatio, getHotspots } from './lib/parseDeps'
import { runAIAnalysis } from './lib/groq'
import type { ScanResult, AppStep, ScanStep } from './lib/types'

const INITIAL_STEPS: ScanStep[] = [
  { id: 'repo',    label: 'Fetching repository metadata',     status: 'pending' },
  { id: 'tree',    label: 'Reading file tree',                status: 'pending' },
  { id: 'deps',    label: 'Checking dependency versions',     status: 'pending' },
  { id: 'hotspot', label: 'Identifying complexity hotspots',  status: 'pending' },
  { id: 'ai',      label: 'Running AI analysis & roadmap',    status: 'pending' },
]

function updateStep(steps: ScanStep[], id: string, status: ScanStep['status']): ScanStep[] {
  return steps.map(s => s.id === id ? { ...s, status } : s)
}

export default function App() {
  const [groqKey, setGroqKey]         = useState(() => sessionStorage.getItem('groq_key') ?? '')
  const [githubToken, setGithubToken] = useState(() => sessionStorage.getItem('gh_token') ?? '')
  const [repoUrl, setRepoUrl]         = useState('')
  const [step, setStep]               = useState<AppStep>('input')
  const [scanSteps, setScanSteps]     = useState<ScanStep[]>(INITIAL_STEPS)
  const [result, setResult]           = useState<ScanResult | null>(null)
  const [error, setError]             = useState<string | null>(null)

  const handleGroqKey = (k: string) => { setGroqKey(k); sessionStorage.setItem('groq_key', k) }
  const handleGhToken = (k: string) => { setGithubToken(k); sessionStorage.setItem('gh_token', k) }

  const canScan = groqKey.trim() && repoUrl.trim()

  const setStepStatus = (id: string, status: ScanStep['status']) =>
    setScanSteps(prev => updateStep(prev, id, status))

  const scan = async () => {
    setError(null)
    const parsed = parseRepoUrl(repoUrl)
    if (!parsed) { setError('Invalid GitHub URL. Use: https://github.com/owner/repo'); return }

    setStep('scanning')
    setScanSteps(INITIAL_STEPS)
    const token = githubToken.trim() || undefined
    const { owner, repo } = parsed

    try {
      // Step 1 — repo meta
      setStepStatus('repo', 'running')
      const meta = await getRepoMeta(owner, repo, token)
      setStepStatus('repo', 'done')

      // Step 2 — file tree
      setStepStatus('tree', 'running')
      const tree = await getRepoTree(owner, repo, token)
      const totalFiles = tree.filter(f => f.type === 'blob').length
      const hotspots = getHotspots(tree)
      const testRatio = parseTestFileRatio(tree)
      setStepStatus('tree', 'done')

      // Step 3 — dependencies
      setStepStatus('deps', 'running')
      const hasPackageJson = tree.some(f => f.path === 'package.json')
      const hasPyRequirements = tree.some(f => f.path === 'requirements.txt')
      let dependencies: Awaited<ReturnType<typeof checkNpmDependencies>> = []

      if (hasPackageJson) {
        const content = await getFileContent(owner, repo, 'package.json', token)
        dependencies = await checkNpmDependencies(content)
      }
      setStepStatus('deps', 'done')

      // Step 4 — hotspots (already done)
      setStepStatus('hotspot', 'running')
      await new Promise(r => setTimeout(r, 400)) // visual pause
      setStepStatus('hotspot', 'done')

      // Step 5 — AI analysis
      setStepStatus('ai', 'running')
      const language = meta.language ?? 'Unknown'
      const aiResult = await runAIAnalysis(groqKey, `${owner}/${repo}`, language, dependencies, hotspots, testRatio)
      setStepStatus('ai', 'done')

      // Attach AI risk explanations to deps
      const enrichedDeps = dependencies.map(d => ({
        ...d,
        aiExplanation: aiResult.dependency_risks?.[d.name],
      }))

      const overallScore = Math.round(
        (aiResult.scores.dependency + aiResult.scores.security +
         aiResult.scores.complexity + aiResult.scores.testing) / 4
      )

      setResult({
        repoName: `${owner}/${repo}`,
        repoUrl: `https://github.com/${owner}/${repo}`,
        language,
        scores: aiResult.scores,
        overallScore,
        summary: aiResult.summary,
        dependencies: enrichedDeps,
        hotspots,
        roadmap: aiResult.roadmap,
        testRatio,
        totalFiles,
        hasPackageJson,
        hasPyRequirements,
      })
      setStep('results')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed. Please try again.')
      setStep('input')
      setScanSteps(INITIAL_STEPS)
    }
  }

  const reset = () => { setStep('input'); setResult(null); setError(null); setRepoUrl('') }

  // ─── Scanning screen ────────────────────────────────────────────────────────
  if (step === 'scanning') return (
    <div className="app">
      <header className="app-header">
        <div className="logo">TechDebt <span>Radar</span></div>
      </header>
      <ScanProgress steps={scanSteps} />
    </div>
  )

  // ─── Results screen ─────────────────────────────────────────────────────────
  if (step === 'results' && result) return (
    <div className="app">
      <header className="app-header">
        <div className="logo">TechDebt <span>Radar</span></div>
        <button className="btn-secondary" onClick={reset}>← New Scan</button>
      </header>
      <main className="results-main">
        <div className="repo-banner">
          <div>
            <h2>{result.repoName}</h2>
            <span className="repo-meta">{result.language} · {result.totalFiles} files scanned</span>
          </div>
          <a href={result.repoUrl} target="_blank" rel="noreferrer" className="btn-secondary">
            View on GitHub ↗
          </a>
        </div>

        <div className="radar-wrap">
          <RadarChart scores={result.scores} overall={result.overallScore} />
        </div>

        <RoadmapCard roadmap={result.roadmap} summary={result.summary} />
        <DependencyTable dependencies={result.dependencies} />
        <HotspotList hotspots={result.hotspots} testRatio={result.testRatio} totalFiles={result.totalFiles} />

        <div className="results-footer">
          <button className="btn-secondary" onClick={reset}>← Scan Another Repo</button>
        </div>
      </main>
    </div>
  )

  // ─── Input screen ───────────────────────────────────────────────────────────
  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">TechDebt <span>Radar</span></div>
      </header>
      <main className="input-main">
        <div className="hero">
          <div className="hero-badge">AI-Powered</div>
          <h1>Scan any GitHub repo for tech debt</h1>
          <p>Get outdated dependency risks explained in plain English, complexity hotspots, and a prioritized fix roadmap — in under 30 seconds.</p>
        </div>

        <ApiKeyInput
          groqKey={groqKey} githubToken={githubToken}
          onGroqKey={handleGroqKey} onGithubToken={handleGhToken}
        />

        {error && <div className="error-banner">⚠ {error}</div>}

        <div className="repo-input-wrap">
          <label className="repo-label">GitHub Repository URL</label>
          <div className="repo-input-row">
            <input
              className="repo-input"
              type="url"
              placeholder="https://github.com/owner/repo"
              value={repoUrl}
              onChange={e => setRepoUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canScan && scan()}
            />
            <button className="btn-primary scan-btn" disabled={!canScan} onClick={scan}>
              🔍 Scan
            </button>
          </div>
          <p className="repo-hint">Works with any public repo. Add a GitHub token for private repos.</p>
        </div>

        <div className="example-repos">
          <span className="example-label">Try an example:</span>
          {[
            'facebook/react',
            'vercel/next.js',
            'vitejs/vite',
          ].map(r => (
            <button key={r} className="example-btn"
              onClick={() => setRepoUrl(`https://github.com/${r}`)}>
              {r}
            </button>
          ))}
        </div>
      </main>

      <footer className="app-footer">
        <p>Built with Groq LLaMA 3.3 70B + GitHub API · Free · Open source</p>
        <a href="https://console.groq.com" target="_blank" rel="noreferrer">Get free Groq API key →</a>
      </footer>
    </div>
  )
}
