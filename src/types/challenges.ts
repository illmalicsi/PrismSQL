export type ChallengeTier = 'easy' | 'medium' | 'hard' | 'boss'

export interface TableColumnDef {
  name: string
  type: string
  desc: string
}

export interface TableSchemaDef {
  name: string
  columns: TableColumnDef[]
  sampleRows: Record<string, any>[]
}

export interface Challenge {
  id: string
  tier: ChallengeTier
  tierOrder: number
  title: string
  subtitle: string
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Boss'
  xp: number
  badge: string
  story?: string
  bossName?: string
  bossHp?: number
  bossAvatar?: string
  description: string
  requirements: string[]
  setupSql: string
  starterSql: string
  solutionSql: string
  hints: string[]
  tables: TableSchemaDef[]
  orderMatters?: boolean
}

export interface TestResult {
  success: boolean
  error?: string
  executionTimeMs: number
  userColumns: string[]
  userRows: any[][]
  expectedColumns: string[]
  expectedRows: any[][]
  mismatchReason?: string
  totalRowsUser?: number
  totalRowsExpected?: number
}

export interface ChallengeProgress {
  completedIds: string[]
  totalXp: number
  lastActiveChallengeId: string
  completedAt: Record<string, number> // challengeId -> timestamp
  savedSql: Record<string, string> // challengeId -> user's last typed query
  bossDefeated: boolean
}
