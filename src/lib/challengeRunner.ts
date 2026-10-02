import { getSqlInstance } from './db'
import { parseSqlError } from './sqlErrorParser'
import type { Challenge, TestResult } from '../types/challenges'

function areValuesEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (a === null || b === null || a === undefined || b === undefined) return a === b

  // Handle numbers with floating point tolerance
  const numA = Number(a)
  const numB = Number(b)
  if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
    return Math.abs(numA - numB) < 0.001
  }

  // String comparison trimmed and normalized
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase()
}

export async function runChallengeTest(
  challenge: Challenge,
  userSql: string
): Promise<TestResult> {
  if (!userSql || !userSql.trim()) {
    return {
      success: false,
      error: 'Please enter a SQL query before running the test.',
      executionTimeMs: 0,
      userColumns: [],
      userRows: [],
      expectedColumns: [],
      expectedRows: [],
    }
  }

  const sqlInstance = await getSqlInstance()
  const db = new sqlInstance.Database()

  try {
    // 1. Run setup SQL
    db.run(challenge.setupSql)

    // 2. Run reference solution
    let expectedColumns: string[] = []
    let expectedRows: any[][] = []
    try {
      const solutionRes = db.exec(challenge.solutionSql)
      if (solutionRes.length > 0) {
        expectedColumns = solutionRes[0].columns
        expectedRows = solutionRes[0].values
      }
    } catch (solErr: any) {
      console.error('Challenge solution SQL evaluation error:', solErr)
    }

    // 3. Run user SQL with timing
    const start = performance.now()
    let userColumns: string[] = []
    let userRows: any[][] = []

    try {
      const userRes = db.exec(userSql)
      const elapsed = performance.now() - start

      if (!userRes || userRes.length === 0) {
        return {
          success: false,
          error: 'Your query executed successfully, but returned 0 rows / no result set.',
          executionTimeMs: elapsed,
          userColumns: [],
          userRows: [],
          expectedColumns,
          expectedRows,
          totalRowsUser: 0,
          totalRowsExpected: expectedRows.length,
          mismatchReason: `Expected ${expectedRows.length} rows, but received 0 rows.`,
        }
      }

      userColumns = userRes[0].columns
      userRows = userRes[0].values

      // 4. Verification Check: Column Count
      if (userColumns.length !== expectedColumns.length) {
        return {
          success: false,
          executionTimeMs: elapsed,
          userColumns,
          userRows,
          expectedColumns,
          expectedRows,
          totalRowsUser: userRows.length,
          totalRowsExpected: expectedRows.length,
          mismatchReason: `Expected ${expectedColumns.length} columns (${expectedColumns.join(
            ', '
          )}), but your query returned ${userColumns.length} columns (${userColumns.join(', ')}).`,
        }
      }

      // 5. Verification Check: Row Count
      if (userRows.length !== expectedRows.length) {
        return {
          success: false,
          executionTimeMs: elapsed,
          userColumns,
          userRows,
          expectedColumns,
          expectedRows,
          totalRowsUser: userRows.length,
          totalRowsExpected: expectedRows.length,
          mismatchReason: `Expected ${expectedRows.length} rows, but your query returned ${userRows.length} rows.`,
        }
      }

      // 6. Verification Check: Row Values
      const orderMatters = challenge.orderMatters ?? true

      if (orderMatters) {
        for (let r = 0; r < expectedRows.length; r++) {
          for (let c = 0; c < expectedColumns.length; c++) {
            const expVal = expectedRows[r][c]
            const usrVal = userRows[r][c]
            if (!areValuesEqual(expVal, usrVal)) {
              return {
                success: false,
                executionTimeMs: elapsed,
                userColumns,
                userRows,
                expectedColumns,
                expectedRows,
                totalRowsUser: userRows.length,
                totalRowsExpected: expectedRows.length,
                mismatchReason: `Mismatch at row ${r + 1}, column "${
                  expectedColumns[c]
                }": expected "${expVal}", but got "${usrVal}".`,
              }
            }
          }
        }
      } else {
        // Order doesn't matter: find 1-to-1 match for every row
        const matched = new Set<number>()
        for (let r = 0; r < expectedRows.length; r++) {
          let foundMatch = false
          for (let u = 0; u < userRows.length; u++) {
            if (matched.has(u)) continue
            const allColsMatch = expectedColumns.every((_, c) =>
              areValuesEqual(expectedRows[r][c], userRows[u][c])
            )
            if (allColsMatch) {
              matched.add(u)
              foundMatch = true
              break
            }
          }
          if (!foundMatch) {
            return {
              success: false,
              executionTimeMs: elapsed,
              userColumns,
              userRows,
              expectedColumns,
              expectedRows,
              totalRowsUser: userRows.length,
              totalRowsExpected: expectedRows.length,
              mismatchReason: `Expected row values not found in your output: ${JSON.stringify(
                expectedRows[r]
              )}`,
            }
          }
        }
      }

      // Everything matched!
      return {
        success: true,
        executionTimeMs: elapsed,
        userColumns,
        userRows,
        expectedColumns,
        expectedRows,
        totalRowsUser: userRows.length,
        totalRowsExpected: expectedRows.length,
      }
    } catch (queryErr: any) {
      const elapsed = performance.now() - start
      const rawMsg = queryErr?.message || String(queryErr)
      const parsed = parseSqlError(userSql, rawMsg)
      const formattedError = parsed.cause
        ? `${parsed.cause}${parsed.suggestion ? ` — ${parsed.suggestion}` : ''}`
        : rawMsg

      return {
        success: false,
        error: formattedError,
        executionTimeMs: elapsed,
        userColumns: [],
        userRows: [],
        expectedColumns,
        expectedRows,
      }
    }
  } finally {
    db.close()
  }
}
