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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-[#14161f] border border-neutral-800 rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-xs">
        {/* Header */}
        <div className="h-14 px-4 border-b border-neutral-800 flex items-center justify-between bg-[#0e1017]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <TableIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white font-mono">{table.name}</span>
                <span className="text-[10px] text-neutral-400 bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded font-mono">
                  {table.rowCount} rows
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
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
              className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
            >
              Open in Editor
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="h-10 px-4 bg-[#10121a] border-b border-neutral-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('columns')}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              activeTab === 'columns'
                ? 'bg-neutral-800 text-white font-medium'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Columns & Schema ({table.columns.length})
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              activeTab === 'preview'
                ? 'bg-neutral-800 text-white font-medium'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Data Sample Preview (25 rows)
          </button>
          <button
            onClick={() => setActiveTab('ddl')}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              activeTab === 'ddl'
                ? 'bg-neutral-800 text-white font-medium'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            CREATE TABLE DDL
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 select-text">
          {activeTab === 'columns' && (
            <div className="border border-neutral-800 rounded-lg overflow-hidden bg-[#0c0d12]">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-[#12141c] text-neutral-300 border-b border-neutral-800">
                  <tr>
                    <th className="px-3 py-2 border-r border-neutral-800/60">Column</th>
                    <th className="px-3 py-2 border-r border-neutral-800/60">Type</th>
                    <th className="px-3 py-2 border-r border-neutral-800/60">Key</th>
                    <th className="px-3 py-2 border-r border-neutral-800/60">Nullable</th>
                    <th className="px-3 py-2">Default</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/40 text-neutral-300">
                  {table.columns.map((col) => {
                    const fk = table.foreignKeys.find((k) => k.from === col.name)
                    return (
                      <tr key={col.cid} className="hover:bg-neutral-800/30">
                        <td className="px-3 py-1.5 font-semibold text-white border-r border-neutral-800/40">
                          {col.name}
                        </td>
                        <td className="px-3 py-1.5 text-cyan-400 border-r border-neutral-800/40">
                          {col.type || 'ANY'}
                        </td>
                        <td className="px-3 py-1.5 border-r border-neutral-800/40">
                          {col.pk === 1 && (
                            <span className="inline-flex items-center gap-1 text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              <Key className="w-2.5 h-2.5" /> PRIMARY KEY
                            </span>
                          )}
                          {fk && (
                            <span className="inline-flex items-center gap-1 text-[9px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                              <Link className="w-2.5 h-2.5" /> FK → {fk.table}({fk.to})
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-1.5 border-r border-neutral-800/40 text-neutral-400">
                          {col.notnull ? 'NOT NULL' : 'NULLABLE'}
                        </td>
                        <td className="px-3 py-1.5 text-neutral-400">
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
                <div className="border border-neutral-800 rounded-lg overflow-x-auto bg-[#0c0d12]">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="bg-[#12141c] text-neutral-300 border-b border-neutral-800">
                      <tr>
                        {previewResult.columns.map((c) => (
                          <th key={c} className="px-3 py-1.5 border-r border-neutral-800/60 whitespace-nowrap">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/40 text-neutral-300">
                      {previewResult.values.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-neutral-800/30">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-3 py-1 border-r border-neutral-800/40 truncate max-w-[180px]">
                              {cell === null ? (
                                <span className="italic text-neutral-500">NULL</span>
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
                <div className="p-8 text-center text-neutral-500">
                  No records stored in this table
                </div>
              )}
            </div>
          )}

          {activeTab === 'ddl' && (
            <div className="relative">
              <button
                onClick={handleCopyDdl}
                className="absolute right-3 top-3 flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs border border-neutral-700 transition-colors"
              >
                {copiedDdl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy DDL</span>
                  </>
                )}
              </button>
              <pre className="p-4 rounded-lg bg-[#0b0c11] border border-neutral-800 font-mono text-xs text-neutral-200 overflow-x-auto leading-relaxed">
                {table.sql}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
