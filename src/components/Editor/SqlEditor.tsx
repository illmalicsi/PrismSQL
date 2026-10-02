import React, { useMemo } from 'react'
import CodeMirror, { Prec } from '@uiw/react-codemirror'
import { sql, SQLite } from '@codemirror/lang-sql'
import { oneDark } from '@codemirror/theme-one-dark'
import { keymap } from '@codemirror/view'
import type { TableSchema } from '../../types/sql'
import { useTheme } from '../../context/ThemeContext'

interface SqlEditorProps {
  value: string
  onChange: (val: string) => void
  onRunQuery: () => void
  onFormatSql: () => void
  schemas: TableSchema[]
}

export const SqlEditor: React.FC<SqlEditorProps> = ({
  value,
  onChange,
  onRunQuery,
  onFormatSql,
  schemas,
}) => {
  const { theme } = useTheme()

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

  const extensions = useMemo(() => {
    return [
      sql({
        dialect: SQLite,
        schema: schemaMap,
        upperCaseKeywords: true,
      }),
      customKeymaps,
    ]
  }, [schemaMap, customKeymaps])

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#14161f] text-neutral-100 flex flex-col">
      <CodeMirror
        value={value}
        height="100%"
        theme={theme === 'dark' ? oneDark : 'light'}
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
          syntaxHighlighting: true,
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
