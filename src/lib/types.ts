export interface Dependency {
  name: string
  current: string
  latest: string
  outdated: boolean
  majorBehind: number
  riskLevel: 'critical' | 'high' | 'medium' | 'low'
  aiExplanation?: string
}

export interface FileHotspot {
  path: string
  size: number
  lastModified?: string
  type: 'large' | 'complex' | 'untested'
}

export interface RoadmapItem {
  priority: number
  title: string
  why: string
  effort: 'low' | 'medium' | 'high'
  effortDays: number
  category: 'dependency' | 'security' | 'complexity' | 'testing'
}

export interface HealthScores {
  dependency: number
  security: number
  complexity: number
  testing: number
}

export interface ScanResult {
  repoName: string
  repoUrl: string
  language: string
  scores: HealthScores
  overallScore: number
  summary: string
  dependencies: Dependency[]
  hotspots: FileHotspot[]
  roadmap: RoadmapItem[]
  testRatio: number
  totalFiles: number
  hasPackageJson: boolean
  hasPyRequirements: boolean
}

export interface ScanStep {
  id: string
  label: string
  status: 'pending' | 'running' | 'done' | 'error'
}

export type AppStep = 'input' | 'scanning' | 'results'
