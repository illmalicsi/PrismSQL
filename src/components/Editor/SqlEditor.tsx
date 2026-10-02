import React, { useMemo } from 'react'
import CodeMirror, { Prec } from '@uiw/react-codemirror'
import { sql, SQLite } from '@codemirror/lang-sql'
import { keymap } from '@codemirror/view'
import { linter, type Diagnostic } from '@codemirror/lint'
import type { TableSchema, SqlErrorDetails } from '../../types/sql'
import { useTheme } from '../../context/ThemeContext'
import { getEditorThemeExtensions } from './editorThemes'

interface SqlEditorProps {
  value: string
  onChange: (val: string) => void
  onRunQuery: () => void
  onFormatSql: () => void
  schemas: TableSchema[]
  errorDetails?: SqlErrorDetails | null
}

export const SqlEditor: React.FC<SqlEditorProps> = ({
  value,
  onChange,
  onRunQuery,
  onFormatSql,
  schemas,
  errorDetails,
}) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Generate schema map for autocomplete
  const schemaMap = useMemo(() => {
    const map: Record<string, string[]> = {}
    schemas.forEach((s) => {
      map[s.name] = s.columns.map((c) => c.name)
    })
    return map
  }, [schemas])

  // Custom keymaps
  const customKeymaps = useMemo(() => {
    return Prec.highest(
      keymap.of([
        {
          key: 'Mod-Enter',
          run: () => {
            onRunQuery()
            return true
          },
        },
        {
          key: 'Shift-Mod-F',
          run: () => {
            onFormatSql()
            return true
          },
        },
      ])
    )
  }, [onRunQuery, onFormatSql])

  const themeExtensions = useMemo(() => {
    return getEditorThemeExtensions(isDark)
  }, [isDark])

  const linterExtension = useMemo(() => {
    return linter((view) => {
      if (!errorDetails || !errorDetails.line) return []
      const doc = view.state.doc
      const targetLine = Math.min(Math.max(1, errorDetails.line), doc.lines)
      const lineObj = doc.line(targetLine)
      let from = lineObj.from
      let to = lineObj.to

      if (errorDetails.token) {
        const text = lineObj.text
        const idx = text.toLowerCase().indexOf(errorDetails.token.toLowerCase())
        if (idx !== -1) {
          from = lineObj.from + idx
          to = from + errorDetails.token.length
        }
      }

      if (from === to && to < doc.length) {
        to = from + 1
      }

      const diag: Diagnostic = {
        from,
        to: Math.max(to, from + 1),
        severity: 'error',
        message: `Line ${errorDetails.line}: ${errorDetails.cause}\n💡 ${errorDetails.suggestion}`,
      }

      return [diag]
    })
  }, [errorDetails])

  const extensions = useMemo(() => {
    return [
      sql({
        dialect: SQLite,
        schema: schemaMap,
        upperCaseKeywords: true,
      }),
      customKeymaps,
      ...themeExtensions,
      linterExtension,
    ]
  }, [schemaMap, customKeymaps, themeExtensions, linterExtension])

  return (
    <div className="w-full h-full relative overflow-hidden bg-white dark:bg-[#0c0e14] text-slate-900 dark:text-slate-100 flex flex-col">
      <CodeMirror
        value={value}
        height="100%"
        theme="none"
        extensions={extensions}
        onChange={(val) => onChange(val)}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          history: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: false, // handled by our custom themeExtensions
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
        className="h-full text-[13.5px]"
      />
    </div>
  )
}
