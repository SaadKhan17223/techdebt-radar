import { getLatestNpmVersion } from './github'
import type { Dependency } from './types'

function cleanVersion(v: string): string {
  return v.replace(/[\^~>=<\s]/g, '').split(' ')[0].split('||')[0].trim()
}

function getMajorVersion(v: string): number {
  return parseInt(cleanVersion(v).split('.')[0]) || 0
}

function getRiskLevel(majorBehind: number): Dependency['riskLevel'] {
  if (majorBehind >= 3) return 'critical'
  if (majorBehind >= 2) return 'high'
  if (majorBehind >= 1) return 'medium'
  return 'low'
}

export async function checkNpmDependencies(packageJsonContent: string): Promise<Dependency[]> {
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(packageJsonContent)
  } catch {
    return []
  }

  const allDeps: Record<string, string> = {
    ...((parsed.dependencies as Record<string, string>) ?? {}),
    ...((parsed.devDependencies as Record<string, string>) ?? {}),
  }

  // Check top 20 deps — avoid hammering npm registry
  const entries = Object.entries(allDeps).slice(0, 20)

  const results = await Promise.all(
    entries.map(async ([name, currentRaw]): Promise<Dependency> => {
      const current = cleanVersion(currentRaw)
      const latest = await getLatestNpmVersion(name)
      const latestClean = latest ? cleanVersion(latest) : current

      const currentMajor = getMajorVersion(current)
      const latestMajor = getMajorVersion(latestClean)
      const majorBehind = Math.max(0, latestMajor - currentMajor)
      const outdated = majorBehind > 0 || current !== latestClean

      return {
        name,
        current,
        latest: latestClean,
        outdated,
        majorBehind,
        riskLevel: getRiskLevel(majorBehind),
      }
    })
  )

  // Sort: most outdated first
  return results.sort((a, b) => b.majorBehind - a.majorBehind)
}

export function parseTestFileRatio(tree: { path: string; type: string }[]): number {
  const sourceFiles = tree.filter(f =>
    f.type === 'blob' &&
    /\.(ts|tsx|js|jsx|py|java|cs|go|rb)$/.test(f.path) &&
    !/node_modules|\.min\.|dist\/|build\//.test(f.path)
  ).length

  const testFiles = tree.filter(f =>
    f.type === 'blob' &&
    /\.(test|spec)\.(ts|tsx|js|jsx|py)$|__tests__|test_/.test(f.path) &&
    !/node_modules/.test(f.path)
  ).length

  if (sourceFiles === 0) return 0
  return Math.round((testFiles / sourceFiles) * 100)
}

export function getHotspots(tree: { path: string; size?: number; type: string }[]) {
  return tree
    .filter(f =>
      f.type === 'blob' &&
      f.size &&
      f.size > 15000 &&
      !/node_modules|\.min\.|dist\/|build\/|package-lock|yarn\.lock/.test(f.path) &&
      /\.(ts|tsx|js|jsx|py|cs|java|go)$/.test(f.path)
    )
    .sort((a, b) => (b.size ?? 0) - (a.size ?? 0))
    .slice(0, 8)
    .map(f => ({
      path: f.path,
      size: f.size ?? 0,
      type: 'complex' as const,
    }))
}
