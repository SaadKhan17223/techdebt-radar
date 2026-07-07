import Groq from 'groq-sdk'
import type { Dependency, FileHotspot, HealthScores, RoadmapItem } from './types'

interface GroqAnalysisResult {
  scores: HealthScores
  summary: string
  roadmap: RoadmapItem[]
  dependency_risks: Record<string, string>
}

export async function runAIAnalysis(
  groqApiKey: string,
  repoName: string,
  language: string,
  dependencies: Dependency[],
  hotspots: FileHotspot[],
  testRatio: number
): Promise<GroqAnalysisResult> {
  const client = new Groq({ apiKey: groqApiKey, dangerouslyAllowBrowser: true })

  const outdated = dependencies.filter(d => d.outdated)
  const critical = dependencies.filter(d => d.riskLevel === 'critical' || d.riskLevel === 'high')

  const analysisPrompt = `
You are a senior software architect performing a tech debt audit on a GitHub repository.

REPOSITORY: ${repoName}
PRIMARY LANGUAGE: ${language}

DEPENDENCY ANALYSIS:
- Total dependencies checked: ${dependencies.length}
- Outdated: ${outdated.length}
- Critical/High risk (2+ major versions behind): ${critical.length}
- Outdated packages: ${JSON.stringify(outdated.map(d => ({ name: d.name, current: d.current, latest: d.latest, majorBehind: d.majorBehind })))}

COMPLEXITY HOTSPOTS (large files):
${JSON.stringify(hotspots.map(h => ({ path: h.path, sizeKb: Math.round(h.size / 1024) })))}

TEST COVERAGE SIGNAL:
- Test file ratio: ${testRatio}% (test files vs source files)
- ${testRatio === 0 ? 'NO test files detected' : testRatio < 20 ? 'Very low test coverage' : testRatio < 50 ? 'Moderate test coverage' : 'Good test coverage'}

Based on this data, return ONLY valid JSON, no markdown, no explanation:

{
  "scores": {
    "dependency": <0-100, lower = more outdated>,
    "security": <0-100, based on vulnerability risk of outdated deps>,
    "complexity": <0-100, based on hotspot file sizes>,
    "testing": <0-100, based on test ratio>
  },
  "summary": "<3-4 sentence honest assessment of codebase health. Be specific about what the biggest risks are.>",
  "roadmap": [
    {
      "priority": 1,
      "title": "<specific actionable task>",
      "why": "<why this matters — business or security impact>",
      "effort": "low" | "medium" | "high",
      "effortDays": <estimated days as integer>,
      "category": "dependency" | "security" | "complexity" | "testing"
    }
  ],
  "dependency_risks": {
    "<package_name>": "<1 sentence: what this package does, why being behind is risky, specific CVE or breaking change if known>"
  }
}

Rules:
- Generate 5-8 roadmap items, ordered by priority (1 = most urgent)
- dependency_risks: only include outdated packages, max 8 entries
- scores must reflect the actual data above — don't be generous
- Return ONLY the JSON
`.trim()

  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user' as const, content: analysisPrompt }],
    max_tokens: 3000,
    temperature: 0.2,
  })

  const raw = completion.choices[0]?.message?.content?.trim() ?? ''
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()

  try {
    return JSON.parse(cleaned) as GroqAnalysisResult
  } catch {
    throw new Error('AI analysis failed to parse. Please try again.')
  }
}
