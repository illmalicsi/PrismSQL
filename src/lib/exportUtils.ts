import type { QueryResult } from '../types/sql'

export function exportResultToCsv(result: QueryResult, filename = 'query_results.csv'): void {
  if (!result || !result.columns.length) return

  const csvRows: string[] = []
  // Header
  csvRows.push(result.columns.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))

  // Rows
  for (const row of result.values) {
    const formatted = row.map((cell) => {
      if (cell === null || cell === undefined) return ''
      return `"${String(cell).replace(/"/g, '""')}"`
    })
    csvRows.push(formatted.join(','))
  }

  const blob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, filename)
}

export function exportResultToJson(result: QueryResult, filename = 'query_results.json'): void {
  if (!result || !result.columns.length) return

  const data = result.values.map((row) => {
    const obj: Record<string, any> = {}
    result.columns.forEach((col, idx) => {
      obj[col] = row[idx]
    })
    return obj
  })

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  downloadBlob(blob, filename)
}

export function formatResultAsMarkdown(result: QueryResult): string {
  if (!result || !result.columns.length) return ''

  const headers = result.columns
  const headerRow = `| ${headers.join(' | ')} |`
  const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`

  const bodyRows = result.values.map((row) => {
    return `| ${row
      .map((val) => (val === null || val === undefined ? '*NULL*' : String(val).replace(/\|/g, '\\|')))
      .join(' | ')} |`
  })

  return [headerRow, separatorRow, ...bodyRows].join('\n')
}

export function formatResultAsInserts(result: QueryResult, tableName = 'result_table'): string {
  if (!result || !result.columns.length) return ''

  const cols = result.columns.map((c) => `"${c}"`).join(', ')
  const lines: string[] = []

  for (const row of result.values) {
    const vals = row.map((val) => {
      if (val === null || val === undefined) return 'NULL'
      if (typeof val === 'number') return val
      return `'${String(val).replace(/'/g, "''")}'`
    })
    lines.push(`INSERT INTO "${tableName}" (${cols}) VALUES (${vals.join(', ')});`)
  }

  return lines.join('\n')
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
