export interface TableColumn {
  cid: number
  name: string
  type: string
  notnull: number
  dflt_value: any
  pk: number
}

export interface ForeignKey {
  id: number
  seq: number
  table: string
  from: string
  to: string
}

export interface TableSchema {
  name: string
  rowCount: number
  columns: TableColumn[]
  foreignKeys: ForeignKey[]
  sql: string
}

export interface SqlErrorDetails {
  line: number
  column: number
  token: string | null
  category: 'Syntax Error' | 'Schema Error' | 'Constraint Error' | 'Execution Error'
  cause: string
  suggestion: string
  lineContent: string
  fullLine: string
  rawError: string
}

export interface QueryResult {
  columns: string[]
  values: any[][]
  executionTimeMs: number
  rowsAffected: number
  query: string
  timestamp: number
  error?: string
  errorDetails?: SqlErrorDetails
}

export interface ExplainRow {
  addr?: number
  opcode?: string
  p1?: any
  p2?: any
  p3?: any
  p4?: any
  p5?: any
  comment?: string
  id?: number
  parent?: number
  notused?: number
  detail?: string
}

export interface HistoryItem {
  id: string
  query: string
  timestamp: number
  durationMs: number
  rowCount: number
  status: 'success' | 'error'
  error?: string
  errorDetails?: SqlErrorDetails
}

export interface SavedQuery {
  id: string
  title: string
  query: string
  description?: string
  createdAt: number
}

export interface EditorTab {
  id: string
  title: string
  query: string
}

export interface Dataset {
  id: string
  name: string
  description: string
  badge: string
  sql: string
  isCustom?: boolean
}

export interface CustomDatabase {
  id: string
  name: string
  createdAt: number
  sql?: string
}
