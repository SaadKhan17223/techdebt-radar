const BASE = 'https://api.github.com'

export interface RepoTree {
  path: string
  size?: number
  type: string
  sha: string
}

export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  const clean = url.trim().replace(/\.git$/, '').replace(/\/$/, '')
  const match = clean.match(/github\.com[/:]([\w.-]+)\/([\w.-]+)/)
  if (!match) return null
  return { owner: match[1], repo: match[2] }
}

async function ghFetch(path: string, token?: string) {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { headers })
  if (res.status === 404) throw new Error('Repository not found or is private.')
  if (res.status === 403) throw new Error('GitHub API rate limit hit. Add a GitHub token for higher limits.')
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  return res.json()
}

export async function getRepoMeta(owner: string, repo: string, token?: string) {
  return ghFetch(`/repos/${owner}/${repo}`, token)
}

export async function getRepoTree(owner: string, repo: string, token?: string): Promise<RepoTree[]> {
  const data = await ghFetch(`/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`, token)
  return data.tree ?? []
}

export async function getFileContent(owner: string, repo: string, path: string, token?: string): Promise<string> {
  const data = await ghFetch(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, token)
  if (data.encoding === 'base64') {
    return atob(data.content.replace(/\n/g, ''))
  }
  return data.content ?? ''
}

export async function getLatestNpmVersion(pkg: string): Promise<string | null> {
  try {
    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg)}/latest`)
    if (!res.ok) return null
    const data = await res.json()
    return data.version ?? null
  } catch {
    return null
  }
}
