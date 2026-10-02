import React, { useState, useEffect } from 'react'
import {
  X,
  Table as TableIcon,
  Key,
  Link,
  Copy,
  Check,
} from 'lucide-react'
import type { TableSchema, QueryResult } from '../../types/sql'
import { executeQuery } from '../../lib/db'

interface TableDetailsModalProps {
  table: TableSchema | null
  onClose: () => void
  onQueryTable: (tableName: string) => void
}

export const TableDetailsModal: React.FC<TableDetailsModalProps> = ({
  table,
  onClose,
  onQueryTable,
}) => {
  const [activeTab, setActiveTab] = useState<'columns' | 'ddl' | 'preview'>('columns')
  const [copiedDdl, setCopiedDdl] = useState(false)
  const [previewResult, setPreviewResult] = useState<QueryResult | null>(null)

  useEffect(() => {
    if (!table) return
    try {
      const res = executeQuery(`SELECT * FROM "${table.name}" LIMIT 25;`)
      setPreviewResult(res)
    } catch {
      setPreviewResult(null)
    }
  }, [table])

  if (!table) return null

  const handleCopyDdl = () => {
    navigator.clipboard.writeText(table.sql)
    setCopiedDdl(true)
    setTimeout(() => setCopiedDdl(false), 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-white dark:bg-[#14161f] border border-slate-200 dark:border-neutral-800 rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-xs">
        {/* Header */}
        <div className="h-14 px-4 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between bg-slate-50 dark:bg-[#0e1017]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <TableIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-900 dark:text-white font-mono">{table.name}</span>
                <span className="text-[10px] text-slate-600 dark:text-neutral-400 bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 px-1.5 py-0.5 rounded font-mono font-medium">
                  {table.rowCount} rows
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                {table.columns.length} columns • {table.foreignKeys.length} foreign keys
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onQueryTable(table.name)
                onClose()
              }}
              className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shadow-sm"
            >
              Open in Editor
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="h-10 px-4 bg-slate-100/60 dark:bg-[#10121a] border-b border-slate-200 dark:border-neutral-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('columns')}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              activeTab === 'columns'
                ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white font-semibold shadow-xs'
                : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
            }`}
          >
            Columns & Schema ({table.columns.length})
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white font-semibold shadow-xs'
                : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
            }`}
          >
            Data Sample Preview (25 rows)
          </button>
          <button
            onClick={() => setActiveTab('ddl')}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              activeTab === 'ddl'
                ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white font-semibold shadow-xs'
                : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
            }`}
          >
            CREATE TABLE DDL
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 select-text bg-white dark:bg-[#14161f]">
          {activeTab === 'columns' && (
            <div className="border border-slate-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-[#0c0d12]">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-slate-100 dark:bg-[#12141c] text-slate-700 dark:text-neutral-300 border-b border-slate-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-3 py-2 border-r border-slate-200 dark:border-neutral-800/60 font-semibold">Column</th>
                    <th className="px-3 py-2 border-r border-slate-200 dark:border-neutral-800/60 font-semibold">Type</th>
                    <th className="px-3 py-2 border-r border-slate-200 dark:border-neutral-800/60 font-semibold">Key</th>
                    <th className="px-3 py-2 border-r border-slate-200 dark:border-neutral-800/60 font-semibold">Nullable</th>
                    <th className="px-3 py-2 font-semibold">Default</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/40 text-slate-800 dark:text-neutral-300">
                  {table.columns.map((col) => {
                    const fk = table.foreignKeys.find((k) => k.from === col.name)
                    return (
                      <tr key={col.cid} className="hover:bg-slate-50 dark:hover:bg-neutral-800/30">
                        <td className="px-3 py-1.5 font-semibold text-slate-900 dark:text-white border-r border-slate-200/80 dark:border-neutral-800/40">
                          {col.name}
                        </td>
                        <td className="px-3 py-1.5 text-cyan-600 dark:text-cyan-400 border-r border-slate-200/80 dark:border-neutral-800/40 font-medium">
                          {col.type || 'ANY'}
                        </td>
                        <td className="px-3 py-1.5 border-r border-slate-200/80 dark:border-neutral-800/40">
                          {col.pk === 1 && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              <Key className="w-2.5 h-2.5" /> PRIMARY KEY
                            </span>
                          )}
                          {fk && (
                            <span className="inline-flex items-center gap-1 text-[9px] text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                              <Link className="w-2.5 h-2.5" /> FK → {fk.table}({fk.to})
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-1.5 border-r border-slate-200/80 dark:border-neutral-800/40 text-slate-500 dark:text-neutral-400">
                          {col.notnull ? 'NOT NULL' : 'NULLABLE'}
                        </td>
                        <td className="px-3 py-1.5 text-slate-500 dark:text-neutral-400">
                          {col.dflt_value !== null ? String(col.dflt_value) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'preview' && (
            <div>
              {previewResult && previewResult.values.length > 0 ? (
                <div className="border border-slate-200 dark:border-neutral-800 rounded-lg overflow-x-auto bg-white dark:bg-[#0c0d12]">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="bg-slate-100 dark:bg-[#12141c] text-slate-700 dark:text-neutral-300 border-b border-slate-200 dark:border-neutral-800">
                      <tr>
                        {previewResult.columns.map((c) => (
                          <th key={c} className="px-3 py-1.5 border-r border-slate-200 dark:border-neutral-800/60 whitespace-nowrap font-semibold">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/40 text-slate-800 dark:text-neutral-300">
                      {previewResult.values.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-neutral-800/30">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-3 py-1 border-r border-slate-200/80 dark:border-neutral-800/40 truncate max-w-[180px]">
                              {cell === null ? (
                                <span className="italic text-slate-400 dark:text-neutral-500">NULL</span>
                              ) : (
                                String(cell)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 dark:text-neutral-500">
                  No records stored in this table
                </div>
              )}
            </div>
          )}

          {activeTab === 'ddl' && (
            <div className="relative">
              <button
                onClick={handleCopyDdl}
                className="absolute right-3 top-3 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 text-xs border border-slate-200 dark:border-neutral-700 transition-colors shadow-xs"
              >
                {copiedDdl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy DDL</span>
                  </>
                )}
              </button>
              <pre className="p-4 rounded-lg bg-slate-50 dark:bg-[#0b0c11] border border-slate-200 dark:border-neutral-800 font-mono text-xs text-slate-900 dark:text-neutral-200 overflow-x-auto leading-relaxed">
                {table.sql}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
