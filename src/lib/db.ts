import type { Database, SqlJsStatic } from 'sql.js'
import Papa from 'papaparse'
import type { QueryResult, TableSchema, TableColumn, ForeignKey } from '../types/sql'
import { DATASETS } from '../data/datasets'

declare global {
  interface Window {
    initSqlJs?: (config?: any) => Promise<SqlJsStatic>
  }
}

let SQL: SqlJsStatic | null = null
let db: Database | null = null
let currentDatasetId = 'ecommerce'

type SchemaListener = (schema: TableSchema[]) => void
const schemaListeners: Set<SchemaListener> = new Set()

export function subscribeToSchema(listener: SchemaListener): () => void {
  schemaListeners.add(listener)
  return () => {
    schemaListeners.delete(listener)
  }
}

function notifySchemaChange() {
  if (!db) return
  const schema = getSchema()
  schemaListeners.forEach((fn) => fn(schema))
}

export async function getSqlInstance(): Promise<SqlJsStatic> {
  if (SQL) return SQL

  if (typeof window !== 'undefined' && typeof window.initSqlJs === 'function') {
    SQL = await window.initSqlJs({
      locateFile: () => '/sql-wasm.wasm',
    })
    return SQL
  }

  // Fallback: dynamically load /sql-wasm.js if not yet present
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[src="/sql-wasm.js"]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load /sql-wasm.js')))
      // If it already loaded before listener
      if (typeof window.initSqlJs === 'function') return resolve()
      return
    }
    const script = document.createElement('script')
    script.src = '/sql-wasm.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load /sql-wasm.js'))
    document.head.appendChild(script)
  })

  if (!window.initSqlJs) {
    throw new Error('SQLite WASM failed to initialize (window.initSqlJs missing)')
  }

  SQL = await window.initSqlJs({
    locateFile: () => '/sql-wasm.wasm',
  })
  return SQL
}

export async function initDatabase(datasetId = 'ecommerce'): Promise<void> {
  const sql = await getSqlInstance()
  if (db) {
    db.close()
  }
  db = new sql.Database()
  currentDatasetId = datasetId

  const dataset = DATASETS.find((d) => d.id === datasetId) || DATASETS[0]
  if (dataset && dataset.sql) {
    db.exec(dataset.sql)
  }
  notifySchemaChange()
}

export function getCurrentDatasetId(): string {
  return currentDatasetId
}

export function executeQuery(rawSql: string): QueryResult {
  if (!db) {
    throw new Error('Database is not initialized yet')
  }

  const trimmed = rawSql.trim()
  if (!trimmed) {
    return {
      columns: [],
      values: [],
      executionTimeMs: 0,
      rowsAffected: 0,
      query: '',
      timestamp: Date.now(),
    }
  }

  const startTime = performance.now()
  try {
    const res = db.exec(trimmed)
    const elapsed = Math.round((performance.now() - startTime) * 100) / 100
    const rowsModified = db.getRowsModified()

    // Check if query might have altered schema
    const upper = trimmed.toUpperCase()
    if (
      upper.includes('CREATE ') ||
      upper.includes('DROP ') ||
      upper.includes('ALTER ') ||
      upper.includes('INSERT ') ||
      upper.includes('DELETE ') ||
      upper.includes('UPDATE ')
    ) {
      notifySchemaChange()
    }

    if (res.length === 0) {
      return {
        columns: ['Status'],
        values: [[`Query executed successfully in ${elapsed}ms (${rowsModified} rows modified)`]],
        executionTimeMs: elapsed,
        rowsAffected: rowsModified,
        query: trimmed,
        timestamp: Date.now(),
      }
    }

    // Return the last statement's result (standard SQL client behavior)
    const lastResult = res[res.length - 1]
    return {
      columns: lastResult.columns,
      values: lastResult.values,
      executionTimeMs: elapsed,
      rowsAffected: lastResult.values.length,
      query: trimmed,
      timestamp: Date.now(),
    }
  } catch (err: any) {
    const elapsed = Math.round((performance.now() - startTime) * 100) / 100
    return {
      columns: [],
      values: [],
      executionTimeMs: elapsed,
      rowsAffected: 0,
      query: trimmed,
      timestamp: Date.now(),
      error: err?.message || String(err),
    }
  }
}

export function explainQuery(rawSql: string): QueryResult {
  if (!db) throw new Error('Database not initialized')
  const trimmed = rawSql.trim()
  if (!trimmed) throw new Error('Empty query cannot be explained')

  // Remove trailing semicolons
  const cleanSql = trimmed.replace(/;+$/, '')
  return executeQuery(`EXPLAIN QUERY PLAN ${cleanSql};`)
}

export function getSchema(): TableSchema[] {
  if (!db) return []

  try {
    const tablesRes = db.exec(
      `SELECT name, sql FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%' ORDER BY name;`
    )

    if (tablesRes.length === 0) return []

    const tableRows = tablesRes[0].values
    const schemas: TableSchema[] = []

    for (const [nameVal, sqlVal] of tableRows) {
      const tableName = String(nameVal)
      const tableSql = String(sqlVal || '')

      // Get columns
      const colRes = db.exec(`PRAGMA table_info("${tableName}");`)
      const columns: TableColumn[] = []
      if (colRes.length > 0) {
        for (const row of colRes[0].values) {
          columns.push({
            cid: Number(row[0]),
            name: String(row[1]),
            type: String(row[2] || 'ANY'),
            notnull: Number(row[3]),
            dflt_value: row[4],
            pk: Number(row[5]),
          })
        }
      }

      // Get foreign keys
      const fkRes = db.exec(`PRAGMA foreign_key_list("${tableName}");`)
      const foreignKeys: ForeignKey[] = []
      if (fkRes.length > 0) {
        for (const row of fkRes[0].values) {
          foreignKeys.push({
            id: Number(row[0]),
            seq: Number(row[1]),
            table: String(row[2]),
            from: String(row[3]),
            to: String(row[4]),
          })
        }
      }

      // Get row count
      let rowCount = 0
      try {
        const countRes = db.exec(`SELECT COUNT(*) FROM "${tableName}";`)
        if (countRes.length > 0 && countRes[0].values.length > 0) {
          rowCount = Number(countRes[0].values[0][0])
        }
      } catch {
        // Views might fail or be empty
      }

      schemas.push({
        name: tableName,
        rowCount,
        columns,
        foreignKeys,
        sql: tableSql,
      })
    }

    return schemas
  } catch (err) {
    console.error('Failed to get schema:', err)
    return []
  }
}

export function importCsvToTable(
  tableName: string,
  csvString: string,
  onProgress?: (progress: number) => void
): { rowCount: number; columns: string[] } {
  if (!db) throw new Error('Database not initialized')

  const sanitizedTableName = tableName
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .toLowerCase()

  if (!sanitizedTableName) {
    throw new Error('Invalid table name provided')
  }

  const parseResult = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  })

  if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
    throw new Error(`CSV parsing error: ${parseResult.errors[0].message}`)
  }

  const rows = parseResult.data as Record<string, any>[]
  if (rows.length === 0) {
    throw new Error('CSV has no data rows')
  }

  const rawHeaders = Object.keys(rows[0])
  const sanitizedHeaders = rawHeaders.map((header, idx) => {
    const clean = header.trim().replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()
    return clean || `col_${idx + 1}`
  })

  // Detect column types based on sample values
  const columnDefs = sanitizedHeaders.map((colName, idx) => {
    const rawHeader = rawHeaders[idx]
    let hasInt = false
    let hasReal = false
    let hasText = false

    for (let i = 0; i < Math.min(rows.length, 50); i++) {
      const val = rows[i][rawHeader]
      if (val === null || val === undefined || val === '') continue
      if (typeof val === 'number') {
        if (Number.isInteger(val)) hasInt = true
        else hasReal = true
      } else if (typeof val === 'boolean') {
        hasInt = true
      } else {
        hasText = true
      }
    }

    let colType = 'TEXT'
    if (hasText) colType = 'TEXT'
    else if (hasReal) colType = 'REAL'
    else if (hasInt) colType = 'INTEGER'

    return `"${colName}" ${colType}`
  })

  // Create table
  db.exec(`DROP TABLE IF EXISTS "${sanitizedTableName}";`)
  const createSql = `CREATE TABLE "${sanitizedTableName}" (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  ${columnDefs.join(
    ',\n  '
  )}\n);`
  db.exec(createSql)

  // Insert data in batch transaction
  const placeholders = sanitizedHeaders.map(() => '?').join(', ')
  const insertSql = `INSERT INTO "${sanitizedTableName}" (${sanitizedHeaders
    .map((h) => `"${h}"`)
    .join(', ')}) VALUES (${placeholders});`

  db.exec('BEGIN TRANSACTION;')
  try {
    const stmt = db.prepare(insertSql)
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const values = rawHeaders.map((h) => {
        const v = row[h]
        return v === undefined || v === '' ? null : v
      })
      stmt.run(values)
      if (onProgress && i % 100 === 0) {
        onProgress(Math.round((i / rows.length) * 100))
      }
    }
    stmt.free()
    db.exec('COMMIT;')
  } catch (insertErr) {
    db.exec('ROLLBACK;')
    throw insertErr
  }

  notifySchemaChange()
  return {
    rowCount: rows.length,
    columns: sanitizedHeaders,
  }
}

export function importSqlDump(sqlString: string): void {
  if (!db) throw new Error('Database not initialized')
  db.exec(sqlString)
  notifySchemaChange()
}

export async function importBinaryDb(fileData: Uint8Array): Promise<void> {
  const sql = await getSqlInstance()
  if (db) db.close()
  db = new sql.Database(fileData)
  currentDatasetId = 'custom'
  notifySchemaChange()
}

export function exportBinaryDb(): Uint8Array {
  if (!db) throw new Error('Database not initialized')
  return db.export()
}

export function exportSqlDump(): string {
  if (!db) throw new Error('Database not initialized')
  const schemas = getSchema()
  let dump = `-- SQLite Playground Database Dump\n-- Generated on ${new Date().toISOString()}\n\nPRAGMA foreign_keys=OFF;\nBEGIN TRANSACTION;\n\n`

  for (const table of schemas) {
    dump += `-- Table: ${table.name}\n`
    dump += `DROP TABLE IF EXISTS "${table.name}";\n`
    dump += `${table.sql};\n`

    // Dump records
    const res = db.exec(`SELECT * FROM "${table.name}";`)
    if (res.length > 0 && res[0].values.length > 0) {
      const cols = res[0].columns.map((c) => `"${c}"`).join(', ')
      for (const row of res[0].values) {
        const formattedVals = row.map((val) => {
          if (val === null || val === undefined) return 'NULL'
          if (typeof val === 'number') return val
          const str = String(val).replace(/'/g, "''")
          return `'${str}'`
        })
        dump += `INSERT INTO "${table.name}" (${cols}) VALUES (${formattedVals.join(', ')});\n`
      }
    }
    dump += '\n'
  }

  dump += 'COMMIT;\nPRAGMA foreign_keys=ON;\n'
  return dump
}
