import type { SqlErrorDetails } from '../types/sql'

// Common SQL keyword typo suggestions
const KEYWORD_TYPOS: Record<string, string> = {
  SELEC: 'SELECT',
  SELECTT: 'SELECT',
  FROMM: 'FROM',
  FOM: 'FROM',
  FRM: 'FROM',
  WHER: 'WHERE',
  WHRE: 'WHERE',
  WHEREFORE: 'WHERE',
  HAVNG: 'HAVING',
  HAVIN: 'HAVING',
  GROP: 'GROUP',
  GROPU: 'GROUP',
  ORDERR: 'ORDER',
  ODER: 'ORDER',
  LIMT: 'LIMIT',
  LIMTI: 'LIMIT',
  JION: 'JOIN',
  JOI: 'JOIN',
  INER: 'INNER',
  LEFTT: 'LEFT',
  RIGTH: 'RIGHT',
  VALUS: 'VALUES',
  VALEUS: 'VALUES',
  INSRT: 'INSERT',
  UPDAT: 'UPDATE',
  DELTE: 'DELETE',
  DELET: 'DELETE',
  DISTNCT: 'DISTINCT',
  DISTINC: 'DISTINCT',
  DATABSE: 'DATABASE',
  TABEL: 'TABLE',
  TALBE: 'TABLE',
}

export function parseSqlError(rawQuery: string, rawErrorMessage: string): SqlErrorDetails {
  const query = rawQuery || ''
  const lines = query.split(/\r?\n/)
  const errMsg = rawErrorMessage || 'Unknown SQL error'

  let line = 1
  let column = 1
  let token: string | null = null
  let category: SqlErrorDetails['category'] = 'Execution Error'
  let cause = errMsg
  let suggestion = 'Check your SQL syntax and table schema.'

  // Regex patterns for SQLite error signatures
  const nearMatch = errMsg.match(/near\s+["']([^"']+)["']:\s*syntax error/i)
  const noTableMatch = errMsg.match(/no such table:\s*([a-zA-Z0-9_\-\.]+)/i)
  const noColMatch = errMsg.match(/no such column:\s*([a-zA-Z0-9_\-\.]+)/i)
  const tableExistsMatch = errMsg.match(/table\s+["']?([a-zA-Z0-9_\-\.]+)["']?\s+already exists/i)
  const uniqueMatch = errMsg.match(/UNIQUE constraint failed:\s*([a-zA-Z0-9_\-\.]+)/i)
  const notNullMatch = errMsg.match(/NOT NULL constraint failed:\s*([a-zA-Z0-9_\-\.]+)/i)
  const checkMatch = errMsg.match(/CHECK constraint failed:\s*([a-zA-Z0-9_\-\.]+)/i)
  const fkMatch = errMsg.match(/FOREIGN KEY constraint failed/i)
  const ambiguousMatch = errMsg.match(/ambiguous column name:\s*([a-zA-Z0-9_\-\.]+)/i)
  const unrecTokenMatch = errMsg.match(/unrecognized token:\s*["']([^"']+)["']/i)
  const incompleteMatch = errMsg.match(/incomplete input/i)
  const aggregateMatch = errMsg.match(/misuse of aggregate:?\s*([a-zA-Z0-9_\-\(\)]+)?/i)

  if (nearMatch) {
    category = 'Syntax Error'
    token = nearMatch[1]
    const upperToken = token.toUpperCase()

    if (upperToken === 'DATABASE') {
      cause = 'SQLite does not support "CREATE DATABASE" or "USE <db>".'
      suggestion =
        'In SQLite, each file or workspace is its own database. Select your database from the header dropdown, or run CREATE TABLE directly.'
    } else if (upperToken === 'FROM') {
      cause = 'Unexpected "FROM" keyword. There is likely an extra comma or missing expression.'
      suggestion =
        'Check the SELECT clause right before "FROM" — ensure there is no trailing comma (",") after the last selected column.'
    } else if (KEYWORD_TYPOS[upperToken]) {
      const correction = KEYWORD_TYPOS[upperToken]
      cause = `Syntax error near "${token}". Misspelled SQL keyword.`
      suggestion = `Did you mean "${correction}" instead of "${token}"?`
    } else if (token === '=' || token === '==') {
      cause = `Syntax error near "${token}". Invalid comparison operator syntax.`
      suggestion = 'Check for repeated operators like "= =" or missing column names before "=". Use "=" for SQL equality.'
    } else if (token === ',') {
      cause = 'Unexpected comma (",").'
      suggestion =
        'Check for an extra comma at the end of a list, double commas (",,"), or a comma where an operator was expected.'
    } else if (token === ')') {
      cause = 'Unexpected closing parenthesis ")".'
      suggestion = 'Check for an unmatched closing parenthesis or a missing column/value inside the expression.'
    } else if (token === '(') {
      cause = 'Unexpected opening parenthesis "(". '
      suggestion = 'Check for missing function names, missing subquery keywords, or misplaced parentheses.'
    } else {
      cause = `Syntax error near "${token}". Unexpected token or invalid clause.`
      suggestion = `Check for typos, missing commas, unclosed quotes, or keywords placed out of order around "${token}".`
    }
  } else if (noTableMatch) {
    category = 'Schema Error'
    token = noTableMatch[1].replace(/["']/g, '')
    cause = `Table "${token}" does not exist in the active database.`
    suggestion = `Verify the table name in the sidebar "Tables" tab, switch to the database where this table exists, or run CREATE TABLE "${token}" (...);`
  } else if (noColMatch) {
    category = 'Schema Error'
    token = noColMatch[1].replace(/["']/g, '')
    cause = `Column "${token}" does not exist in the referenced table(s).`
    suggestion = `Check column spelling in the Tables tab, or prefix the column with its table alias (e.g., table_name.${token}).`
  } else if (tableExistsMatch) {
    category = 'Schema Error'
    token = tableExistsMatch[1].replace(/["']/g, '')
    cause = `Table "${token}" already exists in the active database.`
    suggestion = `Use 'CREATE TABLE IF NOT EXISTS "${token}" ...' or run 'DROP TABLE IF EXISTS "${token}";' first.`
  } else if (uniqueMatch) {
    category = 'Constraint Error'
    token = uniqueMatch[1]
    cause = `Duplicate value violates UNIQUE constraint on "${token}".`
    suggestion =
      'The value being inserted already exists in a unique column. Use a unique value or consider INSERT OR REPLACE / ON CONFLICT.'
  } else if (notNullMatch) {
    category = 'Constraint Error'
    token = notNullMatch[1]
    cause = `Column "${token}" cannot be NULL.`
    suggestion = `Provide a non-null value for "${token}", or alter the table schema to allow NULL values.`
  } else if (checkMatch) {
    category = 'Constraint Error'
    token = checkMatch[1]
    cause = `Inserted value violates the CHECK constraint on "${token}".`
    suggestion = 'Ensure your data satisfies the allowed values or range specified by the table CHECK condition.'
  } else if (fkMatch) {
    category = 'Constraint Error'
    cause = 'FOREIGN KEY constraint failed.'
    suggestion =
      'The referenced parent row does not exist in the parent table. Insert the parent record first before referencing it.'
  } else if (ambiguousMatch) {
    category = 'Schema Error'
    token = ambiguousMatch[1]
    cause = `Column "${token}" is ambiguous (it exists in more than one joined table).`
    suggestion = `Disambiguate by prefixing the column with its table name or alias (e.g., users.${token}).`
  } else if (unrecTokenMatch) {
    category = 'Syntax Error'
    token = unrecTokenMatch[1]
    cause = `Unrecognized character or token "${token}".`
    suggestion =
      'Check for invalid characters, non-standard quotes (like curly quotes “” or ‘’), or characters pasted from rich text editors.'
  } else if (incompleteMatch) {
    category = 'Syntax Error'
    cause = 'Incomplete SQL statement.'
    suggestion =
      'The query ends abruptly. Check for unclosed single quotes (\'), double quotes ("), unclosed parentheses ( ), or a missing clause.'
    line = lines.length
  } else if (aggregateMatch) {
    category = 'Syntax Error'
    token = aggregateMatch[1] || 'aggregate function'
    cause = `Misuse of aggregate function ${token}.`
    suggestion =
      'Aggregate functions (COUNT, SUM, AVG, MAX, MIN) cannot appear directly in a WHERE clause. Use a HAVING clause or subquery instead.'
  }

  // Find line number and column if token was detected
  if (token) {
    const cleanToken = token.includes('.') ? token.split('.').pop()! : token
    const escaped = cleanToken.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

    // 1. Try word-boundary match
    const wordRegex = new RegExp(`\\b${escaped}\\b`, 'i')
    let foundLine = -1
    let foundCol = -1

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(wordRegex)
      if (match && match.index !== undefined) {
        foundLine = i + 1
        foundCol = match.index + 1
        break
      }
    }

    // 2. Try substring match (for symbols, punctuation, or non-word tokens)
    if (foundLine === -1) {
      for (let i = 0; i < lines.length; i++) {
        const idx = lines[i].toLowerCase().indexOf(cleanToken.toLowerCase())
        if (idx !== -1) {
          foundLine = i + 1
          foundCol = idx + 1
          break
        }
      }
    }

    if (foundLine !== -1) {
      line = foundLine
      column = foundCol
    }
  }

  // If incomplete input or trailing error, highlight the last non-empty line
  if (errMsg.toLowerCase().includes('incomplete') && lines.length > 0) {
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim().length > 0) {
        line = i + 1
        column = lines[i].length + 1
        break
      }
    }
  }

  const safeLineIdx = Math.max(0, Math.min(line - 1, lines.length - 1))
  const fullLine = lines[safeLineIdx] || ''
  const lineContent = fullLine.trim()

  return {
    line,
    column,
    token,
    category,
    cause,
    suggestion,
    lineContent,
    fullLine,
    rawError: errMsg,
  }
}
